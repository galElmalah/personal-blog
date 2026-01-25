/**
 * history command - Show command history
 * Note: This command needs special handling in the engine since it accesses
 * command history which is stored in the engine, not in the context
 */

import type { Command, CommandResult } from "../types";
import { escapeHtml } from "../renderers/helpers";

/**
 * Render history output
 * @param history Array of command strings
 * @returns HTML output
 */
export function renderHistory(history: string[]): string {
  if (history.length === 0) {
    return '<span class="text-term-fg-dark">No commands in history</span>';
  }

  let output = '<div class="space-y-1">';
  const displayHistory = history.slice(-20);
  const startNum = Math.max(1, history.length - 19);

  displayHistory.forEach((cmd, idx) => {
    const num = (startNum + idx).toString().padStart(4, " ");
    output += `<div><span class="text-term-fg-dark">${num}</span>  <span class="text-term-fg">${escapeHtml(cmd)}</span></div>`;
  });
  output += "</div>";

  return output;
}

/**
 * History command definition
 * The execute function returns a placeholder - actual execution happens in the engine
 * because history is stored there
 */
export const historyCommand: Command = {
  name: "history",
  description: "Show command history",
  execute(): CommandResult {
    // This will be overridden by the engine
    return {
      html: '<span class="text-term-fg-dark">No commands in history</span>',
    };
  },
};
