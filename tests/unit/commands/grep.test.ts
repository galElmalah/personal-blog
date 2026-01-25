import { describe, it, expect } from "vitest";
import { grepCommand } from "../../../src/scripts/terminal/commands/grep";
import { createMockContext } from "../../fixtures/posts";

describe("grep command", () => {
  describe("successful searches", () => {
    it("finds posts matching pattern in title", () => {
      const ctx = createMockContext({ args: ["Goals"] });
      const result = grepCommand.execute(ctx);

      expect(result.html).toContain("match");
      expect(result.html).toContain("2023-goals");
      expect(result.error).toBeUndefined();
    });

    it("finds posts matching pattern in description", () => {
      const ctx = createMockContext({ args: ["CLI Tools"] });
      const result = grepCommand.execute(ctx);

      expect(result.html).toContain("5-cli-tools");
    });

    it("finds posts matching pattern in tags", () => {
      const ctx = createMockContext({ args: ["Go"], flags: [] });
      const result = grepCommand.execute(ctx);

      expect(result.html).toContain("learning-go");
    });

    it("highlights matching text", () => {
      const ctx = createMockContext({ args: ["Goals"] });
      const result = grepCommand.execute(ctx);

      expect(result.html).toContain("term-grep-match");
    });

    it("shows match count", () => {
      const ctx = createMockContext({ args: ["Programming"] });
      const result = grepCommand.execute(ctx);

      expect(result.html).toMatch(/\d+ match/);
    });

    it("shows post path in results", () => {
      const ctx = createMockContext({ args: ["Goals"] });
      const result = grepCommand.execute(ctx);

      expect(result.html).toContain("./posts/");
    });
  });

  describe("case sensitivity", () => {
    it("searches case-insensitively with -i flag", () => {
      const ctx = createMockContext({ args: ["goals"], flags: ["-i"] });
      const result = grepCommand.execute(ctx);

      expect(result.html).toContain("2023-goals");
    });

    it("matches case without -i flag", () => {
      const ctx = createMockContext({ args: ["Goals"], flags: [] });
      const result = grepCommand.execute(ctx);

      expect(result.html).toContain("2023-goals");
    });
  });

  describe("error handling", () => {
    it("returns error when no pattern provided", () => {
      const ctx = createMockContext({ args: [] });
      const result = grepCommand.execute(ctx);

      expect(result.html).toContain("missing pattern");
      expect(result.error).toBe(true);
    });

    it("shows usage hint on error", () => {
      const ctx = createMockContext({ args: [] });
      const result = grepCommand.execute(ctx);

      expect(result.html).toContain("Usage");
    });

    it("returns error for no matches", () => {
      const ctx = createMockContext({ args: ["xyznonexistent123"] });
      const result = grepCommand.execute(ctx);

      expect(result.html).toContain("no matches found");
      expect(result.error).toBe(true);
    });

    it("shows pattern in no-match error message", () => {
      const ctx = createMockContext({ args: ["mypattern"] });
      const result = grepCommand.execute(ctx);

      expect(result.html).toContain("mypattern");
    });
  });

  describe("multi-word patterns", () => {
    it("handles patterns with spaces", () => {
      const ctx = createMockContext({ args: ["Advent", "of", "Code"] });
      const result = grepCommand.execute(ctx);

      expect(result.html).toContain("advent-of-code");
    });
  });

  describe("result formatting", () => {
    it("shows tags in results", () => {
      const ctx = createMockContext({ args: ["Goals"] });
      const result = grepCommand.execute(ctx);

      expect(result.html).toContain("#");
    });

    it("links to posts", () => {
      const ctx = createMockContext({ args: ["Goals"] });
      const result = grepCommand.execute(ctx);

      expect(result.html).toContain('href="/posts/');
    });
  });
});
