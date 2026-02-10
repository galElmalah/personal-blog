/**
 * ls command - List directory contents
 */

import type {
  Command,
  CommandContext,
  CommandResult,
  PostData,
} from "../types";
import { escapeHtml, formatDate, seriesSlug } from "../renderers/helpers";
import { resolvePath } from "./utils";

/**
 * Render root directory listing
 */
function renderLsRoot(ctx: CommandContext, showDetails: boolean): string {
  const postCount = ctx.posts.length;
  const seriesCount = ctx.getSeriesNames().length;
  const tagCount = ctx.getAllTags().length;

  if (showDetails) {
    return `<div class="term-ls">
      <div class="text-term-fg-dark text-sm mb-2">total 5</div>
      <div class="term-ls-entry">
        <span class="term-ls-perms">drwxr-xr-x</span>
        <span class="term-ls-name term-ls-dir cursor-pointer hover:text-term-cyan" data-cmd="cd archives">archives/</span>
        <span class="text-term-fg-dark text-sm">${postCount} files</span>
      </div>
      <div class="term-ls-entry">
        <span class="term-ls-perms">drwxr-xr-x</span>
        <span class="term-ls-name term-ls-dir cursor-pointer hover:text-term-cyan" data-cmd="ls posts/">posts/</span>
        <span class="text-term-fg-dark text-sm">${postCount} files</span>
      </div>
      <div class="term-ls-entry">
        <span class="term-ls-perms">-rwxr-xr-x</span>
        <span class="term-ls-name term-ls-dir cursor-pointer hover:text-term-cyan" data-cmd="cd search">search</span>
        <span class="text-term-fg-dark text-sm">interactive</span>
      </div>
      <div class="term-ls-entry">
        <span class="term-ls-perms">drwxr-xr-x</span>
        <span class="term-ls-name term-ls-dir cursor-pointer hover:text-term-cyan" data-cmd="ls series/">series/</span>
        <span class="text-term-fg-dark text-sm">${seriesCount} dirs</span>
      </div>
      <div class="term-ls-entry">
        <span class="term-ls-perms">drwxr-xr-x</span>
        <span class="term-ls-name term-ls-dir cursor-pointer hover:text-term-cyan" data-cmd="ls tags/">tags/</span>
        <span class="text-term-fg-dark text-sm">${tagCount} items</span>
      </div>
    </div>`;
  }

  return `<div class="flex flex-wrap gap-4">
    <span class="term-ls-dir cursor-pointer hover:text-term-cyan" data-cmd="cd archives">archives/</span>
    <span class="term-ls-dir cursor-pointer hover:text-term-cyan" data-cmd="ls posts/">posts/</span>
    <span class="term-ls-dir cursor-pointer hover:text-term-cyan" data-cmd="cd search">search</span>
    <span class="term-ls-dir cursor-pointer hover:text-term-cyan" data-cmd="ls series/">series/</span>
    <span class="term-ls-dir cursor-pointer hover:text-term-cyan" data-cmd="ls tags/">tags/</span>
  </div>`;
}

/**
 * Render posts directory listing
 */
function renderLsPosts(posts: PostData[], showDetails: boolean): string {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf(),
  );

  let output = `<div class="term-ls">
    <div class="text-term-fg-dark text-sm mb-2">total ${sorted.length}</div>`;

  sorted.forEach((post) => {
    const filename = post.slug + ".md";
    const date = formatDate(new Date(post.date));

    if (showDetails) {
      output += `<div class="term-ls-entry">
        <span class="term-ls-perms">-rw-r--r--</span>
        <a href="/posts/${post.slug}" class="term-ls-name hover:text-term-cyan" data-cmd="cat ${post.slug}">${filename}</a>
        <span class="term-ls-date">${date}</span>
      </div>`;
    } else {
      output += `<div class="term-ls-entry-simple">
        <a href="/posts/${post.slug}" class="text-term-fg hover:text-term-cyan" data-cmd="cat ${post.slug}">${filename}</a>
      </div>`;
    }
  });

  output += "</div>";
  return output;
}

