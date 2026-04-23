---
title: "Benchmarking a Privacy Filter in the Agent Loop"
date: "2026-04-23T15:40:00+02:00"
author: "Gal Elmalah"
tags:
  - "AI Agents"
  - "Performance"
  - "Privacy"
description: "Benchmarking the OpenAI Privacy Filter at each trust boundary of our agent, plus a torch.compile pass and an autoresearch tuning loop."
draft: false
showToc: true
---

Bottom line first — here's what the [OpenAI Privacy Filter](https://github.com/openai/privacy-filter) (OPF) actually costs per call at each trust boundary in our agent, on a laptop CPU:

| Case | Tokens | Mean (ms) | p95 (ms) |
|---|---:|---:|---:|
| tool_arg.clean.readfile | 14 | 98 | 107 |
| tool_arg.webfetch.url_with_token | 25 | 281 | 440 |
| tool_arg.bash.curl_with_bearer | 29 | 294 | 385 |
| tool_arg.write_file.env_snippet | 35 | 402 | 692 |
| host_bcast.batch.mixed_update | 83 | 577 | 679 |
| tool_res.read.env_file | 120 | 1108 | 1353 |
| tool_res.bash.shell_log | 155 | 1573 | 1837 |
| model_req.system_prompt | 601 | 3493 | 3809 |
| tool_res.http.api_json_response | 781 | 8110 | 9160 |
| tool_res.read.code_with_hardcoded_key | 838 | 6217 | 7010 |
| tool_res.clean.typescript_file | 1627 | 10395 | 10767 |
| tool_res.read.large_file | 2696 | 15564 | 17165 |
| model_req.message_history_8k | 3847 | 25377 | 27075 |

Small stuff is 100-400 ms. 10 KB of tool output is 15 seconds. An 8 KB message history is 25 seconds. Running OPF on every agent turn, on CPU, is not happening. Running it at a few specific small boundaries is absolutely fine.

The rest of this post is how I got to that table: what I was trying to do, how I measured, what `torch.compile` changed, and what an autoresearch loop found when I pointed it at OPF's runtime knobs.

---

I've been looking at adding OPF to our agent stack, at every place data crosses a trust boundary involving the model: tool arguments going out, tool results coming back, the outbound payload to Anthropic/OpenAI, and the batched updates we stream to the renderer.

The design doc writes itself. The real question was what this actually costs per turn.

