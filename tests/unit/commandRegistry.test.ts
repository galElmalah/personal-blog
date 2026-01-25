import { describe, it, expect, beforeEach } from "vitest";
import { CommandRegistry } from "../../src/scripts/terminal/commandRegistry";
import type {
  Command,
  CommandContext,
  CommandResult,
} from "../../src/scripts/terminal/types";

// Helper to create a simple test command
function createTestCommand(name: string, aliases?: string[]): Command {
  return {
    name,
    aliases,
    description: `Test command: ${name}`,
    execute: (_ctx: CommandContext): CommandResult => ({
      html: `<span>Executed ${name}</span>`,
    }),
  };
}

describe("CommandRegistry", () => {
  let registry: CommandRegistry;

  beforeEach(() => {
    registry = new CommandRegistry();
  });

  describe("register", () => {
    it("registers a command by name", () => {
      const cmd = createTestCommand("test");
      registry.register(cmd);
      expect(registry.has("test")).toBe(true);
    });

    it("registers command aliases", () => {
      const cmd = createTestCommand("list", ["ls", "dir"]);
      registry.register(cmd);

      expect(registry.has("list")).toBe(true);
      expect(registry.has("ls")).toBe(true);
      expect(registry.has("dir")).toBe(true);
    });

    it("handles case-insensitive registration", () => {
      const cmd = createTestCommand("TEST");
      registry.register(cmd);
      expect(registry.has("test")).toBe(true);
      expect(registry.has("TEST")).toBe(true);
    });
  });

  describe("registerAll", () => {
    it("registers multiple commands at once", () => {
      const commands = [
        createTestCommand("ls"),
        createTestCommand("cd"),
        createTestCommand("cat"),
      ];
      registry.registerAll(commands);

      expect(registry.has("ls")).toBe(true);
      expect(registry.has("cd")).toBe(true);
      expect(registry.has("cat")).toBe(true);
    });
  });

  describe("get", () => {
    it("retrieves command by name", () => {
      const cmd = createTestCommand("test");
      registry.register(cmd);

      const retrieved = registry.get("test");
      expect(retrieved).toBe(cmd);
    });

    it("retrieves command by alias", () => {
      const cmd = createTestCommand("list", ["ls"]);
      registry.register(cmd);

      const retrieved = registry.get("ls");
      expect(retrieved).toBe(cmd);
    });

    it("returns undefined for unknown command", () => {
      expect(registry.get("unknown")).toBeUndefined();
    });

    it("handles case-insensitive retrieval", () => {
      const cmd = createTestCommand("test");
      registry.register(cmd);

      expect(registry.get("TEST")).toBe(cmd);
      expect(registry.get("Test")).toBe(cmd);
    });
  });

  describe("has", () => {
    it("returns true for registered command", () => {
      registry.register(createTestCommand("test"));
      expect(registry.has("test")).toBe(true);
    });

    it("returns true for registered alias", () => {
      registry.register(createTestCommand("test", ["t"]));
      expect(registry.has("t")).toBe(true);
    });

    it("returns false for unregistered command", () => {
      expect(registry.has("nonexistent")).toBe(false);
    });
  });

  describe("list", () => {
    it("returns all registered commands", () => {
      const cmd1 = createTestCommand("ls");
      const cmd2 = createTestCommand("cd");
      registry.register(cmd1);
      registry.register(cmd2);

      const commands = registry.list();
      expect(commands).toHaveLength(2);
      expect(commands).toContain(cmd1);
      expect(commands).toContain(cmd2);
    });

    it("does not include aliases as separate entries", () => {
      const cmd = createTestCommand("list", ["ls", "dir"]);
      registry.register(cmd);

      const commands = registry.list();
      expect(commands).toHaveLength(1);
      expect(commands[0]).toBe(cmd);
    });
  });

  describe("listNames", () => {
    it("returns all command names and aliases", () => {
      registry.register(createTestCommand("list", ["ls", "dir"]));
      registry.register(createTestCommand("cat"));

      const names = registry.listNames();
      expect(names).toContain("list");
      expect(names).toContain("ls");
      expect(names).toContain("dir");
      expect(names).toContain("cat");
    });

    it("returns sorted names", () => {
      registry.register(createTestCommand("zebra"));
      registry.register(createTestCommand("alpha"));
      registry.register(createTestCommand("beta"));

      const names = registry.listNames();
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });
  });

  describe("getCompletions", () => {
    beforeEach(() => {
      registry.register(createTestCommand("ls"));
      registry.register(createTestCommand("list", ["ll"]));
      registry.register(createTestCommand("cat"));
      registry.register(createTestCommand("cd"));
    });

    it("returns commands starting with prefix", () => {
      const completions = registry.getCompletions("l");
      expect(completions).toContain("ls");
      expect(completions).toContain("list");
      expect(completions).toContain("ll");
      expect(completions).not.toContain("cat");
      expect(completions).not.toContain("cd");
    });

    it("returns commands starting with prefix (case-insensitive)", () => {
      const completions = registry.getCompletions("L");
      expect(completions).toContain("ls");
      expect(completions).toContain("list");
    });

    it("returns empty array for no matches", () => {
      const completions = registry.getCompletions("xyz");
      expect(completions).toEqual([]);
    });

    it("returns all commands for empty prefix", () => {
      const completions = registry.getCompletions("");
      expect(completions.length).toBe(5); // ls, list, ll, cat, cd
    });

    it("returns exact match", () => {
      const completions = registry.getCompletions("cat");
      expect(completions).toContain("cat");
    });
  });
});
