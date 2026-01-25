import { describe, it, expect } from "vitest";
import { neofetchCommand } from "../../../src/scripts/terminal/commands/utils";
import { createMockContext } from "../../fixtures/posts";

describe("neofetch command", () => {
  it("displays system info", () => {
    const ctx = createMockContext();
    const result = neofetchCommand.execute(ctx);

    expect(result.html).toContain("gal");
    expect(result.html).toContain("blog");
  });

  it("shows OS info", () => {
    const ctx = createMockContext();
    const result = neofetchCommand.execute(ctx);

    expect(result.html).toContain("Astro Blog");
  });

  it("shows shell info", () => {
    const ctx = createMockContext();
    const result = neofetchCommand.execute(ctx);

    expect(result.html).toContain("terminalEngine.ts");
  });

  it("shows theme info", () => {
    const ctx = createMockContext();
    const result = neofetchCommand.execute(ctx);

    expect(result.html).toContain("Tokyo Night");
  });

  it("shows post count", () => {
    const ctx = createMockContext();
    const result = neofetchCommand.execute(ctx);

    expect(result.html).toContain("Posts:");
  });

  it("shows series count", () => {
    const ctx = createMockContext();
    const result = neofetchCommand.execute(ctx);

    expect(result.html).toContain("Series:");
  });

  it("shows tags count", () => {
    const ctx = createMockContext();
    const result = neofetchCommand.execute(ctx);

    expect(result.html).toContain("Tags:");
  });

  it("includes ASCII art", () => {
    const ctx = createMockContext();
    const result = neofetchCommand.execute(ctx);

    expect(result.html).toContain("<pre");
  });
});
