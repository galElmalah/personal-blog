import { describe, it, expect } from "vitest";
import { lsCommand } from "../../../src/scripts/terminal/commands/ls";
import { createMockContext, mockPosts } from "../../fixtures/posts";

describe("ls command", () => {
  describe("root directory listing", () => {
    it("lists root directories in simple view", () => {
      const ctx = createMockContext({ args: [], flags: [] });
      const result = lsCommand.execute(ctx);

      expect(result.html).toContain("posts/");
      expect(result.html).toContain("series/");
      expect(result.html).toContain("tags/");
      expect(result.error).toBeUndefined();
    });

    it("lists root directories in detailed view with -l flag", () => {
      const ctx = createMockContext({ args: [], flags: ["-l"] });
      const result = lsCommand.execute(ctx);

      expect(result.html).toContain("posts/");
      expect(result.html).toContain("drwxr-xr-x");
      expect(result.html).toContain("total 3");
    });

    it("shows file counts in detailed view", () => {
      const ctx = createMockContext({ args: [], flags: ["-l"] });
      const result = lsCommand.execute(ctx);

      expect(result.html).toContain(`${mockPosts.length} files`);
    });
  });

  describe("posts directory listing", () => {
    it("lists all posts", () => {
      const ctx = createMockContext({ args: ["posts"], flags: [] });
      const result = lsCommand.execute(ctx);

      expect(result.html).toContain(`total ${mockPosts.length}`);
      mockPosts.forEach((post) => {
        expect(result.html).toContain(`/posts/${post.slug}`);
      });
    });

    it("shows detailed post info with -l flag", () => {
      const ctx = createMockContext({ args: ["posts"], flags: ["-l"] });
      const result = lsCommand.execute(ctx);

      expect(result.html).toContain("-rw-r--r--");
      expect(result.html).toContain("term-ls-date");
    });

    it("lists posts from current directory when in posts/", () => {
      const ctx = createMockContext({
        args: ["."],
        flags: [],
        currentPath: "~/blog/posts",
      });
      const result = lsCommand.execute(ctx);

      expect(result.html).toContain(`total ${mockPosts.length}`);
    });
  });

  describe("series directory listing", () => {
    it("lists all series", () => {
      const ctx = createMockContext({ args: ["series"], flags: [] });
      const result = lsCommand.execute(ctx);

      expect(result.html).toContain("Learning Go/");
      expect(result.html).toContain("Advent of Code 2022/");
    });

    it("shows post count per series in detailed view", () => {
      const ctx = createMockContext({ args: ["series"], flags: ["-l"] });
      const result = lsCommand.execute(ctx);

      expect(result.html).toContain("posts");
    });

    it("lists posts within a specific series", () => {
      const ctx = createMockContext({
        args: ["series/advent-of-code-2022"],
        flags: [],
      });
      const result = lsCommand.execute(ctx);

      expect(result.html).toContain("advent-of-code-2022-day-1");
      expect(result.html).toContain("advent-of-code-2022-day-2");
    });
  });

  describe("tags directory listing", () => {
    it("lists all tags", () => {
      const ctx = createMockContext({ args: ["tags"], flags: [] });
      const result = lsCommand.execute(ctx);

      expect(result.html).toContain("#Go");
      expect(result.html).toContain("#Programming");
      expect(result.html).toContain("#Goals");
    });

    it("shows tag counts in detailed view", () => {
      const ctx = createMockContext({ args: ["tags"], flags: ["-l"] });
      const result = lsCommand.execute(ctx);

      expect(result.html).toContain("total");
      expect(result.html).toContain("tags");
    });
  });

  describe("error handling", () => {
    it("returns error for non-existent path", () => {
      const ctx = createMockContext({ args: ["nonexistent"], flags: [] });
      const result = lsCommand.execute(ctx);

      expect(result.html).toContain("No such file or directory");
      expect(result.error).toBe(true);
    });
  });

  describe("flag combinations", () => {
    it("handles -la flag", () => {
      const ctx = createMockContext({ args: [], flags: ["-la"] });
      const result = lsCommand.execute(ctx);

      expect(result.html).toContain("drwxr-xr-x");
    });

    it("handles -al flag", () => {
      const ctx = createMockContext({ args: [], flags: ["-al"] });
      const result = lsCommand.execute(ctx);

      expect(result.html).toContain("drwxr-xr-x");
    });
  });
});
