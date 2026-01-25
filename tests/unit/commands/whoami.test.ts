import { describe, it, expect } from "vitest";
import { whoamiCommand } from "../../../src/scripts/terminal/commands/utils";
import { createMockContext } from "../../fixtures/posts";

describe("whoami command", () => {
  it("returns user@host format", () => {
    const ctx = createMockContext();
    const result = whoamiCommand.execute(ctx);

    expect(result.html).toContain("gal");
    expect(result.html).toContain("blog");
  });

  it("uses terminal color classes", () => {
    const ctx = createMockContext();
    const result = whoamiCommand.execute(ctx);

    expect(result.html).toContain("text-term-green");
    expect(result.html).toContain("text-term-purple");
  });
});
