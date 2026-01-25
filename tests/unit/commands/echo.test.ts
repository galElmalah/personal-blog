import { describe, it, expect } from "vitest";
import { echoCommand } from "../../../src/scripts/terminal/commands/utils";
import { createMockContext } from "../../fixtures/posts";

describe("echo command", () => {
  it("echoes plain text", () => {
    const ctx = createMockContext({ args: ["Hello", "World"] });
    const result = echoCommand.execute(ctx);

    expect(result.html).toContain("Hello World");
  });

  it("handles $USER variable", () => {
    const ctx = createMockContext({ args: ["$USER"] });
    const result = echoCommand.execute(ctx);

    expect(result.html).toContain("gal");
  });

  it("handles $PWD variable", () => {
    const ctx = createMockContext({ args: ["$PWD"], currentPath: "~" });
    const result = echoCommand.execute(ctx);

    expect(result.html).toContain("/home/gal/blog");
  });

  it("handles $HOME variable", () => {
    const ctx = createMockContext({ args: ["$HOME"] });
    const result = echoCommand.execute(ctx);

    expect(result.html).toContain("/home/gal");
  });

  it("handles $SHELL variable", () => {
    const ctx = createMockContext({ args: ["$SHELL"] });
    const result = echoCommand.execute(ctx);

    expect(result.html).toContain("bash");
  });

  it("escapes HTML in echo output", () => {
    const ctx = createMockContext({ args: ['<script>alert("xss")</script>'] });
    const result = echoCommand.execute(ctx);

    expect(result.html).not.toContain("<script>");
  });
});
