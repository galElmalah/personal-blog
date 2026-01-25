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

test.describe("Click-based Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForTerminalReady(page);
  });

  test("click on posts/ directory in ls output triggers ls posts command", async ({
    page,
  }) => {
    // Run ls to get the directory listing
    await typeCommand(page, "ls");
    await page.waitForTimeout(500);

    // Click on posts/ directory (data-cmd="ls posts/")
    const postsDir = page.locator('[data-cmd="ls posts/"]').first();
    await expect(postsDir).toBeVisible();
    await postsDir.click();

    // Verify the command was filled in the input
    const input = page.locator("#command-input");
    await expect(input).toHaveValue("ls posts/");
  });

  test("click on series/ directory in ls output", async ({ page }) => {
    await typeCommand(page, "ls");
    await page.waitForTimeout(500);

    const seriesDir = page.locator('[data-cmd="ls series/"]').first();
    await expect(seriesDir).toBeVisible();
    await seriesDir.click();

    const input = page.locator("#command-input");
    await expect(input).toHaveValue("ls series/");
  });

  test("click on tags/ directory in ls output", async ({ page }) => {
    await typeCommand(page, "ls");
    await page.waitForTimeout(500);

    const tagsDir = page.locator('[data-cmd="ls tags/"]').first();
    await expect(tagsDir).toBeVisible();
    await tagsDir.click();

    const input = page.locator("#command-input");
    await expect(input).toHaveValue("ls tags/");
  });

  test("click on post link in ls posts output navigates to post", async ({
    page,
  }) => {
    // Run ls posts
    await typeCommand(page, "ls posts");
    await page.waitForTimeout(500);

    // Find a post link and click it
    const postLink = page
      .locator('#terminal-output a[href^="/posts/"]')
      .first();
    await expect(postLink).toBeVisible();

    // Get the href to know where we'll navigate
    const href = await postLink.getAttribute("href");

    // Click the link
    await postLink.click();

    // Verify navigation
    await page.waitForURL(`**${href}`, { timeout: 10000 });
    await expect(page).toHaveURL(new RegExp(href!));
  });

  test('click on "Read full post" link in cat output navigates to post', async ({
    page,
  }) => {
    // Cat a specific post
    await typeCommand(page, "cat 2023-goals");
    await page.waitForTimeout(500);

    // Find and click the "Read full post" link
    const readLink = page
      .locator("#terminal-output a.term-link")
      .filter({ hasText: "Read full post" });
    await expect(readLink).toBeVisible();

    await readLink.click();

    // Verify navigation to the post page
    await page.waitForURL("**/posts/2023-goals", { timeout: 10000 });
    await expect(page).toHaveURL(/\/posts\/2023-goals$/);
  });

  test("click on search result in grep output navigates to post", async ({
    page,
  }) => {
    // Search for something
    await typeCommand(page, "grep Goals");
    await page.waitForTimeout(500);

    // Find and click a search result link
    const resultLink = page
      .locator('#terminal-output a[href^="/posts/"]')
      .first();
    await expect(resultLink).toBeVisible();

    const href = await resultLink.getAttribute("href");
    await resultLink.click();

    // Verify navigation
    await page.waitForURL(`**${href}`, { timeout: 10000 });
    await expect(page).toHaveURL(new RegExp(href!));
  });

  test("click on series link in ls series output navigates to series", async ({
    page,
  }) => {
    // Run ls series
    await typeCommand(page, "ls series");
    await page.waitForTimeout(500);

    // Find a series link and click it
    const seriesLink = page
      .locator('#terminal-output a[href^="/series/"]')
      .first();
    await expect(seriesLink).toBeVisible();

    const href = await seriesLink.getAttribute("href");
    await seriesLink.click();

    // Verify navigation
    await page.waitForURL(`**${href}`, { timeout: 10000 });
    await expect(page).toHaveURL(/\/series\//);
  });

  test("click on tag link in ls tags output navigates to tag", async ({
    page,
  }) => {
    // Run ls tags
    await typeCommand(page, "ls tags");
    await page.waitForTimeout(500);

    // Find a tag link and click it
    const tagLink = page.locator('#terminal-output a[href^="/tags/"]').first();
    await expect(tagLink).toBeVisible();

    const href = await tagLink.getAttribute("href");
    await tagLink.click();

    // Verify navigation
    await page.waitForURL(`**${href}`, { timeout: 10000 });
    await expect(page).toHaveURL(/\/tags\//);
  });

  test("click on tree directory triggers tree command", async ({ page }) => {
    // Run tree
    await typeCommand(page, "tree");
    await page.waitForTimeout(500);

    // Click on posts/ directory in tree output
    const postsDir = page.locator('[data-cmd="tree posts/"]').first();
    await expect(postsDir).toBeVisible();
    await postsDir.click();

    const input = page.locator("#command-input");
    await expect(input).toHaveValue("tree posts/");
  });

  test("click on post in tree output navigates to post", async ({ page }) => {
    // Run tree posts
    await typeCommand(page, "tree posts");
    await page.waitForTimeout(500);

    // Find a post link in tree output
    const postLink = page.locator("#terminal-output a.term-tree-file").first();
    await expect(postLink).toBeVisible();

    const href = await postLink.getAttribute("href");
    await postLink.click();

    // Verify navigation
    await page.waitForURL(`**${href}`, { timeout: 10000 });
    await expect(page).toHaveURL(/\/posts\//);
  });

  test("click on find result navigates to post", async ({ page }) => {
    // Run find with a pattern
    await typeCommand(page, "find Goals");
    await page.waitForTimeout(500);

    // Find and click a result link
    const resultLink = page
      .locator('#terminal-output a[href^="/posts/"]')
      .first();
    await expect(resultLink).toBeVisible();

    const href = await resultLink.getAttribute("href");
    await resultLink.click();

    // Verify navigation
    await page.waitForURL(`**${href}`, { timeout: 10000 });
    await expect(page).toHaveURL(new RegExp(href!));
  });
});

test.describe("Interactive Elements Behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForTerminalReady(page);
  });

  test("clicking anywhere in terminal focuses input", async ({ page }) => {
    // Click on the terminal shell area (not on a link or button)
    await page.locator(".term-shell").click({ position: { x: 50, y: 50 } });

    // Input should be focused
    const input = page.locator("#command-input");
    await expect(input).toBeFocused();
  });

  test("links have hover styles", async ({ page }) => {
    await typeCommand(page, "ls");
    await page.waitForTimeout(500);

    // Check that directory links have hover class defined
    const dirLink = page.locator('[data-cmd="ls posts/"]').first();
    await expect(dirLink).toBeVisible();

    // Verify the element has hover-related classes
    const classes = await dirLink.getAttribute("class");
    expect(classes).toContain("hover:");
  });

  test("complete flow: ls -> click posts -> click post -> read article", async ({
    page,
  }) => {
    // Step 1: List root
    await typeCommand(page, "ls");
    await page.waitForTimeout(500);

    // Step 2: Click posts/ directory (fills in command)
    const postsDir = page.locator('[data-cmd="ls posts/"]').first();
    await postsDir.click();

    // Press enter to execute
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);

    // Step 3: Click on a post link
    const postLink = page
      .locator('#terminal-output a[href^="/posts/"]')
      .first();
    await expect(postLink).toBeVisible();

    await postLink.click();

    // Step 4: Verify we're on the post page
    await page.waitForURL("**/posts/**", { timeout: 10000 });
    await expect(page).toHaveURL(/\/posts\//);

    // Verify article content is visible
    await expect(
      page.locator("article, .post-content, main h1, main h2"),
    ).toBeVisible();
  });

  test("cat preview shows clickable tags", async ({ page }) => {
    await typeCommand(page, "cat 2023-goals");
    await page.waitForTimeout(500);

    // Find tag links in cat output
    const tagLink = page.locator('#terminal-output a[href^="/tags/"]').first();
    await expect(tagLink).toBeVisible();

    // Verify it's a clickable tag
    const href = await tagLink.getAttribute("href");
    expect(href).toMatch(/\/tags\//);

    // Click should navigate
    await tagLink.click();
    await page.waitForURL("**/tags/**", { timeout: 10000 });
    await expect(page).toHaveURL(/\/tags\//);
  });
});
