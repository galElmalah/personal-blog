import { describe, it, expect } from "vitest";
import { pwdCommand } from "../../../src/scripts/terminal/commands/utils";
import { createMockContext } from "../../fixtures/posts";

describe("pwd command", () => {
  it("shows home directory for ~", () => {
    const ctx = createMockContext({ currentPath: "~" });
    const result = pwdCommand.execute(ctx);

    expect(result.html).toContain("/home/gal/blog");
  });

  it("shows full path for subdirectory", () => {
    const ctx = createMockContext({ currentPath: "~/posts" });
    const result = pwdCommand.execute(ctx);

    expect(result.html).toContain("/home/gal/blog/~/posts");
  });
});
