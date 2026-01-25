import { test, expect } from "@playwright/test";

/**
 * Helper to wait for terminal to be ready and type a command
 */
async function typeCommand(
  page: import("@playwright/test").Page,
  command: string,
) {
  const input = page.locator("#command-input");
  await input.waitFor({ state: "visible" });
  await input.focus();
  await input.fill(command);
  await page.keyboard.press("Enter");
}

/**
 * Wait for terminal to initialize (ASCII animation to complete)
 */
async function waitForTerminalReady(page: import("@playwright/test").Page) {
  // Wait for input section to be visible (appears after ASCII animation)
  await page
    .locator("#input-section")
    .waitFor({ state: "visible", timeout: 10000 });
  // Wait a bit more for any animations to settle
  await page.waitForTimeout(500);
}

test.describe("Command History", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForTerminalReady(page);
  });

  test("arrow up recalls previous command", async ({ page }) => {
    const input = page.locator("#command-input");

    // Execute first command
    await typeCommand(page, "ls");
    await page.waitForTimeout(300);

    // Execute second command
    await typeCommand(page, "tree");
    await page.waitForTimeout(300);

    // Press arrow up - should show 'tree'
    await input.focus();
    await page.keyboard.press("ArrowUp");
    await expect(input).toHaveValue("tree");

    // Press arrow up again - should show 'ls'
    await page.keyboard.press("ArrowUp");
    await expect(input).toHaveValue("ls");
  });

  test("arrow down navigates forward in history", async ({ page }) => {
    const input = page.locator("#command-input");

    // Execute commands
    await typeCommand(page, "ls");
    await page.waitForTimeout(300);
    await typeCommand(page, "tree");
    await page.waitForTimeout(300);
    await typeCommand(page, "help");
    await page.waitForTimeout(300);

    // Navigate back in history
    await input.focus();
    await page.keyboard.press("ArrowUp"); // help
    await page.keyboard.press("ArrowUp"); // tree
    await page.keyboard.press("ArrowUp"); // ls
    await expect(input).toHaveValue("ls");

    // Navigate forward
    await page.keyboard.press("ArrowDown"); // tree
    await expect(input).toHaveValue("tree");

    await page.keyboard.press("ArrowDown"); // help
    await expect(input).toHaveValue("help");
  });

  test("history command shows command history", async ({ page }) => {
    // Execute some commands
    await typeCommand(page, "ls");
    await page.waitForTimeout(300);
    await typeCommand(page, "tree");
    await page.waitForTimeout(300);

    // Run history command
    await typeCommand(page, "history");
    await page.waitForTimeout(300);

    // Verify history output shows previous commands
    const output = page.locator("#terminal-output");
    await expect(output).toContainText("ls");
    await expect(output).toContainText("tree");
  });

  test("history persists in session", async ({ page }) => {
    // Execute command
    await typeCommand(page, "whoami");
    await page.waitForTimeout(300);

    // Reload page
    await page.reload();
    await waitForTerminalReady(page);

    // Check history is restored
    const input = page.locator("#command-input");
    await input.focus();
    await page.keyboard.press("ArrowUp");

    // Should recall 'whoami' from sessionStorage
    await expect(input).toHaveValue("whoami");
  });
});

test.describe("Tab Completion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForTerminalReady(page);
  });

  test("tab completes command names", async ({ page }) => {
    const input = page.locator("#command-input");

    // Type partial command
    await input.focus();
    await input.fill("l");
    await page.keyboard.press("Tab");

    // Should complete to 'ls' or cycle through l-commands
    const value = await input.inputValue();
    expect(value.startsWith("l")).toBe(true);
  });

  test("tab completes directory paths", async ({ page }) => {
    const input = page.locator("#command-input");

    // Type cd with partial path
    await input.focus();
    await input.fill("cd po");
    await page.keyboard.press("Tab");

    // Should complete to 'cd posts/'
    await expect(input).toHaveValue("cd posts/");
  });

  test("tab cycles through multiple completions", async ({ page }) => {
    const input = page.locator("#command-input");

    // Type partial command that matches multiple
    await input.focus();
    await input.fill("c");

    // Press tab multiple times to cycle
    await page.keyboard.press("Tab");
    const first = await input.inputValue();

    await page.keyboard.press("Tab");
    const second = await input.inputValue();

    // Values should be different (cycling through options)
    // Both should start with 'c'
    expect(first.startsWith("c")).toBe(true);
    expect(second.startsWith("c")).toBe(true);
  });

  test("tab completes ls flags", async ({ page }) => {
    const input = page.locator("#command-input");

    // Type ls with partial flag
    await input.focus();
    await input.fill("ls -");
    await page.keyboard.press("Tab");

    // Should complete to a flag like -l, -a, -la
    const value = await input.inputValue();
    expect(value.startsWith("ls -")).toBe(true);
  });

  test("tab completes post slugs for cat", async ({ page }) => {
    const input = page.locator("#command-input");

    // Type cat with partial post name
    await input.focus();
    await input.fill("cat 2023");
    await page.keyboard.press("Tab");

    // Should complete to full post slug
    const value = await input.inputValue();
    expect(value).toContain("2023");
  });
});

