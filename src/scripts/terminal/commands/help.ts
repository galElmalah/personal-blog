/**
 * help command - Show available commands
 */

import { escapeHtml } from "../renderers/helpers";
import type { Command, CommandContext, CommandResult } from "../types";

export const helpCommand: Command = {
  name: "help",
  aliases: ["man", "?"],
  description: "Show this help message",
  usage: "help [command]",
  execute(ctx: CommandContext): CommandResult {
    // If a specific command is requested, show detailed help
    if (ctx.args.length > 0) {
      const cmdName = ctx.args[0].toLowerCase();
      const cmd = ctx.registry.get(cmdName);

      if (!cmd) {
        return {
          html: `<span class="text-term-red">help: no help for '${escapeHtml(cmdName)}'</span>\n<span class="text-term-fg-dark">Type 'help' for available commands.</span>`,
          error: true,
        };
      }

      let html = `<div class="space-y-2">`;
      html += `<div><span class="text-term-cyan font-medium">${escapeHtml(cmd.name)}</span> — ${escapeHtml(cmd.description || "")}</div>`;
      if (cmd.usage) {
        html += `<div><span class="text-term-fg-dark">Usage:</span> <span class="text-term-green">${escapeHtml(cmd.usage)}</span></div>`;
      }
      if (cmd.aliases && cmd.aliases.length > 0) {
        html += `<div><span class="text-term-fg-dark">Aliases:</span> <span class="text-term-yellow">${cmd.aliases.map((a) => escapeHtml(a)).join(", ")}</span></div>`;
      }
      html += `</div>`;
      return { html };
    }

    const commands = ctx.registry
      .list()
      .sort((a, b) => a.name.localeCompare(b.name));

    const commandListHtml = commands
      .map((cmd) => {
        const usage = cmd.usage || cmd.name;
        const desc = cmd.description || "";
        const aliasStr =
          cmd.aliases && cmd.aliases.length > 0
            ? ` <span class="text-term-fg-dark text-xs">(${cmd.aliases.join(", ")})</span>`
            : "";
        return `
        <div class="grid grid-cols-[120px_1fr] gap-2">
          <span class="text-term-green">${escapeHtml(usage)}</span>
          <span class="text-term-fg-dark">${escapeHtml(desc)}${aliasStr}</span>
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
        <div>• Use <span class="text-term-yellow">help &lt;command&gt;</span> for detailed help on a specific command</div>
        <div>• Use <span class="text-term-yellow">Tab</span> for auto-completion</div>
        <div>• Use <span class="text-term-yellow">↑/↓</span> to navigate command history</div>
        <div>• Use <span class="text-term-yellow">Ctrl+L</span> to clear screen</div>
        <div>• Click on any file/directory to interact with it</div>
      </div>
    </div>`;

    return { html };
  },
};
