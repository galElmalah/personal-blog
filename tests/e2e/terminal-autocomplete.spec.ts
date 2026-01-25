import { test, expect } from '@playwright/test';

test.describe('Terminal Autocomplete', () => {
  test('autocomplete works on posts page', async ({ page }) => {
    // 1. Go to posts page
    await page.goto('/posts');
    
    // 2. Wait for terminal to be ready
    const input = page.locator('#command-input');
    await expect(input).toBeVisible();
    
    // 3. Type 'cd '
    await input.fill('cd ');
    
    // 4. Press Tab
    await input.press('Tab');
    
    // 5. Verify input value changed (autocomplete happened)
    // We don't know exactly which post it will pick first, but it should append something
    const value = await input.inputValue();
    expect(value.length).toBeGreaterThan(3); // 'cd ' is 3 chars
    expect(value).not.toBe('cd ');
    
    // 6. Verify it looks like a post slug
    // Should not contain 'posts/' prefix if we are already in posts directory
    expect(value).not.toContain('posts/');
  });

  test('autocomplete works on home page', async ({ page }) => {
    await page.goto('/');
    
    const input = page.locator('#command-input');
    await expect(input).toBeVisible();
    
    // Type 'cd pos'
    await input.fill('cd pos');
    await input.press('Tab');
    
    // Should complete to 'cd posts/'
    expect(await input.inputValue()).toBe('cd posts/');
  });

  test('theme persistence across navigation', async ({ page }) => {
    await page.goto('/');
    
    const input = page.locator('#command-input');
    await expect(input).toBeVisible();
    
    // Set theme
    await input.fill('theme dracula');
    await input.press('Enter');
    
    // Verify theme attribute
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dracula');
    
    // Navigate to posts
    await input.fill('cd posts');
    await input.press('Enter');
    
    // Wait for navigation
    await page.waitForURL(/\/posts/);
    
    // Verify theme persists
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dracula');
  });
});
