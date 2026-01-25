import { describe, it, expect } from "vitest";
import {
  sudoCommand,
  rmCommand,
  editorCommand,
} from "../../../src/scripts/terminal/commands/utils";
import { createMockContext } from "../../fixtures/posts";

/**
 * Tests for "restricted" commands - playful blocked commands that return humorous error responses
 */

describe("sudo command", () => {
  it("returns permission denied error", () => {
    const ctx = createMockContext({ args: ["rm", "-rf", "/"] });
    const result = sudoCommand.execute(ctx);

    expect(result.html).toContain("Permission denied");
    expect(result.error).toBe(true);
  });
});

describe("rm command", () => {
  it("returns read-only filesystem error", () => {
    const ctx = createMockContext({ args: ["file.txt"] });
    const result = rmCommand.execute(ctx);

    expect(result.html).toContain("Read-only file system");
    expect(result.error).toBe(true);
  });
});

describe("editor command (vim/nano/vi)", () => {
  it("returns not available message", () => {
    const ctx = createMockContext({ args: ["file.txt"] });
    const result = editorCommand.execute(ctx);

    expect(result.html).toContain("not available");
    expect(result.html).toContain("cat");
  });
});
