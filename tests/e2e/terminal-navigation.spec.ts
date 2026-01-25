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

test.describe("Terminal Navigation via Commands", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForTerminalReady(page);
  });

  test("homepage loads with terminal interface", async ({ page }) => {
    // Verify terminal shell is present
    await expect(page.locator(".term-shell")).toBeVisible();

    // Verify ASCII art is rendered
    await expect(page.locator("#ascii-welcome")).toBeVisible();

    // Verify input is available
    await expect(page.locator("#command-input")).toBeVisible();
  });

  test("navigate to posts page via cd command", async ({ page }) => {
    await typeCommand(page, "cd posts");

    // Wait for navigation
    await page.waitForURL("**/posts");

    // Verify we're on the posts page
    await expect(page).toHaveURL(/\/posts$/);
  });

  test("navigate to series page via cd command", async ({ page }) => {
    await typeCommand(page, "cd series");

    // Wait for navigation
    await page.waitForURL("**/series");

    // Verify we're on the series page
    await expect(page).toHaveURL(/\/series$/);
  });

  test("navigate to tags page via cd command", async ({ page }) => {
    await typeCommand(page, "cd tags");

    // Wait for navigation
    await page.waitForURL("**/tags");

    // Verify we're on the tags page
    await expect(page).toHaveURL(/\/tags$/);
  });

  test("navigate to specific post via cd command", async ({ page }) => {
    // First, let's check what posts are available by running ls posts
    await typeCommand(page, "ls posts");

    // Wait for output to appear
    await page.waitForTimeout(500);

    // Now navigate to a specific post
    await typeCommand(page, "cd 2023-goals");

    // Wait for navigation
    await page.waitForURL("**/posts/2023-goals", { timeout: 10000 });

    // Verify we're on the post page
    await expect(page).toHaveURL(/\/posts\/2023-goals$/);

    // Verify post content is visible
    await expect(page.locator("article, .post-content, main")).toBeVisible();
  });

  test("navigate to post with posts/ prefix", async ({ page }) => {
    await typeCommand(page, "cd posts/2023-goals");

    // Wait for navigation
    await page.waitForURL("**/posts/2023-goals", { timeout: 10000 });

    // Verify we're on the post page
    await expect(page).toHaveURL(/\/posts\/2023-goals$/);
  });

  test("complete flow: home -> posts list -> specific post", async ({
    page,
  }) => {
    // Step 1: List posts
    await typeCommand(page, "ls posts");

    // Wait for posts list to appear
    await expect(page.locator("#terminal-output")).toContainText(".md");

    // Step 2: Navigate to posts page
    await typeCommand(page, "cd posts");
    await page.waitForURL("**/posts");

    // Step 3: Verify we can see post listings
    await expect(page).toHaveURL(/\/posts$/);
  });

  test("error handling for invalid path", async ({ page }) => {
    await typeCommand(page, "cd nonexistent-path");

    // Should show error message, not navigate
    await page.waitForTimeout(500);
    await expect(page.locator("#terminal-output")).toContainText(
      "no such file or directory",
    );

    // Should still be on homepage
    await expect(page).toHaveURL("/");
  });

  test("cd to home with tilde", async ({ page }) => {
    // First, let's verify we're at home
    await typeCommand(page, "pwd");
    await expect(page.locator("#terminal-output")).toContainText(
      "/home/gal/blog",
    );

    // Navigate somewhere conceptually and then back home
    await typeCommand(page, "cd ~");

    // Should not navigate away (home is the terminal page)
    await expect(page).toHaveURL("/");

    // Verify path is reset
    await typeCommand(page, "pwd");
    await expect(page.locator("#terminal-output")).toContainText(
      "/home/gal/blog",
    );
  });

  test("navigate to series specific page", async ({ page }) => {
    // List available series first
    await typeCommand(page, "ls series");
    await page.waitForTimeout(500);

    // Navigate to a specific series (Advent of Code 2022 should exist based on our test data)
    await typeCommand(page, "cd series/advent-of-code-2022");

    // Wait for navigation
    await page.waitForURL("**/series/**", { timeout: 10000 });

    // Verify we're on a series page
    await expect(page).toHaveURL(/\/series\//);
  });
});

test.describe("Terminal Command Output", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForTerminalReady(page);
  });

  test("ls command shows directories", async ({ page }) => {
    await typeCommand(page, "ls");

    // Verify output contains directories
    await expect(page.locator("#terminal-output")).toContainText("posts/");
    await expect(page.locator("#terminal-output")).toContainText("series/");
    await expect(page.locator("#terminal-output")).toContainText("tags/");
  });

  test("ls -l shows detailed view", async ({ page }) => {
    await typeCommand(page, "ls -l");

    // Verify detailed output
    await expect(page.locator("#terminal-output")).toContainText("drwxr-xr-x");
    await expect(page.locator("#terminal-output")).toContainText("total");
  });

  test("tree command shows directory structure", async ({ page }) => {
    await typeCommand(page, "tree");

    // Verify tree output
    await expect(page.locator("#terminal-output")).toContainText("posts/");
    await expect(page.locator("#terminal-output")).toContainText("series/");
    await expect(page.locator("#terminal-output")).toContainText("directories");
  });

  test("help command shows available commands", async ({ page }) => {
    await typeCommand(page, "help");

    // Verify help output lists commands
    await expect(page.locator("#terminal-output")).toContainText("ls");
    await expect(page.locator("#terminal-output")).toContainText("cd");
    await expect(page.locator("#terminal-output")).toContainText("cat");
    await expect(page.locator("#terminal-output")).toContainText("grep");
  });

  test("cat command shows post preview", async ({ page }) => {
    await typeCommand(page, "cat 2023-goals");

    // Verify cat output shows post details
    await expect(page.locator("#terminal-output")).toContainText("Goals");
    await expect(page.locator("#terminal-output")).toContainText(
      "Read full post",
    );
  });

  test("grep command searches posts", async ({ page }) => {
    await typeCommand(page, "grep Go");

    // Verify grep output
    await expect(page.locator("#terminal-output")).toContainText("match");
  });

  test("neofetch command shows system info", async ({ page }) => {
    await typeCommand(page, "neofetch");

    // Verify neofetch output
    await expect(page.locator("#terminal-output")).toContainText("gal");
    await expect(page.locator("#terminal-output")).toContainText("blog");
    await expect(page.locator("#terminal-output")).toContainText("Astro");
  });
});
