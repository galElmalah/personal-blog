import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { dateCommand } from "../../../src/scripts/terminal/commands/utils";
import { createMockContext } from "../../fixtures/posts";

describe("date command", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T10:30:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns current date and time", () => {
    const ctx = createMockContext();
    const result = dateCommand.execute(ctx);

    expect(result.html).toContain("2024");
    expect(result.html).toContain("Jun");
  });

  it("uses yellow color for date", () => {
    const ctx = createMockContext();
    const result = dateCommand.execute(ctx);

    expect(result.html).toContain("text-term-yellow");
  });
});
