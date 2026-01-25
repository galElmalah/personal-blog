import { describe, it, expect } from "vitest";
import { findCommand } from "../../../src/scripts/terminal/commands/find";
import { createMockContext, mockPosts } from "../../fixtures/posts";

describe("find command", () => {
  describe("listing all posts", () => {
    it("lists all posts when no pattern provided", () => {
      const ctx = createMockContext({ args: [] });
      const result = findCommand.execute(ctx);

      expect(result.html).toContain(`${mockPosts.length} file(s) found`);
      mockPosts.forEach((post) => {
        expect(result.html).toContain(`/posts/${post.slug}`);
      });
    });

    it("shows ./posts/ prefix for each file", () => {
      const ctx = createMockContext({ args: [] });
      const result = findCommand.execute(ctx);

      expect(result.html).toContain("./posts/");
    });

    it("formats filenames with .md extension", () => {
      const ctx = createMockContext({ args: [] });
      const result = findCommand.execute(ctx);

      expect(result.html).toContain(".md");
    });
  });

  describe("pattern matching", () => {
    it("finds posts matching pattern", () => {
      const ctx = createMockContext({ args: ["Goals"] });
      const result = findCommand.execute(ctx);

      expect(result.html).toContain("2023-goals");
    });

    it("finds posts by tag", () => {
      const ctx = createMockContext({ args: ["Go"] });
      const result = findCommand.execute(ctx);

      expect(result.html).toContain("learning-go");
    });

    it("shows correct match count", () => {
      const ctx = createMockContext({ args: ["Advent"] });
      const result = findCommand.execute(ctx);

      // Should find the Advent of Code posts
      expect(result.html).toContain("file(s) found");
    });

    it("uses case-insensitive matching", () => {
      const ctx = createMockContext({ args: ["goals"] });
      const result = findCommand.execute(ctx);

      expect(result.html).toContain("2023-goals");
    });
  });

  describe("error handling", () => {
    it("returns error for no matches", () => {
      const ctx = createMockContext({ args: ["xyznonexistent123"] });
      const result = findCommand.execute(ctx);

      expect(result.html).toContain("no matches");
      expect(result.error).toBe(true);
    });

    it("shows pattern in error message", () => {
      const ctx = createMockContext({ args: ["mypattern"] });
      const result = findCommand.execute(ctx);

      expect(result.html).toContain("mypattern");
    });
  });

  describe("result formatting", () => {
    it("includes clickable links", () => {
      const ctx = createMockContext({ args: [] });
      const result = findCommand.execute(ctx);

      expect(result.html).toContain('href="/posts/');
    });

    it("includes hover styles", () => {
      const ctx = createMockContext({ args: [] });
      const result = findCommand.execute(ctx);

      expect(result.html).toContain("hover:");
    });

    it("uses terminal color classes", () => {
      const ctx = createMockContext({ args: [] });
      const result = findCommand.execute(ctx);

      expect(result.html).toContain("text-term-purple");
      expect(result.html).toContain("text-term-cyan");
    });
  });

  describe("multi-word patterns", () => {
    it("handles patterns with spaces", () => {
      const ctx = createMockContext({ args: ["Advent", "of", "Code"] });
      const result = findCommand.execute(ctx);

      expect(result.html).toContain("advent-of-code");
    });
  });
});
