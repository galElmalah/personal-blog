/**
 * Shared types for the terminal system
 * Used by both server-side Astro components and client-side interactive terminal
 */

/**
 * Post data structure used throughout the terminal
 */
export interface PostData {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  series: string | null;
  body: string;
}

/**
 * Interface for the command registry to avoid circular dependencies
 */
export interface ICommandRegistry {
  list(): Command[];
  get(name: string): Command | undefined;
  has(name: string): boolean;
  listNames(): string[];
  getCompletions(prefix: string): string[];
}

/**
 * Context passed to each command during execution
 */
export interface CommandContext {
  /** The command registry instance */
  registry: ICommandRegistry;
  /** All available posts */
  posts: PostData[];
  /** Current working directory path */
  currentPath: string;
  /** Command arguments (excluding flags) */
  args: string[];
  /** Command flags (e.g., -l, -a, -la) */
  flags: string[];
  /** Helper to get series names from posts */
  getSeriesNames: () => string[];
  /** Helper to get all unique tags */
  getAllTags: () => string[];
  /** Helper to get tag counts */
  getTagCounts: () => Map<string, number>;
  /** Helper to search posts */
  searchPosts: (pattern: string, caseInsensitive: boolean) => PostData[];
}

/**
 * Result returned from command execution
 */
export interface CommandResult {
  /** HTML output to display */
  html: string;
  /** New path if the command changes directory */
  newPath?: string;
  /** URL to navigate to (for cd command) */
  navigate?: string;
  /** Whether to go back in browser history */
  goBack?: boolean;
  /** Whether this result represents an error */
  error?: boolean;
  /** Whether to clear the terminal before showing output */
  clear?: boolean;
}

/**
 * Command definition interface
 */
export interface Command {
  /** Primary command name */
  name: string;
  /** Alternative names for the command */
  aliases?: string[];
  /** Short description for help text */
  description: string;
  /** Usage syntax */
  usage?: string;
  /** Execute the command and return result */
  execute: (ctx: CommandContext) => CommandResult;
  /** Get tab completion candidates */
  autocomplete?: (ctx: CommandContext, partial: string) => string[];
}

/**
 * Terminal configuration for initialization
 */
export interface TerminalConfig {
  /** Post data to make available to commands */
  posts: PostData[];
  /** Container element for terminal output */
  outputContainer: HTMLElement;
  /** Input element for command entry */
  inputElement: HTMLInputElement;
  /** Initial path */
  promptPath?: string;
  /** Skip running initial ls command (useful when page has SSR content) */
  skipInitialLs?: boolean;
}

/**
 * Terminal state interface
 */
export interface TerminalState {
  currentPath: string;
  commandHistory: string[];
  historyIndex: number;
}

/**
 * Options for ls-style output rendering
 */
export interface LsRenderOptions {
  /** Show detailed view with permissions and dates */
  showDetails?: boolean;
  /** Show hidden files (files starting with .) */
  showAll?: boolean;
}

/**
 * Options for tree output rendering
 */
export interface TreeRenderOptions {
  /** Maximum depth to render */
  maxDepth?: number;
}

/**
 * Options for cat output rendering
 */
export interface CatRenderOptions {
  /** Show full content instead of preview */
  showFullContent?: boolean;
  /** Maximum body length to show */
  maxBodyLength?: number;
}

/**
 * Options for grep output rendering
 */
export interface GrepRenderOptions {
  /** Case insensitive matching */
  caseInsensitive?: boolean;
}
