import { describe, it, expect } from "vitest";
import { cdCommand } from "../../../src/scripts/terminal/commands/cd";
import { createMockContext } from "../../fixtures/posts";

describe("cd command", () => {
  describe("home directory navigation", () => {
    it("navigates to home with ~", () => {
      const ctx = createMockContext({
        args: ["~"],
        currentPath: "~/blog/posts",
      });
      const result = cdCommand.execute(ctx);

      expect(result.newPath).toBe("~");
      expect(result.navigate).toBeUndefined();
    });

    it("navigates to home with empty path", () => {
      const ctx = createMockContext({
        args: [""],
        currentPath: "~/blog/posts",
      });
      const result = cdCommand.execute(ctx);

      expect(result.newPath).toBe("~");
    });

    it("navigates to home with no arguments", () => {
      const ctx = createMockContext({ args: [], currentPath: "~/blog/posts" });
      const result = cdCommand.execute(ctx);

      expect(result.newPath).toBe("~");
    });

    it("navigates to home with ..", () => {
      const ctx = createMockContext({
        args: [".."],
        currentPath: "~/blog/posts",
      });
      const result = cdCommand.execute(ctx);

      expect(result.newPath).toBe("~");
    });

    it("navigates to home with /", () => {
      const ctx = createMockContext({
        args: ["/"],
        currentPath: "~/blog/posts",
      });
      const result = cdCommand.execute(ctx);

      expect(result.newPath).toBe("~");
    });
  });

  describe("posts navigation", () => {
    it("navigates to /posts page", () => {
      const ctx = createMockContext({ args: ["posts"] });
      const result = cdCommand.execute(ctx);

      expect(result.navigate).toBe("/posts");
      expect(result.html).toContain("Navigating to /posts");
    });

    it("navigates to /posts with ./posts", () => {
      const ctx = createMockContext({ args: ["./posts"] });
      const result = cdCommand.execute(ctx);

      expect(result.navigate).toBe("/posts");
    });
  });

  describe("series navigation", () => {
    it("navigates to /series page", () => {
      const ctx = createMockContext({ args: ["series"] });
      const result = cdCommand.execute(ctx);

      expect(result.navigate).toBe("/series");
      expect(result.html).toContain("Navigating to /series");
    });

    it("navigates to /series with ./series", () => {
      const ctx = createMockContext({ args: ["./series"] });
      const result = cdCommand.execute(ctx);

      expect(result.navigate).toBe("/series");
    });
  });

  describe("tags navigation", () => {
    it("navigates to /tags page", () => {
      const ctx = createMockContext({ args: ["tags"] });
      const result = cdCommand.execute(ctx);

      expect(result.navigate).toBe("/tags");
      expect(result.html).toContain("Navigating to /tags");
    });

    it("navigates to /tags with ./tags", () => {
      const ctx = createMockContext({ args: ["./tags"] });
      const result = cdCommand.execute(ctx);

      expect(result.navigate).toBe("/tags");
    });
  });

  describe("post navigation", () => {
    it("navigates to a specific post by slug", () => {
      const ctx = createMockContext({ args: ["2023-goals"] });
      const result = cdCommand.execute(ctx);

      expect(result.navigate).toBe("/posts/2023-goals");
      expect(result.html).toContain("Opening");
    });

    it("navigates to post with posts/ prefix", () => {
      const ctx = createMockContext({ args: ["posts/2023-goals"] });
      const result = cdCommand.execute(ctx);

      expect(result.navigate).toBe("/posts/2023-goals");
    });

    it("handles case-insensitive post slugs", () => {
      const ctx = createMockContext({ args: ["2023-GOALS"] });
      const result = cdCommand.execute(ctx);

      expect(result.navigate).toBe("/posts/2023-goals");
    });
  });

  describe("series post navigation", () => {
    it("navigates to a specific series", () => {
      const ctx = createMockContext({ args: ["series/learning-go"] });
      const result = cdCommand.execute(ctx);

      expect(result.navigate).toBe("/series/learning-go");
      expect(result.html).toContain("Navigating to series");
    });
  });

  describe("error handling", () => {
    it("returns error for non-existent path", () => {
      const ctx = createMockContext({ args: ["nonexistent-path"] });
      const result = cdCommand.execute(ctx);

      expect(result.html).toContain("no such file or directory");
      expect(result.error).toBe(true);
    });

    it("returns error for invalid series", () => {
      const ctx = createMockContext({ args: ["series/nonexistent-series"] });
      const result = cdCommand.execute(ctx);

      expect(result.error).toBe(true);
    });
  });
});