So I pulled [OPF](https://github.com/openai/privacy-filter) down, ran it locally (it's a Python package, weights cached to `~/.opf/privacy_filter` on first call, no network after that), wrote a small benchmark harness with realistic fixtures for each boundary, and measured. Then I flipped on `torch.compile` and measured again. Then I pointed an autoresearch loop at it and let it tune knobs for a while.

## What OPF is, quickly

A bidirectional token classifier, ~1.5B params, MoE with ~50M active. Eight labels — names, emails, phones, addresses, dates, URLs, account numbers, secrets. One forward pass over the whole input, then a Viterbi decode over BIOES tags. Not autoregressive, so cost is linear in input tokens. Runs on CPU or CUDA. I ran it on Apple Silicon via Metal (MPS) once I got past the basic CPU numbers.

A few links worth having open:

- [openai/privacy-filter](https://github.com/openai/privacy-filter) — the repo
- [README](https://github.com/openai/privacy-filter#readme) — labels, policy knobs, operating points, and the caveats OpenAI would like you to respect
- [Weights on HuggingFace](https://huggingface.co/openai/privacy-filter) — ~3 GB, auto-downloaded to `~/.opf/privacy_filter` on first call

The "linear in input tokens" part is worth holding onto. For most LLM work you think of latency as proportional to the output. Here it's proportional to whatever you hand it, and the input can easily be 10x larger than the output you'd normally generate.

## What I measured

Fixtures grouped by the boundary they simulate:

- `TOOL_ARG` — short model→tool argument strings (curl with bearer, webfetch URL with a token in the query string, `write_file` env snippet, plus a clean control).
- `TOOL_RES` — tool output coming back into the model's context (.env file, ~4 KB of TS with a hardcoded key, shell log, JSON customer list with PII, ~10 KB mixed file, clean control).
- `MODEL_REQ` — outbound payload to the model provider (system prompt, ~8 KB prior-turn history).
- `HOST_BCAST` — one batched update to the renderer.

All PII and credentials in the fixtures are synthetic (obviously).

Per fixture I recorded cold ms, p50/p95/p99, tokens/sec, and what OPF flagged vs. what I expected it to flag. That last one is a sanity check, not a quality eval — real quality work belongs on a labeled set, not on fixtures I made up.

> The harness lives in `scripts/privacy-filter-bench/`. `bench.py` runs against the Python package directly, `compare.py` diffs two runs, and the results below came out of `comparison.html` after aggregating four PyTorch eager runs and one compiled run.

## The raw numbers

The table at the top is PyTorch eager, Apple M-series, CPU only, 5 iterations per case, 4 runs averaged. Two things worth reading off it before moving on:

On the small stuff (`TOOL_ARG`, `HOST_BCAST`) we're at roughly 100-600 ms per call. That's fine for a boundary that's gating a network call or a disk write anyway — the filter's latency gets lost in what's happening on the other side of it.

On bigger inputs it falls apart. ~150 tok/s on CPU means a 4K-token history takes ~25 seconds, and the cost is linear — for each extra 1K tokens you pay another ~7 seconds. You can't put that in front of every outbound message without the whole thing feeling broken.

## Does torch.compile help?

Yes on the small stuff, barely on the big stuff. Which, once you stare at it for a minute, is what you'd expect — at small input sizes a lot of the wall clock is Python and dispatch overhead, and a compiled graph wipes a bunch of that out. At 15K tokens you're just computing the transformer, and the BLAS kernels under both backends are the same.

Per boundary:

| Boundary | Eager (ms) | Compiled (ms) | Speedup |
|---|---:|---:|---:|
| HOST_BCAST | 577 | 567 | 1.02× |
| MODEL_REQ | 14435 | 12820 | 1.13× |
| TOOL_ARG | 269 | 73 | **3.66×** |
| TOOL_RES | 7161 | 4697 | 1.52× |

The biggest win was `tool_arg.write_file.env_snippet` at 4.98× (402 → 81 ms). The smallest was `host_bcast.batch.mixed_update` at 1.02× (577 → 567). Overall ~1.34× mean across the 13 cases.

One honest caveat: on long inputs Dynamo kept hitting `config.recompile_limit=8` because every distinct window length is a new trace, and some late iterations fell back to eager. `dynamic=True` would probably buy some of that back.

## Tuning with autoresearch on pi

`torch.compile` is the easy lever. After that I wanted to know which of OPF's runtime knobs actually help on *our* workload, and specifically on the small `TOOL_ARG` fixtures — that's the boundary I'd ship first, so that's the one worth tuning.

I wired the bench into [pi](https://github.com/mariozechner/pi) with the [autoresearch plugin](https://github.com/mariozechner/pi-autoresearch). The loop is simple:

1. `./autoresearch.sh opf-small` runs the small suite and emits `METRIC privacy_filter_opf_tool_arg_p50_ms=…` lines.
2. The plugin proposes a candidate change (env var, flag, runtime setting), applies it, re-runs, compares against the kept baseline.
3. Keep if the metric improves, auto-revert otherwise. Everything is logged to JSONL.

33 runs, six kept:

| Run | Change | p50 (ms) | Δ |
|---:|---|---:|---|
| 6 | Baseline (CPU, Viterbi, typed output) | 190.23 | — |
| 10 | Device = MPS (Apple Metal) | 185.19 | −2.6% |
| 13 | Decode mode = argmax (was Viterbi) | 180.83 | −5% |
| 16 | `discard_overlapping_predicted_spans` | 179.10 | −5.9% |
| 25 | `OPF_EXPERTS_PER_TOKEN=3` (top-3 routing, MoE default is top-4) | 137.67 | −27.6% |
| 29 | + `OPF_ATTN_LOW_PRECISION=1` | 136.48 | −28.3% |

And a few things I thought would help but didn't:

- `OPF_ALLOW_TF32=1` was slightly *worse* on small inputs (run 32: 142.6 ms). TF32 helps when you're compute-bound on matmul, and `TOOL_ARG` just isn't that.
- `OPF_MOE_FUSED_SWIGLU_W2=0` was noise (runs 28, 31).
- A sweep of `context_window_length` from 64 to 2048 was all within run-to-run jitter (runs 17, 21-24). Short inputs don't care.

The big win was dropping MoE top-k from 4 to 3. It's a classifier, not a generator, so you don't really need the full expert mixture on every token — top-3 covered basically the same ground, and the recall on the fixtures stayed in the same band. Combined with MPS + argmax decoding + overlap discard + low-precision attention, the `TOOL_ARG` p50 went from ~190 ms to ~136 ms. Stack `torch.compile` on top of that and the cost per call starts to genuinely disappear.

> I wouldn't have found the top-k knob on my own. I'd have tried MPS, maybe one more thing, called it a day. Having the loop running in the background ("come back in an hour, see which candidates were kept") is a genuinely different way to optimize.

## Where this leaves me

Running OPF on every agent turn, on a laptop CPU, is not happening. A typical turn (1 MODEL_REQ + ~2 TOOL_ARG + ~2 TOOL_RES) burns ~29 seconds of filter time on eager CPU, ~22 seconds with `torch.compile`. You can't put that on a user and call it shipped.

But when I look at it by boundary, the story's different:

- `TOOL_ARG` is the one I'm most excited about. Small inputs, ~35 tokens, ~73 ms with `torch.compile`, ~136 ms without on the tuned MPS config. Catching a bearer token the model hallucinated into a `bash` or `web_fetch` arg *before* the call happens — for a latency that's lost in the noise of the network round-trip anyway — is a real win.
- `HOST_BCAST` is fine too. ~500 ms for display-layer redaction on a batched update is not something a user will notice.
- `TOOL_RES` is the one with a sharp edge. ~300 ms on a 500-token result is OK, ~13 seconds on a 10 KB file is not. The answer is probably bounding result size before filtering, or running a cheap regex/entropy pre-pass and only invoking OPF on suspicious spans.
- `MODEL_REQ` I'm going to treat as GPU-only for now. If you're doing (1), (2), and (3) right, the history going to the provider is already mostly clean — the outbound sweep is belt-and-suspenders, not the primary line of defence.

Next things on the list are batching (the filter is independent across inputs, so a turn with three tool calls and one Read should be one batched call, not four serial ones), and running in shadow mode for a week before turning on redaction — the recall varied from 0.25 to 1.0 across the fixtures, and that's just a wiring check, not an eval. I'd like real numbers from real traffic before I start dropping spans.

If you're doing something similar and want to skip a few days of figuring out where the cliff is, the summary is: measure at each boundary separately, the backend matters most where you think it matters least, and let an autoresearch loop try the knobs you wouldn't have thought to try.
