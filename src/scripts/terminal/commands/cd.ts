/**
 * cd command - Change directory / navigate to posts
 */

import type { Command, CommandContext, CommandResult } from "../types";
import { escapeHtml } from "../renderers/helpers";
import { resolvePath } from "./utils";

// Map of navigable directories to their routes
const DIRECTORIES: Record<string, string> = {
  posts: "/posts",
  series: "/series",
  tags: "/tags",
  archives: "/archives",
  search: "/search",
};

export const cdCommand: Command = {
  name: "cd",
  description: "Navigate to a post or section",
  usage: "cd <path>",
  execute(ctx: CommandContext): CommandResult {
    const path = ctx.args[0] || "~";
    const cleanInput = path.replace(/\/$/, "");

    // On a post detail page, "cd .." should go back like the browser back button
    if (cleanInput === ".." && typeof window !== "undefined") {
      const pathname = window.location.pathname;
      // Match /posts/<slug> (but not /posts or /posts/)
      if (/^\/posts\/[^/]+/.test(pathname)) {
        return { html: "", goBack: true };
      }
    }

    // Home directory
    if (cleanInput === "~" || cleanInput === "" || cleanInput === "/") {
      return { html: "", newPath: "~", navigate: "/" };
    }

    // Resolve the path relative to current directory
    const resolved = resolvePath(cleanInput, ctx.currentPath);
    const cleanPath = resolved.replace(/\/$/, "").toLowerCase();

    // Root directory
    if (cleanPath === "") {
      return { html: "", newPath: "~", navigate: "/" };
    }

    // Check top-level directories
    if (cleanPath in DIRECTORIES) {
      return {
        html: `<span class="text-term-fg-dark">Navigating to ${DIRECTORIES[cleanPath]}...</span>`,
        navigate: DIRECTORIES[cleanPath],
        newPath: `~/${cleanPath}`,
      };
    }

    // Check for post slug (direct or prefixed with posts/)
    let slug = cleanPath;
    if (slug.startsWith("posts/")) {
      slug = slug.slice(6);
    }

    const post = ctx.posts.find(
      (p) => p.slug.toLowerCase() === slug.toLowerCase(),
    );
    if (post) {
      return {
        html: `<span class="text-term-fg-dark">Opening ${escapeHtml(post.title)}...</span>`,
        navigate: `/posts/${post.slug}`,
      };
    }

    // Check for series (direct or prefixed with series/)
    let seriesSlug = cleanPath;
    if (seriesSlug.startsWith("series/")) {
      seriesSlug = seriesSlug.slice(7);
    }
    const series = ctx
      .getSeriesNames()
      .find((s) => s.toLowerCase().replace(/\s+/g, "-") === seriesSlug);
    if (series) {
      return {
        html: `<span class="text-term-fg-dark">Navigating to series: ${escapeHtml(series)}...</span>`,
        navigate: `/series/${seriesSlug}`,
        newPath: `~/series/${seriesSlug}`,
      };
    }

    // Check for tag (prefixed with tags/)
    if (cleanPath.startsWith("tags/")) {
      const tagSlug = cleanPath.slice(5);
      const tag = ctx.getAllTags().find(
        (t) => t.toLowerCase().replace(/\s+/g, "-") === tagSlug,
      );
      if (tag) {
        return {
          html: `<span class="text-term-fg-dark">Navigating to tag: ${escapeHtml(tag)}...</span>`,
          navigate: `/tags/${tagSlug}`,
          newPath: `~/tags/${tagSlug}`,
        };
      }
    }

    return {
      html: `<span class="text-term-red">cd: no such file or directory: ${escapeHtml(path)}</span>`,
      error: true,
    };
  },

  autocomplete(ctx: CommandContext, partial: string): string[] {
    const candidates: string[] = [];
    const lowerPartial = partial.toLowerCase();
    const directories = ['posts', 'series', 'tags', 'archives', 'search'];

    // Helper to get matching series
    const getSeriesMatches = (prefix: string) => {
      const seriesSet = new Set<string>();
      ctx.posts.forEach(post => {
        if (post.series) {
          const slug = post.series.toLowerCase().replace(/\s+/g, '-');
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
      ctx.posts.forEach(post => {
        post.tags.forEach(tag => {
          const slug = tag.toLowerCase().replace(/\s+/g, '-');
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
        .filter(post => post.slug.toLowerCase().startsWith(prefix.toLowerCase()))
        .map(post => post.slug)
        .sort();
    };

    // If partial contains '/', handle specific prefixes
    if (partial.includes('/')) {
        if (partial.startsWith('series/')) {
            const search = partial.slice(7);
            return getSeriesMatches(search).map(s => `series/${s}`);
        }
        if (partial.startsWith('tags/')) {
            const search = partial.slice(5);
            return getTagMatches(search).map(t => `tags/${t}`);
        }
        if (partial.startsWith('posts/')) {
            const search = partial.slice(6);
            return getPostMatches(search).map(p => `posts/${p}`);
        }
        return [];
    }

    // Context-aware completion based on current path
    if (ctx.currentPath === '~/posts') {
        candidates.push(...getPostMatches(partial));
    } else if (ctx.currentPath === '~/series') {
        candidates.push(...getSeriesMatches(partial));
    } else if (ctx.currentPath === '~/tags') {
        candidates.push(...getTagMatches(partial));
    } else if (ctx.currentPath === '~') {
        // At root, suggest directories AND posts (this fixes the user issue)
        directories.forEach(dir => {
            if (dir.startsWith(lowerPartial)) {
                candidates.push(`${dir}/`);
            }
        });
        
        // Also suggest posts directly if at root, since `cd <slug>` works
        candidates.push(...getPostMatches(partial));
    }

    return candidates;
  }
};
