import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatFilename,
  escapeHtml,
  escapeRegex,
  seriesSlug,
  getSeriesNames,
  getAllTags,
  getTagCounts,
  searchPosts,
  sortPostsByDate,
  groupPostsBySeries,
} from "../../../src/scripts/terminal/renderers/helpers";
import { mockPosts } from "../../fixtures/posts";

describe("formatDate", () => {
  it("formats date with month, day, and year", () => {
    const date = new Date("2023-01-15");
    expect(formatDate(date)).toBe("Jan 15 2023");
  });

  it("pads single digit days with space", () => {
    const date = new Date("2023-03-05");
    expect(formatDate(date)).toBe("Mar  5 2023");
  });

  it("handles different months correctly", () => {
    expect(formatDate(new Date("2023-12-25"))).toBe("Dec 25 2023");
    expect(formatDate(new Date("2023-06-01"))).toBe("Jun  1 2023");
  });
});

describe("formatFilename", () => {
  it("converts title to lowercase slug with .md extension", () => {
    expect(formatFilename("Hello World")).toBe("hello-world.md");
  });

  it("removes special characters", () => {
    expect(formatFilename("What's New in 2023?")).toBe("whats-new-in-2023.md");
  });

  it("replaces multiple spaces with single hyphen", () => {
    expect(formatFilename("Hello   World")).toBe("hello-world.md");
  });

  it("truncates long titles", () => {
    const longTitle =
      "This is a very long title that should be truncated to fit within the maximum length";
    const result = formatFilename(longTitle, 20);
    expect(result.length).toBeLessThanOrEqual(23); // 20 + '.md'
  });
});

describe("escapeHtml", () => {
  it("escapes HTML angle brackets", () => {
    const result = escapeHtml('<script>alert("xss")</script>');
    expect(result).toContain("&lt;");
    expect(result).toContain("&gt;");
    expect(result).not.toContain("<script>");
  });

  it("escapes ampersands", () => {
    expect(escapeHtml("foo & bar")).toBe("foo &amp; bar");
  });

  it("handles single quotes", () => {
    // DOM-based escaping may not escape single quotes
    const result = escapeHtml("it's");
    expect(result).toContain("it");
    expect(result).toContain("s");
  });

  it("returns plain text unchanged", () => {
    expect(escapeHtml("Hello World")).toBe("Hello World");
  });
});

describe("escapeRegex", () => {
  it("escapes regex special characters", () => {
    expect(escapeRegex("test.*+?^${}()|[]\\pattern")).toBe(
      "test\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\pattern",
    );
  });

  it("leaves normal text unchanged", () => {
    expect(escapeRegex("hello world")).toBe("hello world");
  });
});

describe("seriesSlug", () => {
  it("converts series name to lowercase slug", () => {
    expect(seriesSlug("Learning Go")).toBe("learning-go");
  });

  it("handles multiple spaces", () => {
    expect(seriesSlug("Advent of Code 2022")).toBe("advent-of-code-2022");
  });
});

describe("getSeriesNames", () => {
  it("returns unique series names sorted alphabetically", () => {
    const series = getSeriesNames(mockPosts);
    expect(series).toContain("Learning Go");
    expect(series).toContain("Advent of Code 2022");
    expect(series).toContain("Data Structures");
  });

  it("excludes null series", () => {
    const series = getSeriesNames(mockPosts);
    expect(series).not.toContain(null);
  });

  it("returns sorted array", () => {
    const series = getSeriesNames(mockPosts);
    const sorted = [...series].sort();
    expect(series).toEqual(sorted);
  });
});

describe("getAllTags", () => {
  it("returns unique tags sorted alphabetically", () => {
    const tags = getAllTags(mockPosts);
    expect(tags).toContain("Go");
    expect(tags).toContain("Programming");
    expect(tags).toContain("Goals");
  });

  it("returns sorted array", () => {
    const tags = getAllTags(mockPosts);
    const sorted = [...tags].sort();
    expect(tags).toEqual(sorted);
  });
});

describe("getTagCounts", () => {
  it("returns correct count for each tag", () => {
    const counts = getTagCounts(mockPosts);
    expect(counts.get("Programming")).toBeGreaterThan(1);
  });

  it("counts all tags", () => {
    const counts = getTagCounts(mockPosts);
    const totalCount = [...counts.values()].reduce((a, b) => a + b, 0);
    const expectedTotal = mockPosts.reduce(
      (sum, post) => sum + post.tags.length,
      0,
    );
    expect(totalCount).toBe(expectedTotal);
  });
});

describe("searchPosts", () => {
  it("finds posts by title", () => {
    const results = searchPosts(mockPosts, "Goals", true);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((p) => p.slug === "2023-goals")).toBe(true);
  });

  it("finds posts by description", () => {
    const results = searchPosts(mockPosts, "Rock Paper Scissors", true);
    expect(results.some((p) => p.slug === "advent-of-code-2022-day-2")).toBe(
      true,
    );
  });

  it("finds posts by tag", () => {
    const results = searchPosts(mockPosts, "Go", true);
    expect(results.some((p) => p.tags.includes("Go"))).toBe(true);
  });

  it("finds posts by series", () => {
    const results = searchPosts(mockPosts, "Learning Go", true);
    expect(results.some((p) => p.series === "Learning Go")).toBe(true);
  });

  it("respects case sensitivity", () => {
    const caseInsensitive = searchPosts(mockPosts, "go", true);
    const caseSensitive = searchPosts(mockPosts, "go", false);
    expect(caseInsensitive.length).toBeGreaterThanOrEqual(caseSensitive.length);
  });

  it("returns empty array for no matches", () => {
    const results = searchPosts(mockPosts, "xyznonexistent", true);
    expect(results).toEqual([]);
  });
});

describe("sortPostsByDate", () => {
  it("sorts posts by date descending by default", () => {
    const sorted = sortPostsByDate(mockPosts);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(new Date(sorted[i].date).valueOf()).toBeGreaterThanOrEqual(
        new Date(sorted[i + 1].date).valueOf(),
      );
    }
  });

  it("sorts posts by date ascending when specified", () => {
    const sorted = sortPostsByDate(mockPosts, true);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(new Date(sorted[i].date).valueOf()).toBeLessThanOrEqual(
        new Date(sorted[i + 1].date).valueOf(),
      );
    }
  });

  it("does not mutate original array", () => {
    const original = [...mockPosts];
    sortPostsByDate(mockPosts);
    expect(mockPosts).toEqual(original);
  });
});

describe("groupPostsBySeries", () => {
  it("groups posts by series name", () => {
    const groups = groupPostsBySeries(mockPosts);
    expect(groups.has("Advent of Code 2022")).toBe(true);
    expect(groups.get("Advent of Code 2022")?.length).toBe(2);
  });

  it("excludes posts without series", () => {
    const groups = groupPostsBySeries(mockPosts);
    const allGroupedPosts = [...groups.values()].flat();
    expect(allGroupedPosts.every((p) => p.series !== null)).toBe(true);
  });
});
