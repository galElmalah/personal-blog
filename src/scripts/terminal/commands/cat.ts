/**
 * cat command - Display file contents / post preview
 */

import type {
  Command,
  CommandContext,
  CommandResult,
  PostData,
} from "../types";
import { escapeHtml, formatDate, formatFilename } from "../renderers/helpers";

/**
 * Render cat output for a post
 */
function renderCatOutput(post: PostData): string {
  const date = formatDate(new Date(post.date));
  const tags = post.tags
    .map(
      (t) =>
        `<a href="/tags/${t.toLowerCase()}" class="text-term-purple hover:text-term-cyan">#${t}</a>`,
    )
    .join(" ");

  return `<div class="term-cat">
    <div class="term-cat-header mb-2">
      <span class="text-term-fg-dark">---</span>
    </div>
    
    <div class="term-cat-title mb-2">
      <a href="/posts/${post.slug}" class="text-term-cyan hover:text-term-blue text-lg font-medium">${escapeHtml(post.title)}</a>
    </div>
    
    <div class="term-cat-meta text-sm mb-3">
      <span class="text-term-yellow">${date}</span>
      ${post.series ? `<span class="text-term-fg-dark mx-2">|</span><span class="text-term-purple">${escapeHtml(post.series)}</span>` : ""}
    </div>
    
    ${post.description ? `<p class="text-term-fg mb-3">${escapeHtml(post.description)}</p>` : ""}
    
    ${post.body ? `<div class="text-term-fg-dark text-sm mb-3 whitespace-pre-wrap">${escapeHtml(post.body.slice(0, 300))}${post.body.length > 300 ? "..." : ""}</div>` : ""}
    
    ${tags ? `<div class="mb-3">${tags}</div>` : ""}
    
    <div class="mt-3">
      <a href="/posts/${post.slug}" class="term-link">[Read full post →]</a>
    </div>
    
    <div class="term-cat-footer mt-2">
      <span class="text-term-fg-dark">---</span>
    </div>
  </div>`;
}

export const catCommand: Command = {
  name: "cat",
  description: "Preview a post's content",
  usage: "cat <file>",
  execute(ctx: CommandContext): CommandResult {
    if (ctx.args.length === 0) {
      return {
        html: '<span class="text-term-red">cat: missing file operand</span>',
        error: true,
      };
    }

    let slug = ctx.args[0];
    if (slug.startsWith("posts/")) {
      slug = slug.replace("posts/", "");
    }
    slug = slug.replace(/\.md$/, "");

    const post = ctx.posts.find(
      (p) =>
        p.slug.toLowerCase() === slug.toLowerCase() ||
        formatFilename(p.title).replace(".md", "") === slug.toLowerCase(),
    );

    if (!post) {
      return {
        html: `<span class="text-term-red">cat: ${escapeHtml(ctx.args[0])}: No such file or directory</span>`,
        error: true,
      };
    }

    return { html: renderCatOutput(post) };
  },
  autocomplete(ctx: CommandContext, partial: string): string[] {
    const candidates: string[] = [];
    
    // Helper to get matching posts
    const getPostMatches = (prefix: string) => {
      return ctx.posts
        .filter(post => post.slug.toLowerCase().startsWith(prefix.toLowerCase()))
        .map(post => post.slug)
        .sort();
    };

    if (partial.startsWith('posts/')) {
        const search = partial.slice(6);
        return getPostMatches(search).map(p => `posts/${p}`);
    }

    // Suggest posts directly
    candidates.push(...getPostMatches(partial));
    
    return candidates;
  }
};
