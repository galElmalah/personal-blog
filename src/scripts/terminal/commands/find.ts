/**
 * find command - Find files matching a pattern
 */

import type { Command, CommandContext, CommandResult } from "../types";
import { escapeHtml, formatFilename } from "../renderers/helpers";

export const findCommand: Command = {
  name: "find",
  description: "Find posts matching pattern",
  usage: "find <pattern>",
  execute(ctx: CommandContext): CommandResult {
    const pattern = ctx.args.join(" ");

    if (!pattern) {
      // No pattern - list all posts
      const sorted = [...ctx.posts].sort(
        (a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf(),
      );

      let output = `<div class="text-term-fg-dark text-sm mb-2">${sorted.length} file(s) found:</div>`;
      output += '<div class="space-y-1">';
      sorted.forEach((post) => {
        output += `<div><span class="text-term-purple">./posts/</span><a href="/posts/${post.slug}" class="text-term-cyan hover:text-term-blue transition-colors">${formatFilename(post.title)}</a></div>`;
      });
      output += "</div>";
      return { html: output };
    }

    const matches = ctx.searchPosts(pattern, true);

    if (matches.length === 0) {
      return {
        html: `<span class="text-term-red">find: no matches for '${escapeHtml(pattern)}'</span>`,
        error: true,
      };
    }

    let output = `<div class="text-term-fg-dark text-sm mb-2">${matches.length} file(s) found:</div>`;
    output += '<div class="space-y-1">';
    matches.forEach((post) => {
      output += `<div><span class="text-term-purple">./posts/</span><a href="/posts/${post.slug}" class="text-term-cyan hover:text-term-blue transition-colors">${formatFilename(post.title)}</a></div>`;
    });
    output += "</div>";

    return { html: output };
  },
};
