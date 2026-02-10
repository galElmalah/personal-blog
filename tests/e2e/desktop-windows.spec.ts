import { test, expect } from '@playwright/test';

test.describe('Desktop Window Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the desktop view
    await page.goto('/?view=desktop');
    // Wait for the desktop to be visible
    await page.waitForSelector('.desktop-container', { state: 'visible' });
  });

  test('desktop icons are rendered', async ({ page }) => {
    // Check that desktop icons are present
    const icons = page.locator('.desktop-icon');
    await expect(icons.first()).toBeVisible({ timeout: 5000 });
    
    // Should have multiple icons
    const count = await icons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('double-clicking an icon opens a window', async ({ page }) => {
    // Find a file icon (not a folder)
    const fileIcon = page.locator('.desktop-icon[data-type="file"]').first();
    await expect(fileIcon).toBeVisible({ timeout: 5000 });
    
    // Double-click to open
    await fileIcon.dblclick();
    
    // Wait for window to appear
    const window = page.locator('.desktop-window');
    await expect(window).toBeVisible({ timeout: 5000 });
    
    // Check window has titlebar
    await expect(window.locator('.window-titlebar')).toBeVisible();
  });

  test('window can be closed', async ({ page }) => {
    // Open a window first
    const fileIcon = page.locator('.desktop-icon[data-type="file"]').first();
    await fileIcon.dblclick();
    
    const window = page.locator('.desktop-window');
    await expect(window).toBeVisible({ timeout: 5000 });
    
    // Click close button
    const closeBtn = window.locator('.traffic-light-close');
    await closeBtn.click();
    
    // Window should be gone after animation
    await expect(window).not.toBeVisible({ timeout: 1000 });
  });

  test('window can be dragged', async ({ page }) => {
    // Open a window
    const fileIcon = page.locator('.desktop-icon[data-type="file"]').first();
    await fileIcon.dblclick();
    
    const window = page.locator('.desktop-window');
    await expect(window).toBeVisible({ timeout: 5000 });
    
    // Get initial position
    const initialBox = await window.boundingBox();
    expect(initialBox).toBeTruthy();
    
    // Drag the titlebar
    const titlebar = window.locator('.window-titlebar');
    await titlebar.hover();
    await page.mouse.down();
    await page.mouse.move(initialBox!.x + 100, initialBox!.y + 100);
    await page.mouse.up();
    
    // Check position changed
    const newBox = await window.boundingBox();
    expect(newBox).toBeTruthy();
    expect(newBox!.x).not.toBe(initialBox!.x);
    expect(newBox!.y).not.toBe(initialBox!.y);
  });

  test('window can be maximized', async ({ page }) => {
    // Open a window
    const fileIcon = page.locator('.desktop-icon[data-type="file"]').first();
    await fileIcon.dblclick();
    
    const window = page.locator('.desktop-window');
    await expect(window).toBeVisible({ timeout: 5000 });
    
    // Get initial size
    const initialBox = await window.boundingBox();
    expect(initialBox).toBeTruthy();
    
    // Click maximize button
    const maximizeBtn = window.locator('.traffic-light-maximize');
    await maximizeBtn.click();
    
    // Wait for size change
    await page.waitForTimeout(100);
    
    // Check size changed (should be larger)
    const newBox = await window.boundingBox();
    expect(newBox).toBeTruthy();
    expect(newBox!.width).toBeGreaterThan(initialBox!.width);
  });

  test('Escape closes top window', async ({ page }) => {
    // Open a window
    const fileIcon = page.locator('.desktop-icon[data-type="file"]').first();
    await fileIcon.dblclick();
    
    const window = page.locator('.desktop-window');
    await expect(window).toBeVisible({ timeout: 5000 });
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Window should be gone
    await expect(window).not.toBeVisible({ timeout: 1000 });
  });
});
