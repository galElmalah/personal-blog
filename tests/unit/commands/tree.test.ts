import { describe, it, expect } from "vitest";
import { treeCommand } from "../../../src/scripts/terminal/commands/tree";
import { createMockContext, mockPosts } from "../../fixtures/posts";

describe("tree command", () => {
  describe("root tree view", () => {
    it("shows root directory structure", () => {
      const ctx = createMockContext({ args: [] });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain("posts/");
      expect(result.html).toContain("series/");
      expect(result.html).toContain("tags/");
    });

    it("shows directory count", () => {
      const ctx = createMockContext({ args: [] });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain("3 directories");
    });

    it("shows file count", () => {
      const ctx = createMockContext({ args: [] });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain(`${mockPosts.length} files`);
    });

    it("shows tree branch characters", () => {
      const ctx = createMockContext({ args: [] });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain("├──");
      expect(result.html).toContain("└──");
    });
  });

  describe("posts tree view", () => {
    it("shows all posts", () => {
      const ctx = createMockContext({ args: ["posts"] });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain("posts/");
      mockPosts.forEach((post) => {
        expect(result.html).toContain(`/posts/${post.slug}`);
      });
    });

    it("shows correct file count", () => {
      const ctx = createMockContext({ args: ["posts"] });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain(`${mockPosts.length} files`);
    });

    it("formats posts as files with .md extension", () => {
      const ctx = createMockContext({ args: ["posts"] });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain(".md");
    });
  });

  describe("series tree view", () => {
    it("shows series as directories", () => {
      const ctx = createMockContext({ args: ["series"] });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain("series/");
      expect(result.html).toContain("Learning Go/");
      expect(result.html).toContain("Advent of Code 2022/");
    });

    it("shows posts nested under series", () => {
      const ctx = createMockContext({ args: ["series"] });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain("learning-go-intro");
      expect(result.html).toContain("advent-of-code-2022-day-1");
    });

    it("uses correct tree branch characters for nesting", () => {
      const ctx = createMockContext({ args: ["series"] });
      const result = treeCommand.execute(ctx);

      // Should have nested branches
      expect(result.html).toContain("│");
    });

    it("shows directory and file counts", () => {
      const ctx = createMockContext({ args: ["series"] });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain("directories");
      expect(result.html).toContain("files");
    });
  });

  describe("error handling", () => {
    it("returns error for non-existent path", () => {
      const ctx = createMockContext({ args: ["nonexistent"] });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain("not found");
      expect(result.error).toBe(true);
    });
  });

  describe("path handling", () => {
    it("handles trailing slash", () => {
      const ctx = createMockContext({ args: ["posts/"] });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain("posts/");
      expect(result.error).toBeUndefined();
    });

    it("handles current directory at root", () => {
      const ctx = createMockContext({ args: ["."], currentPath: "~" });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain("posts/");
      expect(result.html).toContain("series/");
    });
  });

  describe("interactive elements", () => {
    it("includes clickable elements with data-cmd", () => {
      const ctx = createMockContext({ args: [] });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain("data-cmd");
    });

    it("includes cursor pointer for clickable directories", () => {
      const ctx = createMockContext({ args: [] });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain("cursor-pointer");
    });

    it("includes hover styles in posts tree", () => {
      const ctx = createMockContext({ args: ["posts"] });
      const result = treeCommand.execute(ctx);

      expect(result.html).toContain("hover:text-term-cyan");
    });
  });
});
