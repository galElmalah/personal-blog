/**
 * Command Registry - Pluggable command system for the terminal
 * Allows registering, retrieving, and listing available commands
 */

import type { Command } from "./types";

/**
 * Registry for terminal commands
 * Implements a plugin-style architecture where commands can be registered dynamically
 */
export class CommandRegistry {
  private commands = new Map<string, Command>();
  private aliases = new Map<string, string>();

  /**
   * Register a command with the registry
   * @param command The command to register
   */
  register(command: Command): void {
    // Register the primary command name
    this.commands.set(command.name.toLowerCase(), command);

    // Register any aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.set(alias.toLowerCase(), command.name.toLowerCase());
      }
    }
  }

  /**
   * Register multiple commands at once
   * @param commands Array of commands to register
   */
  registerAll(commands: Command[]): void {
    for (const command of commands) {
      this.register(command);
    }
  }

  /**
   * Get a command by name or alias
   * @param name Command name or alias
   * @returns The command if found, undefined otherwise
   */
  get(name: string): Command | undefined {
    const lowerName = name.toLowerCase();

    // First check if it's a direct command
    if (this.commands.has(lowerName)) {
      return this.commands.get(lowerName);
    }

    // Check if it's an alias
    const primaryName = this.aliases.get(lowerName);
    if (primaryName) {
      return this.commands.get(primaryName);
    }

    return undefined;
  }

  /**
   * Check if a command exists
   * @param name Command name or alias
   */
  has(name: string): boolean {
    const lowerName = name.toLowerCase();
    return this.commands.has(lowerName) || this.aliases.has(lowerName);
  }

  /**
   * Get all registered commands
   * @returns Array of all commands (excluding aliases)
   */
  list(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get all command names including aliases
   * @returns Array of all command names and aliases
   */
  listNames(): string[] {
    const names = Array.from(this.commands.keys());
    const aliasNames = Array.from(this.aliases.keys());
    return [...names, ...aliasNames].sort();
  }

  /**
   * Get commands that start with a given prefix (for tab completion)
   * @param prefix The prefix to match
   * @returns Array of matching command names
   */
  getCompletions(prefix: string): string[] {
    const lowerPrefix = prefix.toLowerCase();
    return this.listNames().filter((name) => name.startsWith(lowerPrefix));
  }
}

// Export a singleton instance for the application
export const commandRegistry = new CommandRegistry();
