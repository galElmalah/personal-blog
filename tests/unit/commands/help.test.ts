import { describe, it, expect, beforeEach } from 'vitest';
import { helpCommand } from '../../../src/scripts/terminal/commands/help';
import { commandRegistry } from '../../../src/scripts/terminal/commandRegistry';
import type { Command, CommandContext } from '../../../src/scripts/terminal/types';

describe('help command', () => {
  beforeEach(() => {
    // Reset the singleton registry
    (commandRegistry as any).commands = new Map();
    (commandRegistry as any).aliases = new Map();
    
    // Register help command itself
    commandRegistry.register(helpCommand);
  });

  it('lists registered commands', () => {
    // Register a test command
    const testCmd: Command = {
      name: 'test-cmd',
      description: 'A test command',
      usage: 'test-cmd [arg]',
      execute: () => ({ html: '' })
    };
    commandRegistry.register(testCmd);

    const ctx = { registry: commandRegistry } as CommandContext;
    const result = helpCommand.execute(ctx);

    expect(result.html).toContain('test-cmd [arg]');
    expect(result.html).toContain('A test command');
  });

  it('lists help command itself', () => {
    const ctx = { registry: commandRegistry } as CommandContext;
    const result = helpCommand.execute(ctx);

    expect(result.html).toContain('help');
    expect(result.html).toContain('Show this help message');
  });
  
  it('sorts commands alphabetically', () => {
    const cmdA: Command = { name: 'alpha', description: '', execute: () => ({ html: '' }) };
    const cmdZ: Command = { name: 'zebra', description: '', execute: () => ({ html: '' }) };
    
    commandRegistry.register(cmdZ);
    commandRegistry.register(cmdA);
    
    const ctx = { registry: commandRegistry } as CommandContext;
    const result = helpCommand.execute(ctx);
    
    const indexA = result.html.indexOf('alpha');
    const indexZ = result.html.indexOf('zebra');
    
    expect(indexA).toBeLessThan(indexZ);
  });
});
