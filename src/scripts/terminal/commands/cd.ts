/**
 * cd command - Change directory / navigate to posts
 */

import type { Command, CommandContext, CommandResult } from "../types";
import { escapeHtml } from "../renderers/helpers";
import { getParentDir } from "./utils";

export const cdCommand: Command = {
  name: "cd",
  description: "Navigate to a post or section",
  usage: "cd <path>",
  execute(ctx: CommandContext): CommandResult {
    const path = ctx.args[0] || "~";
    const cleanPath = path.replace(/\/$/, "").toLowerCase();

    // Home directory
    if (
      cleanPath === "~" ||
      cleanPath === "" ||
      cleanPath === "/"
    ) {
      return { html: "", newPath: "~" };
    }

    // Parent directory
    if (cleanPath === "..") {
      const currentDir = ctx.currentPath.replace(/^~\/?/, "");
      const parentDir = getParentDir(currentDir);
      
      // If we're at root (~), stay there
      if (ctx.currentPath === "~") {
        return { html: "", newPath: "~" };
      }
      
      // If parent is empty, go to root (~)
      if (parentDir === "") {
        return { html: "", newPath: "~", navigate: "/" };
      }
      
      // Otherwise go to parent
      return { html: "", newPath: `~/${parentDir}`, navigate: `/${parentDir}` };
    }

    // Posts page
    if (cleanPath === "posts" || cleanPath === "./posts") {
      return {
        html: '<span class="text-term-fg-dark">Navigating to /posts...</span>',
        navigate: "/posts",
      };
    }

    // Series page
    if (cleanPath === "series" || cleanPath === "./series") {
      return {
        html: '<span class="text-term-fg-dark">Navigating to /series...</span>',
        navigate: "/series",
      };
    }

    // Tags page
    if (cleanPath === "tags" || cleanPath === "./tags") {
      return {
        html: '<span class="text-term-fg-dark">Navigating to /tags...</span>',
        navigate: "/tags",
      };
    }

    // Check for post slug
    let slug = cleanPath;
    if (slug.startsWith("posts/")) {
      slug = slug.replace("posts/", "");
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

    // Check for series
    const seriesName = cleanPath.replace("series/", "");
    const series = ctx
      .getSeriesNames()
      .find((s) => s.toLowerCase().replace(/\s+/g, "-") === seriesName);
    if (series) {
      return {
        html: `<span class="text-term-fg-dark">Navigating to series: ${escapeHtml(series)}...</span>`,
        navigate: `/series/${seriesName}`,
      };
    }

    return {
      html: `<span class="text-term-red">cd: no such file or directory: ${escapeHtml(path)}</span>`,
      error: true,
    };
  },

  autocomplete(ctx: CommandContext, partial: string): string[] {
    const candidates: string[] = [];
    const lowerPartial = partial.toLowerCase();
    const directories = ['posts', 'series', 'tags'];

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
