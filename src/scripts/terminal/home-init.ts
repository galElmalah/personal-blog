import { TerminalEngine } from './engine';

const asciiArt = `
██╗    ██╗███████╗██╗      ██████╗ ██████╗ ███╗   ███╗███████╗
██║    ██║██╔════╝██║     ██╔════╝██╔═══██╗████╗ ████║██╔════╝
██║ █╗ ██║█████╗  ██║     ██║     ██║   ██║██╔████╔██║█████╗  
██║███╗██║██╔══╝  ██║     ██║     ██║   ██║██║╚██╔╝██║██╔══╝  
╚███╔███╔╝███████╗███████╗╚██████╗╚██████╔╝██║ ╚═╝ ██║███████╗
 ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝
`.trim();

export function initTheme() {
  try {
    const savedTheme = localStorage.getItem('terminal-theme');
    if (savedTheme && savedTheme !== 'default') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  } catch (e) {
    // Ignore localStorage errors
  }
}

export function initHomePage() {
  // Initialize theme first
  initTheme();

  // Get posts data from TerminalContext global
  const postsData = (window as any).__TERMINAL_POSTS__ || [];
  
  // Check if already initialized
  if ((window as any).__TERMINAL_ENGINE_INITIALIZED__) {
    return;
  }

  // Create terminal instance and store globally
  const terminal = new TerminalEngine();
  (window as any).__TERMINAL_ENGINE__ = terminal;
  (window as any).__TERMINAL_ENGINE_INITIALIZED__ = true;

  // DOM Elements
  const preElement = document.querySelector('#ascii-welcome pre');
  const introSection = document.getElementById('intro-section');
  const inputSection = document.getElementById('input-section');
  const commandInput = document.getElementById('command-input') as HTMLInputElement;
  const terminalOutput = document.getElementById('terminal-output');

  if (preElement && introSection && inputSection) {
    const pre = preElement;
    const intro = introSection;
    const input = inputSection;
    
    const lines = asciiArt.split('\n');
    let currentLine = 0;
    const displayLines: string[] = [];
    
    function streamAscii() {
      if (currentLine < lines.length) {
        displayLines.push(lines[currentLine]);
        pre.textContent = displayLines.join('\n');
        currentLine++;
        setTimeout(streamAscii, 50);
      } else {
        // Show intro and input sections
        intro.classList.remove('hidden');
        input.classList.remove('hidden');
        
        // Initialize terminal engine with posts data from TerminalContext
        if (commandInput && terminalOutput) {
          terminal.init({
            posts: postsData,
            outputContainer: terminalOutput,
            inputElement: commandInput,
            promptPath: '~'
          });
        }
        
        // Focus input
        setTimeout(() => commandInput?.focus(), 100);
      }
    }
    
    // Start animation after a brief delay
    setTimeout(streamAscii, 200);
  }

  // Mobile suggestion buttons
  document.querySelectorAll('.term-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = (btn as HTMLElement).dataset.cmd;
      if (cmd && commandInput) {
        commandInput.value = cmd;
        commandInput.focus();
        // Execute immediately if command doesn't need arguments
        if (!cmd.endsWith(' ')) {
          terminal.executeCommand(cmd);
          commandInput.value = '';
        }
      }
    });
  });

  // Click anywhere in terminal to focus input
  document.querySelector('.term-shell')?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('a') && !target.closest('button') && !target.closest('input')) {
      commandInput?.focus();
    }
  });
}
