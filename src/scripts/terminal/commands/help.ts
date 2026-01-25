/**
 * help command - Show available commands
 */

import { escapeHtml } from "../renderers/helpers";
import type { Command, CommandContext, CommandResult } from "../types";

export const helpCommand: Command = {
  name: "help",
  aliases: ["man", "?"],
  description: "Show this help message",
  usage: "help",
  execute(ctx: CommandContext): CommandResult {
    const commands = ctx.registry
      .list()
      .sort((a, b) => a.name.localeCompare(b.name));

    const commandListHtml = commands
      .map((cmd) => {
        const usage = cmd.usage || cmd.name;
        const desc = cmd.description || "";
        return `
        <div class="grid grid-cols-[120px_1fr] gap-2">
          <span class="text-term-green">${escapeHtml(usage)}</span>
          <span class="text-term-fg-dark">${escapeHtml(desc)}</span>
        </div>`;
      })
      .join("");

    const html = `<div class="space-y-4">
      <div class="text-term-cyan font-medium">Available Commands:</div>
      
      <div class="space-y-2 text-sm">
        ${commandListHtml}
      </div>
      
      <div class="text-term-fg-dark text-sm mt-4">
        <div>Tips:</div>
        <div>• Use <span class="text-term-yellow">Tab</span> for auto-completion</div>
        <div>• Use <span class="text-term-yellow">↑/↓</span> to navigate command history</div>
        <div>• Use <span class="text-term-yellow">Ctrl+L</span> to clear screen</div>
        <div>• Click on any file/directory to interact with it</div>
      </div>
    </div>`;

    return { html };
  },
};
