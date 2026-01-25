/**
 * Terminal module main entry point
 * Re-exports all public APIs
 */

// Types
export type {
  PostData,
  CommandContext,
  CommandResult,
  Command,
  TerminalConfig,
  TerminalState,
  LsRenderOptions,
  TreeRenderOptions,
  CatRenderOptions,
  GrepRenderOptions,
} from "./types";

// Command Registry
export { CommandRegistry, commandRegistry } from "./commandRegistry";

// Commands
export {
  allCommands,
  registerAllCommands,
  createCommandRegistry,
  lsCommand,
  cdCommand,
  catCommand,
  grepCommand,
  treeCommand,
  findCommand,
  helpCommand,
  historyCommand,
  renderHistory,
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
} from "./commands";

// Renderers
export {
  formatDate,
  formatFilename,
  escapeHtml,
  escapeRegex,
  seriesSlug,
  getSeriesNames,
  getAllTags,
  getTagCounts,
  searchPosts,
  sortPostsByDate,
  groupPostsBySeries,
  createContextHelpers,
} from "./renderers";

// Engine
export { TerminalEngine, terminal } from "./engine";