/**
 * Render series directory listing
 */
function renderLsSeries(ctx: CommandContext, showDetails: boolean): string {
  const seriesNames = ctx.getSeriesNames();

  let output = `<div class="term-ls">
    <div class="text-term-fg-dark text-sm mb-2">total ${seriesNames.length}</div>`;

  seriesNames.forEach((series) => {
    const slug = seriesSlug(series);
    const count = ctx.posts.filter((p) => p.series === series).length;

    if (showDetails) {
      output += `<div class="term-ls-entry">
        <span class="term-ls-perms">drwxr-xr-x</span>
        <a href="/series/${slug}" class="term-ls-name term-ls-dir hover:text-term-cyan" data-cmd="ls series/${slug}">${escapeHtml(series)}/</a>
        <span class="text-term-fg-dark text-sm">${count} posts</span>
      </div>`;
    } else {
      output += `<div><a href="/series/${slug}" class="term-ls-dir hover:text-term-cyan" data-cmd="ls series/${slug}">${escapeHtml(series)}/</a></div>`;
    }
  });

  output += "</div>";
  return output;
}

/**
 * Render series posts listing
 */
function renderLsSeriesPosts(
  ctx: CommandContext,
  seriesName: string,
  showDetails: boolean,
): string {
  const seriesPosts = ctx.posts
    .filter(
      (p) =>
        p.series?.toLowerCase().replace(/\s+/g, "-") ===
        seriesName.toLowerCase().replace(/\s+/g, "-"),
    )
    .sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());

  if (seriesPosts.length === 0) {
    return `<span class="text-term-red">ls: cannot access 'series/${seriesName}': No such directory</span>`;
  }

  let output = `<div class="term-ls">
    <div class="text-term-fg-dark text-sm mb-2">total ${seriesPosts.length}</div>`;

  seriesPosts.forEach((post) => {
    const filename = post.slug + ".md";
    const date = formatDate(new Date(post.date));

    if (showDetails) {
      output += `<div class="term-ls-entry">
        <span class="term-ls-perms">-rw-r--r--</span>
        <a href="/posts/${post.slug}" class="term-ls-name hover:text-term-cyan" data-cmd="cat ${post.slug}">${filename}</a>
        <span class="term-ls-date">${date}</span>
      </div>`;
    } else {
      output += `<div><a href="/posts/${post.slug}" class="text-term-fg hover:text-term-cyan" data-cmd="cat ${post.slug}">${filename}</a></div>`;
    }
  });

  output += "</div>";
  return output;
}

/**
 * Render tags listing
 */
function renderLsTags(ctx: CommandContext, showDetails: boolean): string {
  const tagCounts = ctx.getTagCounts();
  const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);

  let output = `<div class="term-ls">
    <div class="text-term-fg-dark text-sm mb-2">total ${sortedTags.length} tags</div>`;

  sortedTags.forEach(([tag, count]) => {
    const slug = tag.toLowerCase().replace(/\s+/g, "-");

    if (showDetails) {
      output += `<div class="term-ls-entry">
        <span class="text-term-yellow w-8 text-right mr-4">${count.toString().padStart(3, " ")}</span>
        <a href="/tags/${slug}" class="text-term-green hover:text-term-cyan">#${escapeHtml(tag)}</a>
      </div>`;
    } else {
      output += `<a href="/tags/${slug}" class="inline-block mr-3 mb-1 text-term-green hover:text-term-cyan">#${escapeHtml(tag)}</a>`;
    }
  });

  output += "</div>";
  return output;
}

