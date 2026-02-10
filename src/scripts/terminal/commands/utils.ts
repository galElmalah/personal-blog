/**
 * Utility commands - Simple commands like pwd, whoami, date, echo, etc.
 */

import type { Command, CommandContext, CommandResult } from "../types";
import { escapeHtml } from "../renderers/helpers";

/**
 * Extract the meaningful directory from a path like "~/posts" -> "posts"
 * or "~/series/aoc" -> "series/aoc"
 */
export function extractDirectory(path: string): string {
  const parts = path
    .replace(/^~\/?/, "")
    .split("/");
  return parts.filter(Boolean).join("/");
}

/**
 * Get the parent directory of a path
 * "posts" -> "", "series/aoc" -> "series", "" -> ""
 */
export function getParentDir(dir: string): string {
  const parts = dir.split("/").filter(Boolean);
  if (parts.length <= 1) return "";
  return parts.slice(0, -1).join("/");
}

/**
 * Resolve a path relative to currentPath
 * Examples:
 *   resolvePath(".", "~/posts") => "posts"
 *   resolvePath(".", "~") => ""
 *   resolvePath("posts", "~") => "posts"
 *   resolvePath("..", "~/posts") => ""
 *   resolvePath("series/aoc", "~") => "series/aoc"
 */
export function resolvePath(path: string, currentPath: string): string {
  const currentDir = extractDirectory(currentPath);

  // Current directory
  if (path === "." || path === "") {
    return currentDir;
  }

    // Parent directory
    if (path === "..") {
      const parent = getParentDir(currentDir);
      
      // If parent is empty, we're at root
      if (parent === "") {
        return "";
      }
      
      return parent;
    }

  // Home directory
  if (path === "~") {
    return "";
  }

  // Relative path from current directory (e.g., "./posts" or "../series")
  if (path.startsWith("./")) {
    const relativePart = path.slice(2);
    return currentDir ? `${currentDir}/${relativePart}` : relativePart;
  }

  if (path.startsWith("../")) {
    const parent = getParentDir(currentDir);
    const relativePart = path.slice(3);
    return parent ? `${parent}/${relativePart}` : relativePart;
  }

  // Absolute-ish paths (just return as-is)
  return path;
}

/**
 * pwd command - Print working directory
 */
export const pwdCommand: Command = {
  name: "pwd",
  description: "Print current directory",
  execute(ctx: CommandContext): CommandResult {
    const path = ctx.currentPath === "~" ? "" : "/" + ctx.currentPath;
    return {
      html: `<span class="text-term-blue">/home/gal/blog${path}</span>`,
    };
  },
};

/**
 * whoami command - Display current user
 */
export const whoamiCommand: Command = {
  name: "whoami",
  description: "Display current user",
  execute(_ctx: CommandContext): CommandResult {
    return {
      html: '<span class="text-term-green">gal</span>@<span class="text-term-purple">blog</span>',
    };
  },
};

/**
 * date command - Show current date and time
 */
export const dateCommand: Command = {
  name: "date",
  description: "Show current date and time",
  execute(_ctx: CommandContext): CommandResult {
    return {
      html: `<span class="text-term-yellow">${new Date().toString()}</span>`,
    };
  },
};

/**
 * echo command - Print text to terminal
 */
export const echoCommand: Command = {
  name: "echo",
  description: "Print text to terminal",
  usage: "echo <text>",
  execute(ctx: CommandContext): CommandResult {
    const text = ctx.args.join(" ");

    // Handle environment variables
    if (text === "$USER" || text === "$user") {
      return { html: '<span class="text-term-green">gal</span>' };
    }
    if (text === "$PWD" || text === "$pwd") {
      const path = ctx.currentPath === "~" ? "" : "/" + ctx.currentPath;
      return {
        html: `<span class="text-term-blue">/home/gal/blog${path}</span>`,
      };
    }
    if (text === "$HOME" || text === "$home") {
      return { html: '<span class="text-term-blue">/home/gal</span>' };
    }
    if (text === "$SHELL" || text === "$shell") {
      return { html: '<span class="text-term-fg">bash</span>' };
    }

    return {
      html: `<span class="text-term-fg">${escapeHtml(text)}</span>`,
    };
  },
};

/**
 * clear command - Clear the terminal
 */
export const clearCommand: Command = {
  name: "clear",
  description: "Clear the terminal",
  execute(_ctx: CommandContext): CommandResult {
    return { html: "", clear: true };
  },
};

/**
 * exit/logout command - Playful response
 */
export const exitCommand: Command = {
  name: "exit",
  aliases: ["logout"],
  description: "Exit the terminal",
  execute(_ctx: CommandContext): CommandResult {
    return {
      html: '<span class="text-term-fg-dark">Nice try! Refresh the page to start over.</span>',
    };
  },
};

/**
 * sudo command - Playful response
 */
export const sudoCommand: Command = {
  name: "sudo",
  description: "Run command as superuser",
  execute(_ctx: CommandContext): CommandResult {
    return {
      html: '<span class="text-term-red">Permission denied. Nice try though!</span>',
      error: true,
    };
  },
};

/**
 * rm command - Playful response
 */
export const rmCommand: Command = {
  name: "rm",
  description: "Remove files",
  execute(_ctx: CommandContext): CommandResult {
    return {
      html: '<span class="text-term-red">rm: cannot remove: Read-only file system</span>',
      error: true,
    };
  },
};

/**
 * vim/nano/vi command - Playful response
 */
export const editorCommand: Command = {
  name: "vim",
  aliases: ["nano", "vi"],
  description: "Text editor",
  execute(_ctx: CommandContext): CommandResult {
    return {
      html: '<span class="text-term-fg-dark">Editor not available. Try reading with `cat` instead!</span>',
    };
  },
};

/**
 * neofetch command - Display system info
 */
export const neofetchCommand: Command = {
  name: "neofetch",
  description: "Display system info",
  execute(ctx: CommandContext): CommandResult {
    const postCount = ctx.posts.length;
    const seriesCount = ctx.getSeriesNames().length;
    const tagCount = ctx.getAllTags().length;

    const html = `<div class="flex gap-6 items-start flex-wrap">
      <pre class="text-term-cyan text-xs leading-tight">
   ___       __  
  / _ \\___ _/ /  
 / , _/ _ \`/ /   
/_/|_|\\_,_/_/    
      </pre>
      <div class="text-sm space-y-1">
        <div><span class="text-term-cyan">gal</span>@<span class="text-term-purple">blog</span></div>
        <div class="text-term-fg-dark">-----------</div>
        <div><span class="text-term-green">OS:</span> <span class="text-term-fg">Astro Blog v4.x</span></div>
        <div><span class="text-term-green">Host:</span> <span class="text-term-fg">gal.sh</span></div>
        <div><span class="text-term-green">Shell:</span> <span class="text-term-fg">terminalEngine.ts</span></div>
        <div><span class="text-term-green">Theme:</span> <span class="text-term-fg">Tokyo Night</span></div>
        <div><span class="text-term-green">Posts:</span> <span class="text-term-fg">${postCount}</span></div>
        <div><span class="text-term-green">Series:</span> <span class="text-term-fg">${seriesCount}</span></div>
        <div><span class="text-term-green">Tags:</span> <span class="text-term-fg">${tagCount}</span></div>
      </div>
    </div>`;

    return { html };
  },
};

/**
 * All utility commands exported as an array
 */
export const utilCommands: Command[] = [
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
];
