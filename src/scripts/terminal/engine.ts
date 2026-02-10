/**
 * Terminal Engine - Slim core for interactive terminal
 * Handles input, history, tab completion, and delegates to commands
 */

import type { TerminalConfig, TerminalState, CommandContext, CommandResult, PostData } from './types';
import { CommandRegistry } from './commandRegistry';
import { createCommandRegistry, renderHistory } from './commands';
import { createContextHelpers, escapeHtml } from './renderers/helpers';

/**
 * Parse command input into arguments and flags
 */
function parseCommand(input: string): { command: string; args: string[]; flags: string[] } {
  const parts: string[] = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';

  for (const char of input) {
    if ((char === '"' || char === "'") && !inQuote) {
      inQuote = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuote) {
      inQuote = false;
      quoteChar = '';
    } else if (char === ' ' && !inQuote) {
      if (current) {
        parts.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }
  if (current) parts.push(current);

  const command = parts[0]?.toLowerCase() || '';
  const flags = parts.slice(1).filter(p => p.startsWith('-'));
  const args = parts.slice(1).filter(p => !p.startsWith('-'));

  return { command, args, flags };
}

/**
 * Terminal Engine class
 */
export class TerminalEngine {
  private posts: PostData[] = [];
  private outputContainer: HTMLElement | null = null;
  private inputElement: HTMLInputElement | null = null;
  private state: TerminalState = {
    currentPath: '~',
    commandHistory: [],
    historyIndex: -1,
  };
  private completionIndex = -1;
  private completionMatches: string[] = [];
  private registry: CommandRegistry;
  private directories = ['posts', 'series', 'tags'];

  constructor() {
    this.registry = createCommandRegistry();
  }

  /**
   * Initialize the terminal engine
   */
  init(config: TerminalConfig): void {
    this.posts = config.posts;
    this.outputContainer = config.outputContainer;
    this.inputElement = config.inputElement;
    this.state.currentPath = config.promptPath || '~';

    // Load history from sessionStorage
    const savedHistory = sessionStorage.getItem('terminal-history');
    if (savedHistory) {
      try {
        this.state.commandHistory = JSON.parse(savedHistory);
      } catch {
        this.state.commandHistory = [];
      }
    }

    this.setupInputHandler();
    
    // Only run initial ls if not skipped (pages with SSR content should skip)
    if (!config.skipInitialLs) {
      this.runInitialCommands();
    }
  }

  /**
   * Set up keyboard input handlers
   */
  private setupInputHandler(): void {
    if (!this.inputElement) return;

    this.inputElement.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          const cmd = this.inputElement!.value.trim();
          if (cmd) {
            this.executeCommand(cmd);
            this.state.commandHistory.push(cmd);
            this.saveHistory();
          }
          this.inputElement!.value = '';
          this.state.historyIndex = -1;
          this.resetCompletion();
          break;

        case 'ArrowUp':
          e.preventDefault();
          this.navigateHistory(-1);
          break;

        case 'ArrowDown':
          e.preventDefault();
          this.navigateHistory(1);
          break;

        case 'Tab':
          e.preventDefault();
          this.handleTabCompletion();
          break;

        case 'l':
          if (e.ctrlKey) {
            e.preventDefault();
            this.executeCommand('clear');
          }
          break;
      }
    });
  }

  /**
   * Navigate command history
   */
  private navigateHistory(direction: number): void {
    if (this.state.commandHistory.length === 0) return;

    if (this.state.historyIndex === -1) {
      this.state.historyIndex = direction === -1 ? this.state.commandHistory.length - 1 : 0;
    } else {
      this.state.historyIndex += direction;
    }

    this.state.historyIndex = Math.max(0, Math.min(this.state.commandHistory.length - 1, this.state.historyIndex));
    
    if (this.inputElement) {
      this.inputElement.value = this.state.commandHistory[this.state.historyIndex];
    }
  }

  /**
   * Handle tab completion
   */
  private handleTabCompletion(): void {
    if (!this.inputElement) return;

    const input = this.inputElement.value;
    const parts = input.split(' ');
    const lastPart = parts[parts.length - 1];

    if (this.completionMatches.length === 0 || !lastPart.startsWith(this.completionMatches[0]?.slice(0, lastPart.length) || '')) {
      this.completionMatches = this.getCompletionCandidates(parts[0], lastPart);
      this.completionIndex = 0;
    } else {
      this.completionIndex = (this.completionIndex + 1) % this.completionMatches.length;
    }

    if (this.completionMatches.length > 0) {
      parts[parts.length - 1] = this.completionMatches[this.completionIndex];
      this.inputElement.value = parts.join(' ');
    }
  }

  /**
   * Get series names from posts for completion
   */
  private getSeriesCompletions(prefix: string): string[] {
    const seriesSet = new Set<string>();
    this.posts.forEach(post => {
      if (post.series) {
        const slug = post.series.toLowerCase().replace(/\s+/g, '-');
        if (slug.startsWith(prefix.toLowerCase())) {
          seriesSet.add(slug);
        }
      }
    });
    return [...seriesSet].sort();
  }

  /**
   * Get tag names from posts for completion
   */
  private getTagCompletions(prefix: string): string[] {
    const tagSet = new Set<string>();
    this.posts.forEach(post => {
      post.tags.forEach(tag => {
        const slug = tag.toLowerCase().replace(/\s+/g, '-');
        if (slug.startsWith(prefix.toLowerCase())) {
          tagSet.add(slug);
        }
      });
    });
    return [...tagSet].sort();
  }

  /**
   * Get post slug completions
   */
  private getPostCompletions(prefix: string): string[] {
    return this.posts
      .filter(post => post.slug.toLowerCase().startsWith(prefix.toLowerCase()))
      .map(post => post.slug)
      .sort();
  }

  /**
   * Get tab completion candidates
   */
  private getCompletionCandidates(command: string, partial: string): string[] {
    const candidates: string[] = [];
    const lowerPartial = partial.toLowerCase();

    // Command completion (when typing the first word)
    if (command === partial) {
      return this.registry.getCompletions(lowerPartial);
    }

    // Delegate to command if it supports autocomplete
    const cmd = this.registry.get(command);
    if (cmd && cmd.autocomplete) {
      const ctx = this.createContext([], []);
      return cmd.autocomplete(ctx, partial);
    }

    // Theme completion
    if (command === 'theme') {
      const themes = ['default', 'ubuntu', 'dracula', 'matrix'];
      return themes.filter(t => t.startsWith(lowerPartial));
    }

    // Commands that accept path arguments
    const pathCommands = ['tree', 'find'];
    
    if (pathCommands.includes(command)) {
      // Context-aware completion based on current path
      if (!partial.includes('/')) {
        if (this.state.currentPath === '~/posts') {
          candidates.push(...this.getPostCompletions(partial));
        } else if (this.state.currentPath === '~/series') {
          candidates.push(...this.getSeriesCompletions(partial));
        } else if (this.state.currentPath === '~/tags') {
          candidates.push(...this.getTagCompletions(partial));
        }
      }

      // Series completion: series/<name>
      if (partial.startsWith('series/')) {
        const search = partial.slice(7); // Remove 'series/'
        const seriesMatches = this.getSeriesCompletions(search);
        return seriesMatches.map(s => `series/${s}`);
      }

      // Tags completion: tags/<name>
      if (partial.startsWith('tags/')) {
        const search = partial.slice(5); // Remove 'tags/'
        const tagMatches = this.getTagCompletions(search);
        return tagMatches.map(t => `tags/${t}`);
      }

      // Posts completion: posts/<slug>
      if (partial.startsWith('posts/')) {
        const search = partial.slice(6); // Remove 'posts/'
        const postMatches = this.getPostCompletions(search);
        return postMatches.map(p => `posts/${p}`);
      }

      // Directory completion (top-level directories)
      this.directories.forEach(dir => {
        if (dir.startsWith(lowerPartial)) {
          candidates.push(`${dir}/`);
        }
      });
    }

    // Grep command - suggest post slugs as search targets
    if (command === 'grep' && partial && !partial.startsWith('-')) {
      // If there's already an argument (the pattern), suggest post slugs
      const postMatches = this.getPostCompletions(partial);
      candidates.push(...postMatches);
    }

    return candidates;
  }

  private resetCompletion(): void {
    this.completionIndex = -1;
    this.completionMatches = [];
  }

  private saveHistory(): void {
    const toSave = this.state.commandHistory.slice(-50);
    sessionStorage.setItem('terminal-history', JSON.stringify(toSave));
  }

  private runInitialCommands(): void {
    setTimeout(() => {
      // Execute ls command to show initial listing
      const ctx = this.createContext([], []);
      const cmd = this.registry.get('ls');
      if (cmd) {
        const result = cmd.execute(ctx);
        this.appendOutput(result.html, false);
      }
    }, 100);
  }

  /**
   * Create a command context
   */
  private createContext(args: string[], flags: string[]): CommandContext {
    return {
      registry: this.registry,
      posts: this.posts,
      currentPath: this.state.currentPath,
      args,
      flags,
      ...createContextHelpers(this.posts),
    };
  }

  /**
   * Execute a command
   */
  executeCommand(input: string): void {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Parse command
    const { command, args, flags } = parseCommand(trimmed);

    // Special case: history command needs access to engine state
    if (command === 'history') {
      this.appendCommandLine(trimmed);
      this.appendOutput(renderHistory(this.state.commandHistory));
      this.scrollToBottom();
      return;
    }

    // Look up and execute command
    const cmd = this.registry.get(command);

    let result: CommandResult;
    if (cmd) {
      const ctx = this.createContext(args, flags);
      result = cmd.execute(ctx);
    } else {
      result = {
        html: `<span class="text-term-red">command not found: ${escapeHtml(command)}</span>\n<span class="text-term-fg-dark">Type 'help' for available commands.</span>`,
        error: true,
      };
    }

    // Navigate immediately without any DOM changes to avoid scroll flash
    if (result.goBack) {
      history.back();
      return;
    }
    if (result.navigate) {
      window.location.href = result.navigate;
      return;
    }

    // Show command in output (after navigation check to avoid scroll flash)
    this.appendCommandLine(trimmed);

    // Handle result
    if (result.clear) {
      this.clearOutput();
      return;
    }

    if (result.newPath) {
      this.state.currentPath = result.newPath;
    }

    if (result.html) {
      this.appendOutput(result.html);
    }

    this.scrollToBottom();
  }

  /**
   * Append command line to output
   */
  private appendCommandLine(command: string): void {
    if (!this.outputContainer) return;

    const cmdLine = document.createElement('div');
    cmdLine.className = 'term-history-entry mb-1';
    cmdLine.innerHTML = `
      <span class="term-prompt">
        <span class="text-term-green">gal</span><span class="text-term-fg-dark">@</span><span class="text-term-purple">blog</span>
        <span class="text-term-blue ml-1">${this.state.currentPath}</span>
        <span class="text-term-cyan ml-1">(main)</span>
        <span class="text-term-fg ml-1">$</span>
      </span>
      <span class="text-term-green ml-2">${escapeHtml(command)}</span>
    `;
    this.outputContainer.appendChild(cmdLine);
  }

  /**
   * Append output HTML
   */
  private appendOutput(html: string, addMargin = true): void {
    if (!this.outputContainer) return;

    const outputDiv = document.createElement('div');
    outputDiv.className = addMargin ? 'term-output mb-2' : 'term-output mb-1';
    outputDiv.innerHTML = html;

    // Add click handlers for interactive elements
    outputDiv.querySelectorAll('[data-cmd]').forEach(el => {
      el.addEventListener('click', (e) => {
        const htmlEl = el as HTMLElement;
        const cmd = htmlEl.dataset.cmd;

        // If element is a link with href, let the browser navigate naturally
        if (el.tagName === 'A' && (el as HTMLAnchorElement).href) {
          return;
        }

        // For non-link elements (directories, commands), execute the command
        e.preventDefault();
        if (cmd) {
          this.executeCommand(cmd);
          if (this.inputElement) {
            this.inputElement.value = '';
          }
        }
      });
    });

    this.outputContainer.appendChild(outputDiv);
  }

  /**
   * Clear output
   */
  private clearOutput(): void {
    if (this.outputContainer) {
      this.outputContainer.innerHTML = '';
    }
    // Re-run initial ls after clear
    setTimeout(() => {
      const ctx = this.createContext([], []);
      const cmd = this.registry.get('ls');
      if (cmd) {
        const result = cmd.execute(ctx);
        this.appendOutput(result.html, false);
      }
    }, 50);
  }

  /**
   * Scroll to bottom
   */
  private scrollToBottom(): void {
    if (this.outputContainer) {
      const shell = this.outputContainer.closest('.term-shell');
      if (shell) {
        shell.scrollTop = shell.scrollHeight;
      }
    }
  }
}

// Export singleton
export const terminal = new TerminalEngine();