export const lsCommand: Command = {
  name: "ls",
  description: "List directory contents",
  usage: "ls [-la] [path]",
  execute(ctx: CommandContext): CommandResult {
    const showDetails = ctx.flags.some((f) => f.includes("l"));
    const inputPath = ctx.args[0] || ".";

    // Resolve path relative to current directory
    const resolvedPath = resolvePath(inputPath, ctx.currentPath);
    const cleanPath = resolvedPath.replace(/\/$/, "").toLowerCase();

    // Root directory (empty resolved path means we're at root)
    if (cleanPath === "") {
      return { html: renderLsRoot(ctx, showDetails) };
    }

    // Posts directory
    if (cleanPath === "posts") {
      return { html: renderLsPosts(ctx.posts, showDetails) };
    }

    // Series directory
    if (cleanPath === "series") {
      return { html: renderLsSeries(ctx, showDetails) };
    }

    // Tags directory
    if (cleanPath === "tags") {
      return { html: renderLsTags(ctx, showDetails) };
    }

    // Check if it's a series subdirectory
    const seriesMatch = ctx
      .getSeriesNames()
      .find(
        (s) =>
          s.toLowerCase().replace(/\s+/g, "-") ===
          cleanPath.replace("series/", ""),
      );
    if (seriesMatch || cleanPath.startsWith("series/")) {
      const seriesName = seriesMatch || cleanPath.replace("series/", "");
      return { html: renderLsSeriesPosts(ctx, seriesName, showDetails) };
    }

    return {
      html: `<span class="text-term-red">ls: cannot access '${inputPath}': No such file or directory</span>`,
      error: true,
    };
  },
  autocomplete(ctx: CommandContext, partial: string): string[] {
    const candidates: string[] = [];
    const lowerPartial = partial.toLowerCase();

    // Flag completion
    if (partial.startsWith("-")) {
      const flags = ["-l", "-la"];
      return flags.filter((f) => f.startsWith(lowerPartial));
    }

    const directories = ["archives", "posts", "search", "series", "tags"];

    // Helper to get matching series
    const getSeriesMatches = (prefix: string) => {
      const seriesSet = new Set<string>();
      ctx.posts.forEach((post) => {
        if (post.series) {
          const slug = post.series.toLowerCase().replace(/\s+/g, "-");
          if (slug.startsWith(prefix.toLowerCase())) {
            seriesSet.add(slug);
          }
        }
      });
      return [...seriesSet].sort();
    };

    // Helper to get matching tags
    const getTagMatches = (prefix: string) => {
      const tagSet = new Set<string>();
      ctx.posts.forEach((post) => {
        post.tags.forEach((tag) => {
          const slug = tag.toLowerCase().replace(/\s+/g, "-");
          if (slug.startsWith(prefix.toLowerCase())) {
            tagSet.add(slug);
          }
        });
      });
      return [...tagSet].sort();
    };

    // Helper to get matching posts
    const getPostMatches = (prefix: string) => {
      return ctx.posts
        .filter((post) =>
          post.slug.toLowerCase().startsWith(prefix.toLowerCase()),
        )
        .map((post) => post.slug)
        .sort();
    };

    // If partial contains '/', handle specific prefixes
    if (partial.includes("/")) {
      if (partial.startsWith("series/")) {
        const search = partial.slice(7);
        return getSeriesMatches(search).map((s) => `series/${s}`);
      }
      if (partial.startsWith("tags/")) {
        const search = partial.slice(5);
        return getTagMatches(search).map((t) => `tags/${t}`);
      }
      if (partial.startsWith("posts/")) {
        const search = partial.slice(6);
        return getPostMatches(search).map((p) => `posts/${p}`);
      }
      return [];
    }

    // Context-aware completion based on current path
    if (ctx.currentPath === "~/posts") {
      candidates.push(...getPostMatches(partial));
    } else if (ctx.currentPath === "~/series") {
      candidates.push(...getSeriesMatches(partial));
    } else if (ctx.currentPath === "~/tags") {
      candidates.push(...getTagMatches(partial));
    } else if (ctx.currentPath === "~") {
      directories.forEach((dir) => {
        if (dir.startsWith(lowerPartial)) {
          candidates.push(`${dir}/`);
        }
      });
    }

    return candidates;
  },
};
