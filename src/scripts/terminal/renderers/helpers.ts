/**
 * Shared rendering helper functions
 * Used by both Astro components and client-side terminal
 */

import type { PostData } from "../types";

/**
 * Format a date like ls -la output
 * @param date Date to format
 * @returns Formatted date string (e.g., "Jan  5 2024")
 */
export function formatDate(date: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getDate().toString().padStart(2, " ");
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${day} ${year}`;
}

/**
 * Format a title into a filename-like string
 * @param title Post title
 * @param maxLength Maximum length for the filename
 * @returns Formatted filename (e.g., "my-post-title.md")
 */
export function formatFilename(title: string, maxLength = 45): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, maxLength) + ".md"
  );
}

/**
 * Escape HTML to prevent XSS
 * @param text Text to escape
 * @returns HTML-safe string
 */
export function escapeHtml(text: string): string {
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  // Server-side fallback
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Escape regex special characters
 * @param str String to escape
 * @returns Regex-safe string
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Get slug from a series name
 * @param series Series name
 * @returns URL-safe slug
 */
export function seriesSlug(series: string): string {
  return series.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Get unique series names from posts
 * @param posts Array of posts
 * @returns Sorted array of unique series names
 */
export function getSeriesNames(posts: PostData[]): string[] {
  const seriesSet = new Set<string>();
  posts.forEach((p) => {
    if (p.series) seriesSet.add(p.series);
  });
  return [...seriesSet].sort();
}

/**
 * Get unique tags from posts
 * @param posts Array of posts
 * @returns Sorted array of unique tags
 */
export function getAllTags(posts: PostData[]): string[] {
  const tagSet = new Set<string>();
  posts.forEach((p) => {
    p.tags.forEach((t) => tagSet.add(t));
  });
  return [...tagSet].sort();
}

/**
 * Get tag counts from posts
 * @param posts Array of posts
 * @returns Map of tag to count
 */
export function getTagCounts(posts: PostData[]): Map<string, number> {
  const counts = new Map<string, number>();
  posts.forEach((p) => {
    p.tags.forEach((t) => {
      counts.set(t, (counts.get(t) || 0) + 1);
    });
  });
  return counts;
}

/**
 * Search posts by pattern
 * @param posts Array of posts
 * @param pattern Search pattern
 * @param caseInsensitive Whether to ignore case
 * @returns Matching posts
 */
export function searchPosts(
  posts: PostData[],
  pattern: string,
  caseInsensitive: boolean,
): PostData[] {
  const searchLower = caseInsensitive ? pattern.toLowerCase() : pattern;

  return posts.filter((post) => {
    const title = caseInsensitive ? post.title.toLowerCase() : post.title;
    const desc = caseInsensitive
      ? post.description.toLowerCase()
      : post.description;
    const tags = post.tags.map((t) => (caseInsensitive ? t.toLowerCase() : t));
    const body = caseInsensitive ? post.body.toLowerCase() : post.body;
    const series = caseInsensitive
      ? post.series?.toLowerCase() || ""
      : post.series || "";

    return (
      title.includes(searchLower) ||
      desc.includes(searchLower) ||
      tags.some((t) => t.includes(searchLower)) ||
      body.includes(searchLower) ||
      series.includes(searchLower)
    );
  });
}

/**
 * Sort posts by date (newest first)
 * @param posts Array of posts
 * @returns Sorted posts array
 */
export function sortPostsByDate(
  posts: PostData[],
  ascending = false,
): PostData[] {
  return [...posts].sort((a, b) => {
    const diff = new Date(b.date).valueOf() - new Date(a.date).valueOf();
    return ascending ? -diff : diff;
  });
}

/**
 * Group posts by series
 * @param posts Array of posts
 * @returns Map of series name to posts
 */
export function groupPostsBySeries(posts: PostData[]): Map<string, PostData[]> {
  const seriesMap = new Map<string, PostData[]>();
  posts.forEach((post) => {
    if (post.series) {
      const existing = seriesMap.get(post.series) || [];
      existing.push(post);
      seriesMap.set(post.series, existing);
    }
  });
  return seriesMap;
}

/**
 * Create a CommandContext helper object with utility functions
 */
export function createContextHelpers(posts: PostData[]) {
  return {
    getSeriesNames: () => getSeriesNames(posts),
    getAllTags: () => getAllTags(posts),
    getTagCounts: () => getTagCounts(posts),
    searchPosts: (pattern: string, caseInsensitive: boolean) =>
      searchPosts(posts, pattern, caseInsensitive),
  };
}
