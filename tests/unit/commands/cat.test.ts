import { describe, it, expect } from "vitest";
import { catCommand } from "../../../src/scripts/terminal/commands/cat";
import { createMockContext } from "../../fixtures/posts";

describe("cat command", () => {
  describe("successful post preview", () => {
    it("displays post content by slug", () => {
      const ctx = createMockContext({ args: ["2023-goals"] });
      const result = catCommand.execute(ctx);

      expect(result.html).toContain("Ready, Set, Go!");
      expect(result.html).toContain("/posts/2023-goals");
      expect(result.error).toBeUndefined();
    });

    it("displays post content with posts/ prefix", () => {
      const ctx = createMockContext({ args: ["posts/2023-goals"] });
      const result = catCommand.execute(ctx);

      expect(result.html).toContain("Ready, Set, Go!");
    });

    it("displays post with .md extension stripped", () => {
      const ctx = createMockContext({ args: ["2023-goals.md"] });
      const result = catCommand.execute(ctx);

      expect(result.html).toContain("Ready, Set, Go!");
    });

    it("includes post metadata", () => {
      const ctx = createMockContext({ args: ["2023-goals"] });
      const result = catCommand.execute(ctx);

      expect(result.html).toContain("term-cat-title");
      expect(result.html).toContain("term-cat-meta");
    });

    it("includes tags", () => {
      const ctx = createMockContext({ args: ["2023-goals"] });
      const result = catCommand.execute(ctx);

      expect(result.html).toContain("#Goals");
      expect(result.html).toContain("#Productivity");
    });

    it("includes series name if present", () => {
      const ctx = createMockContext({ args: ["learning-go-intro"] });
      const result = catCommand.execute(ctx);

      expect(result.html).toContain("Learning Go");
    });

    it("includes read more link", () => {
      const ctx = createMockContext({ args: ["2023-goals"] });
      const result = catCommand.execute(ctx);

      expect(result.html).toContain("Read full post");
      expect(result.html).toContain("term-link");
    });

    it("truncates long body content", () => {
      const ctx = createMockContext({ args: ["2023-goals"] });
      const result = catCommand.execute(ctx);

      // Body should be truncated
      expect(result.html).toContain("...");
    });
  });

  describe("error handling", () => {
    it("returns error when no file operand provided", () => {
      const ctx = createMockContext({ args: [] });
      const result = catCommand.execute(ctx);

      expect(result.html).toContain("missing file operand");
      expect(result.error).toBe(true);
    });

    it("returns error for non-existent post", () => {
      const ctx = createMockContext({ args: ["nonexistent-post"] });
      const result = catCommand.execute(ctx);

      expect(result.html).toContain("No such file or directory");
      expect(result.error).toBe(true);
    });

    it("shows the requested filename in error message", () => {
      const ctx = createMockContext({ args: ["some-missing-file"] });
      const result = catCommand.execute(ctx);

      expect(result.html).toContain("some-missing-file");
    });
  });

  describe("case handling", () => {
    it("handles case-insensitive slug lookup", () => {
      const ctx = createMockContext({ args: ["2023-GOALS"] });
      const result = catCommand.execute(ctx);

      expect(result.html).toContain("Ready, Set, Go!");
      expect(result.error).toBeUndefined();
    });
  });
});
