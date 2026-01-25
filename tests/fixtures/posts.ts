import type { PostData } from "../../src/scripts/terminal/types";

/**
 * Mock posts data for unit testing
 */
export const mockPosts: PostData[] = [
  {
    slug: "2023-goals",
    title: "Ready, Set, Go! My Goals for a Productive and Fulfilling 2023",
    description:
      "As the new year approaches, it's natural to think about our goals and aspirations.",
    date: "2022-12-31",
    tags: ["Goals", "Productivity"],
    series: null,
    body: "As the new year approaches, it's natural to think about our goals and aspirations for the coming year...",
  },
  {
    slug: "learning-go-intro",
    title: "Learning Go - Introduction",
    description: "Getting started with the Go programming language.",
    date: "2022-12-15",
    tags: ["Go", "Programming", "Learning"],
    series: "Learning Go",
    body: "Go is a statically typed, compiled programming language designed at Google...",
  },
  {
    slug: "advent-of-code-2022-day-1",
    title: "Advent of Code 2022 - Day 1",
    description: "Solving the first day of Advent of Code 2022.",
    date: "2022-12-01",
    tags: ["Advent of Code", "Programming", "TypeScript"],
    series: "Advent of Code 2022",
    body: "Day 1 of Advent of Code 2022 involves counting calories...",
  },
  {
    slug: "advent-of-code-2022-day-2",
    title: "Advent of Code 2022 - Day 2",
    description: "Rock Paper Scissors tournament simulation.",
    date: "2022-12-02",
    tags: ["Advent of Code", "Programming", "TypeScript"],
    series: "Advent of Code 2022",
    body: "Day 2 involves simulating a Rock Paper Scissors tournament...",
  },
  {
    slug: "5-cli-tools-that-will-increase-your-velocity-and-code-quality",
    title: "5 CLI Tools That Will Increase Your Velocity and Code Quality",
    description: "Essential command-line tools for developers.",
    date: "2022-11-15",
    tags: ["CLI", "Tools", "Productivity"],
    series: null,
    body: "As developers, we spend a lot of time in the terminal. Here are 5 CLI tools...",
  },
  {
    slug: "data-structures-doubly-linked-list",
    title: "Data Structures - Doubly Linked List",
    description: "Understanding and implementing a doubly linked list.",
    date: "2022-10-20",
    tags: ["Data Structures", "Programming", "TypeScript"],
    series: "Data Structures",
    body: "A doubly linked list is a linked data structure that consists of nodes...",
  },
  {
    slug: "the-five-dysfunctions-of-a-team",
    title: "The Five Dysfunctions of a Team",
    description: "Book review and key takeaways from Patrick Lencioni's book.",
    date: "2022-09-10",
    tags: ["Books", "Leadership", "Management"],
    series: null,
    body: "The Five Dysfunctions of a Team by Patrick Lencioni is a leadership fable...",
  },
];

/**
 * Create a mock CommandContext for testing
 */
export function createMockContext(
  overrides: Partial<{
    posts: PostData[];
    currentPath: string;
    args: string[];
    flags: string[];
  }> = {},
) {
  const posts = overrides.posts ?? mockPosts;

  return {
    posts,
    currentPath: overrides.currentPath ?? "~",
    args: overrides.args ?? [],
    flags: overrides.flags ?? [],
    getSeriesNames: () => {
      const seriesSet = new Set<string>();
      posts.forEach((p) => {
        if (p.series) seriesSet.add(p.series);
      });
      return [...seriesSet].sort();
    },
    getAllTags: () => {
      const tagSet = new Set<string>();
      posts.forEach((p) => {
        p.tags.forEach((t) => tagSet.add(t));
      });
      return [...tagSet].sort();
    },
    getTagCounts: () => {
      const counts = new Map<string, number>();
      posts.forEach((p) => {
        p.tags.forEach((t) => {
          counts.set(t, (counts.get(t) || 0) + 1);
        });
      });
      return counts;
    },
    searchPosts: (pattern: string, caseInsensitive: boolean) => {
      const searchLower = caseInsensitive ? pattern.toLowerCase() : pattern;
      return posts.filter((post) => {
        const title = caseInsensitive ? post.title.toLowerCase() : post.title;
        const desc = caseInsensitive
          ? post.description.toLowerCase()
          : post.description;
        const tags = post.tags.map((t) =>
          caseInsensitive ? t.toLowerCase() : t,
        );
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
    },
  };
}

/**
 * Get posts belonging to a specific series
 */
export function getSeriesPosts(seriesName: string): PostData[] {
  return mockPosts.filter((p) => p.series === seriesName);
}

/**
 * Get posts by tag
 */
export function getPostsByTag(tag: string): PostData[] {
  return mockPosts.filter((p) => p.tags.includes(tag));
}