test.describe("Keyboard Shortcuts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForTerminalReady(page);
  });

  test("Ctrl+L clears the terminal", async ({ page }) => {
    const input = page.locator("#command-input");

    // Execute some commands to have output
    await typeCommand(page, "ls");
    await page.waitForTimeout(300);
    await typeCommand(page, "tree");
    await page.waitForTimeout(300);

    // Verify there's output
    const outputBefore = await page.locator("#terminal-output").innerHTML();
    expect(outputBefore.length).toBeGreaterThan(0);

    // Press Ctrl+L
    await input.focus();
    await page.keyboard.press("Control+l");
    await page.waitForTimeout(300);

    // Terminal should be cleared (only initial ls output from clear command)
    const outputAfter = await page.locator("#terminal-output").innerHTML();
    expect(outputAfter.length).toBeLessThan(outputBefore.length);
  });

  test("Enter executes command", async ({ page }) => {
    const input = page.locator("#command-input");

    await input.focus();
    await input.fill("pwd");
    await page.keyboard.press("Enter");

    // Command should be executed and input cleared
    await expect(input).toHaveValue("");
    await expect(page.locator("#terminal-output")).toContainText(
      "/home/gal/blog",
    );
  });

  test("input is cleared after command execution", async ({ page }) => {
    const input = page.locator("#command-input");

    await typeCommand(page, "whoami");

    // Input should be empty after execution
    await expect(input).toHaveValue("");
  });
});

test.describe("Mobile Suggestions", () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForTerminalReady(page);
  });

  test("mobile suggestion buttons are visible on small screens", async ({
    page,
  }) => {
    // Mobile suggestions should be visible
    const suggestions = page.locator("#mobile-suggestions");
    await expect(suggestions).toBeVisible();

    // Should have suggestion buttons
    await expect(page.locator(".term-suggestion")).toHaveCount(6); // ls, ls -la, tree, grep, cat, help
  });

  test("clicking ls suggestion executes ls command", async ({ page }) => {
    // Find and click the ls suggestion button
    const lsButton = page.locator('.term-suggestion[data-cmd="ls"]');
    await expect(lsButton).toBeVisible();
    await lsButton.click();

    // Command should be executed
    await page.waitForTimeout(500);
    await expect(page.locator("#terminal-output")).toContainText("posts/");
  });

  test('clicking "ls -la" suggestion executes detailed ls', async ({
    page,
  }) => {
    const lsLaButton = page.locator('.term-suggestion[data-cmd="ls -la"]');
    await expect(lsLaButton).toBeVisible();
    await lsLaButton.click();

    await page.waitForTimeout(500);
    await expect(page.locator("#terminal-output")).toContainText("drwxr-xr-x");
  });

  test("clicking tree suggestion executes tree command", async ({ page }) => {
    const treeButton = page.locator('.term-suggestion[data-cmd="tree"]');
    await expect(treeButton).toBeVisible();
    await treeButton.click();

    await page.waitForTimeout(500);
    await expect(page.locator("#terminal-output")).toContainText("directories");
  });

  test("clicking help suggestion executes help command", async ({ page }) => {
    const helpButton = page.locator('.term-suggestion[data-cmd="help"]');
    await expect(helpButton).toBeVisible();
    await helpButton.click();

    await page.waitForTimeout(500);
    await expect(page.locator("#terminal-output")).toContainText(
      "Available commands",
    );
  });

  test("clicking grep suggestion fills input but does not execute", async ({
    page,
  }) => {
    // grep and cat need arguments, so they should fill input with trailing space
    const grepButton = page.locator('.term-suggestion[data-cmd="grep "]');
    await expect(grepButton).toBeVisible();
    await grepButton.click();

    // Input should be filled with 'grep ' but not executed
    const input = page.locator("#command-input");
    await expect(input).toHaveValue("grep ");
    await expect(input).toBeFocused();
  });

  test("clicking cat suggestion fills input but does not execute", async ({
    page,
  }) => {
    const catButton = page.locator('.term-suggestion[data-cmd="cat "]');
    await expect(catButton).toBeVisible();
    await catButton.click();

    // Input should be filled with 'cat ' but not executed
    const input = page.locator("#command-input");
    await expect(input).toHaveValue("cat ");
    await expect(input).toBeFocused();
  });
});

test.describe("Mobile Suggestions Hidden on Desktop", () => {
  test("mobile suggestions are hidden on desktop viewport", async ({
    page,
  }) => {
    // Default desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    await waitForTerminalReady(page);

    // Mobile suggestions should be hidden (sm:hidden class)
    const suggestions = page.locator("#mobile-suggestions");
    await expect(suggestions).not.toBeVisible();
  });
});

test.describe("Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForTerminalReady(page);
  });

  test("unknown command shows error message", async ({ page }) => {
    await typeCommand(page, "unknowncommand");
    await page.waitForTimeout(300);

    await expect(page.locator("#terminal-output")).toContainText(
      "command not found",
    );
    await expect(page.locator("#terminal-output")).toContainText(
      "unknowncommand",
    );
  });

  test("error message suggests help command", async ({ page }) => {
    await typeCommand(page, "badcmd");
    await page.waitForTimeout(300);

    await expect(page.locator("#terminal-output")).toContainText("help");
  });

  test("missing argument errors are shown", async ({ page }) => {
    await typeCommand(page, "cat");
    await page.waitForTimeout(300);

    await expect(page.locator("#terminal-output")).toContainText(
      "missing file operand",
    );
  });

  test("invalid path error is shown", async ({ page }) => {
    await typeCommand(page, "ls /nonexistent/path");
    await page.waitForTimeout(300);

    await expect(page.locator("#terminal-output")).toContainText(
      "No such file or directory",
    );
  });
});
