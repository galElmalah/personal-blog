import { describe, it, expect, beforeEach, vi } from 'vitest';
import { themeCommand } from '../../../src/scripts/terminal/commands/theme';
import type { CommandContext } from '../../../src/scripts/terminal/types';

describe('theme command', () => {
  beforeEach(() => {
    // Mock document and localStorage
    vi.stubGlobal('document', {
      documentElement: {
        getAttribute: vi.fn(),
        setAttribute: vi.fn(),
        removeAttribute: vi.fn(),
      },
      createElement: (tag: string) => {
        if (tag === 'div') {
          let content = '';
          return {
            set textContent(val: string) { content = val; },
            get innerHTML() { return content; }
          };
        }
        return {};
      }
    });
    
    vi.stubGlobal('localStorage', {
      setItem: vi.fn(),
      getItem: vi.fn(),
    });
  });

  it('lists current and available themes when no arg provided', () => {
    (document.documentElement.getAttribute as any).mockReturnValue('default');
    
    const ctx = { args: [] } as CommandContext;
    const result = themeCommand.execute(ctx);
    
    expect(result.html).toContain('Current theme');
    expect(result.html).toContain('default');
    expect(result.html).toContain('ubuntu');
    expect(result.html).toContain('dracula');
  });

  it('switches theme when valid theme provided', () => {
    const ctx = { args: ['dracula'] } as CommandContext;
    const result = themeCommand.execute(ctx);
    
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dracula');
    expect(localStorage.setItem).toHaveBeenCalledWith('terminal-theme', 'dracula');
    expect(result.html).toContain("Theme switched to 'dracula'");
  });

  it('removes theme attribute when switching to default', () => {
    const ctx = { args: ['default'] } as CommandContext;
    const result = themeCommand.execute(ctx);
    
    expect(document.documentElement.removeAttribute).toHaveBeenCalledWith('data-theme');
    expect(localStorage.setItem).toHaveBeenCalledWith('terminal-theme', 'default');
  });

  it('shows error for invalid theme', () => {
    const ctx = { args: ['invalid'] } as CommandContext;
    const result = themeCommand.execute(ctx);
    
    expect(result.error).toBe(true);
    expect(result.html).toContain("Theme 'invalid' not found");
  });
});
