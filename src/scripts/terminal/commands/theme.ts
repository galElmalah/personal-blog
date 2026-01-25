import type { Command, CommandContext, CommandResult } from "../types";
import { escapeHtml } from "../renderers/helpers";

const AVAILABLE_THEMES = ["default", "ubuntu", "dracula", "matrix"];

export const themeCommand: Command = {
  name: "theme",
  description: "Switch terminal theme",
  usage: "theme [name]",
  execute(ctx: CommandContext): CommandResult {
    const theme = ctx.args[0]?.toLowerCase();

    if (!theme) {
      const currentTheme =
        document.documentElement.getAttribute("data-theme") || "default";
      return {
        html: `
          <div class="text-term-fg">
            <div>Current theme: <span class="text-term-yellow">${currentTheme}</span></div>
            <div class="mt-2">Available themes:</div>
            <div class="flex flex-wrap gap-2 mt-1">
              ${AVAILABLE_THEMES.map(
                (t) =>
                  `<span class="text-term-green cursor-pointer hover:underline" data-cmd="theme ${t}">${t}</span>`,
              ).join(" ")}
            </div>
          </div>
        `,
      };
    }

    if (!AVAILABLE_THEMES.includes(theme)) {
      return {
        html: `<span class="text-term-red">Theme '${escapeHtml(theme)}' not found.</span>
               <div class="text-term-fg-dark mt-1">Available themes: ${AVAILABLE_THEMES.join(", ")}</div>`,
        error: true,
      };
    }

    // Apply theme
    if (theme === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }

    // Persist
    try {
      localStorage.setItem("terminal-theme", theme);
    } catch (e) {
      // Ignore localStorage errors
    }

    return {
      html: `<span class="text-term-green">Theme switched to '${escapeHtml(theme)}'</span>`,
    };
  },
};
