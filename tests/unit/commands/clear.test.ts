import { describe, it, expect } from "vitest";
import { clearCommand } from "../../../src/scripts/terminal/commands/utils";
import { createMockContext } from "../../fixtures/posts";

describe("clear command", () => {
  it("returns clear flag", () => {
    const ctx = createMockContext();
    const result = clearCommand.execute(ctx);

    expect(result.clear).toBe(true);
    expect(result.html).toBe("");
  });
});
