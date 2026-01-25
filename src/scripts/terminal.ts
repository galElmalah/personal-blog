/**
 * Terminal Blog - Client-side interactivity
 * Handles command history, click-to-command interactions, and view switching
 */

interface CommandHistoryEntry {
  command: string;
  timestamp: number;
}

interface TerminalState {
  currentPath: string;
  commandHistory: CommandHistoryEntry[];
  currentView: "ls" | "tree" | "cat";
}

// Initialize terminal state
const state: TerminalState = {
  currentPath: "~",
  commandHistory: [],
  currentView: "ls",
};

// DOM Elements
let historyContainer: HTMLElement | null = null;
let commandInput: HTMLInputElement | null = null;
let terminalShell: HTMLElement | null = null;

/**
 * Initialize the terminal interactivity
 */
export function initTerminal(): void {
  terminalShell = document.getElementById("terminal-shell");
  historyContainer = document.getElementById("command-history");
  commandInput = document.getElementById("command-input") as HTMLInputElement;

  if (!terminalShell) return;

  // Set up click-to-command handlers
  setupClickHandlers();

  // Set up keyboard input if command input exists
  if (commandInput) {
    setupKeyboardInput();
  }

  // Log initialization
  console.log("[Terminal] Initialized");
}

/**
 * Set up click handlers for interactive elements
 */
function setupClickHandlers(): void {
  if (!terminalShell) return;

  // Handle clicks on elements with data-command attribute
  terminalShell.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const commandElement = target.closest(
      "[data-command]",
    ) as HTMLElement | null;

    if (commandElement) {
      const command = commandElement.dataset.command;
      if (command) {
        event.preventDefault();
        executeCommand(command);
      }
    }
  });

  // Handle view switcher buttons
  const viewSwitchers = terminalShell.querySelectorAll("[data-view]");
  viewSwitchers.forEach((switcher) => {
    switcher.addEventListener("click", (event) => {
      event.preventDefault();
      const view = (switcher as HTMLElement).dataset.view as
        | "ls"
        | "tree"
        | "cat";
      if (view) {
        switchView(view);
      }
    });
  });
}

/**
 * Set up keyboard input handler
 */
function setupKeyboardInput(): void {
  if (!commandInput) return;

  commandInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const command = commandInput!.value.trim();
      if (command) {
        executeCommand(command);
        commandInput!.value = "";
      }
    }
  });

  // Focus input when clicking anywhere in terminal
  terminalShell?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    // Don't focus if clicking a link or button
    if (!target.closest("a") && !target.closest("button")) {
      commandInput?.focus();
    }
  });
}

/**
 * Execute a terminal command
 */
function executeCommand(command: string): void {
  // Add to history
  addToHistory(command);

  // Parse command
  const [cmd, ...args] = command.split(" ");
  const arg = args.join(" ");

  switch (cmd.toLowerCase()) {
    case "cd":
      navigateTo(arg);
      break;
    case "cat":
      showPostPreview(arg);
      break;
    case "ls":
      switchView("ls");
      break;
    case "tree":
      switchView("tree");
      break;
    case "clear":
      clearHistory();
      break;
    case "help":
      showHelp();
      break;
    default:
      showError(`Command not found: ${cmd}`);
  }
}

/**
 * Add command to history display
 */
function addToHistory(command: string): void {
  state.commandHistory.push({
    command,
    timestamp: Date.now(),
  });

  // Display in history container if it exists
  if (historyContainer) {
    const entry = document.createElement("div");
    entry.className = "term-history-entry";
    entry.innerHTML = `
      <span class="term-prompt">
        <span class="term-prompt-user">gal</span>
        <span class="term-prompt-at">@</span>
        <span class="term-prompt-host">blog</span>
        <span class="term-prompt-path ml-1">${state.currentPath}</span>
        <span class="term-prompt-git ml-1">(main)</span>
        <span class="term-prompt-symbol">$</span>
      </span>
      <span class="term-command ml-2">${escapeHtml(command)}</span>
    `;
    historyContainer.appendChild(entry);

    // Scroll to bottom
    historyContainer.scrollTop = historyContainer.scrollHeight;
  }
}

/**
 * Navigate to a post or series
 */
function navigateTo(path: string): void {
  if (!path) {
    showError("Usage: cd <path>");
    return;
  }

  // Handle navigation
  if (path.startsWith("/")) {
    // Absolute path
    window.location.href = path;
  } else if (path.endsWith("/")) {
    // Series directory
    window.location.href = `/series/${path.slice(0, -1)}`;
  } else {
    // Post
    window.location.href = `/posts/${path}`;
  }
}

/**
 * Show post preview (cat command)
 */
function showPostPreview(slug: string): void {
  if (!slug) {
    showError("Usage: cat <post-slug>");
    return;
  }

  // Navigate to post page for now
  // In a more advanced implementation, this could fetch and display inline
  window.location.href = `/posts/${slug}`;
}

/**
 * Switch between ls/tree/cat views
 */
function switchView(view: "ls" | "tree" | "cat"): void {
  state.currentView = view;

  // Hide all view containers
  const views = document.querySelectorAll("[data-view-content]");
  views.forEach((v) => {
    (v as HTMLElement).style.display = "none";
  });

  // Show selected view
  const selectedView = document.querySelector(`[data-view-content="${view}"]`);
  if (selectedView) {
    (selectedView as HTMLElement).style.display = "block";
  }

  // Update active state on view switchers
  const switchers = document.querySelectorAll("[data-view]");
  switchers.forEach((s) => {
    s.classList.toggle("active", (s as HTMLElement).dataset.view === view);
  });

  console.log(`[Terminal] Switched to ${view} view`);
}

/**
 * Clear command history
 */
function clearHistory(): void {
  state.commandHistory = [];
  if (historyContainer) {
    historyContainer.innerHTML = "";
  }
}

/**
 * Show help message
 */
function showHelp(): void {
  const helpText = `
Available commands:
  ls          List posts in current directory
  tree        Show hierarchical view of all posts
  cat <post>  Preview a post
  cd <path>   Navigate to a post or series
  clear       Clear the terminal
  help        Show this help message
`;

  if (historyContainer) {
    const helpDiv = document.createElement("div");
    helpDiv.className = "term-output text-term-fg-dark whitespace-pre";
    helpDiv.textContent = helpText;
    historyContainer.appendChild(helpDiv);
  }
}

/**
 * Show error message
 */
function showError(message: string): void {
  if (historyContainer) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "term-error";
    errorDiv.textContent = message;
    historyContainer.appendChild(errorDiv);
  }
  console.error(`[Terminal] ${message}`);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Auto-initialize when DOM is ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTerminal);
  } else {
    initTerminal();
  }
}

export { state, executeCommand, switchView };
