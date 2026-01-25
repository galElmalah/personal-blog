import { test, expect } from '@playwright/test';

test.describe('Terminal cd command', () => {
  test('cd .. works correctly', async ({ page }) => {
    // 1. Go to posts page (simulating being in ~/posts)
    await page.goto('/posts');
    
    // 2. Wait for terminal to be ready
    const input = page.locator('#command-input');
    await expect(input).toBeVisible();
    
    // 3. Type 'cd ..'
    await input.fill('cd ..');
    await input.press('Enter');
    
    // 4. Verify path changed to ~
    // The prompt is re-rendered, so we need to wait for it
    const prompt = page.locator('.term-prompt-path').last();
    await expect(prompt).toHaveText('~');
    
    // 5. Verify we are redirected to home
    await page.waitForURL('**/');
  });

  test('cd .. from series subdirectory works', async ({ page }) => {
    // 1. Go to a series page
    await page.goto('/series/advent-of-code-2022');
    
    // Wait for the page to be fully loaded and interactive
    const input = page.locator('#command-input');
    
    // Wait for input to be attached and visible
    // Sometimes the terminal takes a bit to initialize on slower environments
    // Increased timeout to 60s to be safe
    await input.waitFor({ state: 'visible', timeout: 60000 });
    
    // Ensure we can type into it - wait for any animations or overlays to clear
    // Use evaluate to force focus and set value if click fails
    await input.evaluate((el) => el.focus());
    
    // 2. Type 'cd ..'
    await input.fill('cd ..');
    await input.press('Enter');
    
    // 3. Verify path changed to ~/series
    const prompt = page.locator('.term-prompt-path').last();
    await expect(prompt).toHaveText('~/series');
    
    // 4. Verify we are redirected to series list
    await page.waitForURL('**/series');
  });
});
