/**
 * grep command - Search posts
 */

import type {
  Command,
  CommandContext,
  CommandResult,
  PostData,
} from "../types";
import { escapeHtml, escapeRegex } from "../renderers/helpers";

/**
 * Render grep output with highlighted matches
 */
function renderGrepOutput(
  matches: PostData[],
  pattern: string,
  caseInsensitive: boolean,
): string {
  const regex = new RegExp(
    `(${escapeRegex(pattern)})`,
    caseInsensitive ? "gi" : "g",
  );

  let output = `<div class="text-term-fg-dark text-sm mb-3">${matches.length} match${matches.length !== 1 ? "es" : ""} for '${escapeHtml(pattern)}'</div>`;
  output += '<div class="space-y-3">';

  matches.forEach((post) => {
    const highlightedTitle = post.title.replace(
      regex,
      '<span class="term-grep-match">$1</span>',
    );
    const highlightedDesc =
      post.description?.replace(
        regex,
        '<span class="term-grep-match">$1</span>',
      ) || "";

    output += `<div class="border-l-2 border-term-fg-dark pl-3">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-term-purple">./posts/</span>
        <a href="/posts/${post.slug}" class="text-term-cyan hover:text-term-blue">${highlightedTitle}</a>
      </div>
      ${highlightedDesc ? `<div class="text-term-fg-dark text-sm mt-1">${highlightedDesc}</div>` : ""}
      ${
        post.tags.length > 0
          ? `<div class="text-sm mt-1">${post.tags
              .map((t) => {
                const tagText = caseInsensitive ? t.toLowerCase() : t;
                const patternText = caseInsensitive ? pattern.toLowerCase() : pattern;
                return tagText.includes(patternText)
                  ? `<span class="term-grep-match">#${escapeHtml(t)}</span>`
                  : `<span class="text-term-green">#${escapeHtml(t)}</span>`;
              })
              .join(" ")}</div>`
          : ""
      }
    </div>`;
  });

  output += "</div>";
  return output;
}

export const grepCommand: Command = {
  name: "grep",
  description: "Search posts by title, description, or tags",
  usage: "grep [-i] <pattern>",
  execute(ctx: CommandContext): CommandResult {
    if (ctx.args.length === 0) {
      return {
        html: '<span class="text-term-red">grep: missing pattern</span>\n<span class="text-term-fg-dark">Usage: grep [-i] pattern</span>',
        error: true,
      };
    }

    const caseInsensitive = ctx.flags.some((f) => f.includes("i"));
    const pattern = ctx.args.join(" ");

    if (!pattern) {
      return {
        html: '<span class="text-term-red">grep: missing pattern</span>',
        error: true,
      };
    }

    const matches = ctx.searchPosts(pattern, caseInsensitive);

    if (matches.length === 0) {
      return {
        html: `<span class="text-term-red">grep: no matches found for '${escapeHtml(pattern)}'</span>`,
        error: true,
      };
    }

    return { html: renderGrepOutput(matches, pattern, caseInsensitive) };
  },
};
