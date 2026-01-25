import { describe, it, expect } from "vitest";
import { exitCommand } from "../../../src/scripts/terminal/commands/utils";
import { createMockContext } from "../../fixtures/posts";

describe("exit command", () => {
  it("returns playful message", () => {
    const ctx = createMockContext();
    const result = exitCommand.execute(ctx);

    expect(result.html).toContain("Nice try");
    expect(result.html).toContain("Refresh");
  });
});
