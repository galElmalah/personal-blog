/**
 * Command module index
 * Re-exports all commands and provides a function to register all commands
 */

import type { Command } from "../types";
import { CommandRegistry } from "../commandRegistry";

// Import individual commands
import { lsCommand } from "./ls";
import { cdCommand } from "./cd";
import { catCommand } from "./cat";
import { grepCommand } from "./grep";
import { treeCommand } from "./tree";
import { findCommand } from "./find";
import { helpCommand } from "./help";
import { themeCommand } from "./theme";
import { historyCommand } from "./history";
import { utilCommands } from "./utils";

// Export individual commands for direct access
export { lsCommand } from "./ls";
export { cdCommand } from "./cd";
export { catCommand } from "./cat";
export { grepCommand } from "./grep";
export { treeCommand } from "./tree";
export { findCommand } from "./find";
export { helpCommand } from "./help";
export { themeCommand } from "./theme";
export { historyCommand, renderHistory } from "./history";
export {
  pwdCommand,
  whoamiCommand,
  dateCommand,
  echoCommand,
  clearCommand,
  exitCommand,
  sudoCommand,
  rmCommand,
  editorCommand,
  neofetchCommand,
  utilCommands,
} from "./utils";

/**
 * All commands as an array
 */
export const allCommands: Command[] = [
  lsCommand,
  cdCommand,
  catCommand,
  grepCommand,
  treeCommand,
  findCommand,
  helpCommand,
  themeCommand,
  historyCommand,
  ...utilCommands,
];

/**
 * Register all commands with a registry
 * @param registry The command registry to register with
 */
export function registerAllCommands(registry: CommandRegistry): void {
  registry.registerAll(allCommands);
}

/**
 * Create a new registry with all commands pre-registered
 * @returns A new CommandRegistry with all commands
 */
export function createCommandRegistry(): CommandRegistry {
  const registry = new CommandRegistry();
  registerAllCommands(registry);
  return registry;
}
