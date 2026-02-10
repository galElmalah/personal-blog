/**
 * tree command - Display directory tree structure
 */

import type {
  Command,
  CommandContext,
  CommandResult,
  PostData,
} from "../types";
import {
  escapeHtml,
  formatFilename,
  getAllTags,
  getTagCounts,
  groupPostsBySeries,
  seriesSlug,
} from "../renderers/helpers";
import { resolvePath } from "./utils";

/**
 * Render root tree view
 */
function renderTreeRoot(ctx: CommandContext): string {
  const postCount = ctx.posts.length;
  const seriesNames = ctx.getSeriesNames();
  const tagCount = ctx.getAllTags().length;

  let output = '<div class="term-tree">';
  output += '<div class="text-term-blue font-medium">.</div>';
  output += `<div><span class="term-tree-branch">├── </span><span class="term-tree-dir cursor-pointer" data-cmd="tree posts/">posts/</span> <span class="text-term-fg-dark text-sm">(${postCount} files)</span></div>`;
  output += `<div><span class="term-tree-branch">├── </span><span class="term-tree-dir cursor-pointer" data-cmd="tree series/">series/</span> <span class="text-term-fg-dark text-sm">(${seriesNames.length} dirs)</span></div>`;
  output += `<div><span class="term-tree-branch">└── </span><span class="term-tree-dir cursor-pointer" data-cmd="tree tags/">tags/</span> <span class="text-term-fg-dark text-sm">(${tagCount} items)</span></div>`;
  output += `<div class="text-term-fg-dark mt-2 text-sm">3 directories, ${postCount} files</div>`;
  output += "</div>";
  return output;
}

/**
 * Render posts tree view
 */
function renderTreePosts(posts: PostData[]): string {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf(),
  );

  let output = '<div class="term-tree">';
  output += '<div class="text-term-blue font-medium">posts/</div>';

  sorted.forEach((post, idx) => {
    const isLast = idx === sorted.length - 1;
    const branch = isLast ? "└── " : "├── ";
    const filename = formatFilename(post.title);
    output += `<div><span class="term-tree-branch">${branch}</span><a href="/posts/${post.slug}" class="term-tree-file hover:text-term-cyan">${escapeHtml(filename)}</a></div>`;
  });

  output += `<div class="text-term-fg-dark mt-2 text-sm">0 directories, ${sorted.length} files</div>`;
  output += "</div>";
  return output;
}

/**
 * Render series tree view
 */
function renderTreeSeries(posts: PostData[]): string {
  const seriesMap = groupPostsBySeries(posts);
  const sortedSeries = [...seriesMap.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  let output = '<div class="term-tree">';
  output += '<div class="text-term-blue font-medium">series/</div>';

  sortedSeries.forEach(([series, seriesPosts], seriesIdx) => {
    const isLastSeries = seriesIdx === sortedSeries.length - 1;
    const branchChar = isLastSeries ? "└── " : "├── ";
    const continueChar = isLastSeries ? "    " : "│   ";
    const slug = seriesSlug(series);

    output += `<div><span class="term-tree-branch">${branchChar}</span><a href="/series/${slug}" class="term-tree-dir hover:text-term-cyan">${escapeHtml(series)}/</a></div>`;

    const sortedPosts = [...seriesPosts].sort(
      (a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf(),
    );
    sortedPosts.forEach((post, postIdx) => {
      const isLastPost = postIdx === sortedPosts.length - 1;
      const postBranch = isLastPost ? "└── " : "├── ";
      const filename = formatFilename(post.title);
      output += `<div><span class="term-tree-branch">${continueChar}${postBranch}</span><a href="/posts/${post.slug}" class="term-tree-file hover:text-term-cyan">${escapeHtml(filename)}</a></div>`;
    });
  });

  const totalFiles = [...seriesMap.values()].reduce(
    (acc, p) => acc + p.length,
    0,
  );
  output += `<div class="text-term-fg-dark mt-2 text-sm">${seriesMap.size} directories, ${totalFiles} files</div>`;
  output += "</div>";
  return output;
}

/**
 * Render tags tree view
 */
function renderTreeTags(posts: PostData[]): string {
  const tagCounts = getTagCounts(posts);
  const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);

  let output = '<div class="term-tree">';
  output += '<div class="text-term-blue font-medium">tags/</div>';

  sortedTags.forEach(([tag, count], idx) => {
    const isLast = idx === sortedTags.length - 1;
    const branch = isLast ? "└── " : "├── ";
    const slug = tag.toLowerCase().replace(/\s+/g, "-");
    output += `<div><span class="term-tree-branch">${branch}</span><a href="/tags/${slug}" class="text-term-green hover:text-term-cyan">#${escapeHtml(tag)}</a> <span class="text-term-fg-dark text-sm">(${count})</span></div>`;
  });

  output += `<div class="text-term-fg-dark mt-2 text-sm">0 directories, ${sortedTags.length} tags</div>`;
  output += "</div>";
  return output;
}

export const treeCommand: Command = {
  name: "tree",
  description: "Show directory tree structure",
  usage: "tree [path]",
  execute(ctx: CommandContext): CommandResult {
    const inputPath = ctx.args[0] || ".";

    // Resolve path relative to current directory
    const resolvedPath = resolvePath(inputPath, ctx.currentPath);
    const cleanPath = resolvedPath.replace(/\/$/, "").toLowerCase();

    // Root directory (empty resolved path means we're at root)
    if (cleanPath === "") {
      return { html: renderTreeRoot(ctx) };
    }

    if (cleanPath === "posts") {
      return { html: renderTreePosts(ctx.posts) };
    }

    if (cleanPath === "series") {
      return { html: renderTreeSeries(ctx.posts) };
    }

    if (cleanPath === "tags") {
      return { html: renderTreeTags(ctx.posts) };
    }

    return {
      html: `<span class="text-term-red">tree: '${escapeHtml(inputPath)}' not found</span>`,
      error: true,
    };
  },
};
