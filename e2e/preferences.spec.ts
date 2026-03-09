import { test, expect } from '@playwright/test';

test.describe('Preferences page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preferences');
  });

  test('page loads with User Preferences heading', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('User Preferences');
  });

  test('user preferences section has correct aria-label', async ({ page }) => {
    await expect(page.locator('[aria-label="User preferences"]')).toBeVisible();
  });

  test('theme settings section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Theme settings"]')).toBeVisible();
  });

  test('theme options light, dark, and system are shown', async ({ page }) => {
    const themeSection = page.locator('[aria-label="Theme settings"]');
    await expect(themeSection.locator('[aria-label="Set theme to light"]')).toBeVisible();
    await expect(themeSection.locator('[aria-label="Set theme to dark"]')).toBeVisible();
    await expect(themeSection.locator('[aria-label="Set theme to system"]')).toBeVisible();
  });

  test('items per page section is displayed', async ({ page }) => {
    await expect(page.locator('[aria-label="Items per page settings"]')).toBeVisible();
  });

  test('items per page input is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Items per page"]')).toBeVisible();
  });

  test('notification settings section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Notification settings"]')).toBeVisible();
  });

  test('email notifications toggle is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Toggle email notifications"]')).toBeVisible();
  });

  test('push notifications toggle is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Toggle push notifications"]')).toBeVisible();
  });

  test('reset to defaults button exists', async ({ page }) => {
    await expect(page.locator('.reset-btn')).toBeVisible();
  });

  test('reset to defaults button is labeled correctly', async ({ page }) => {
    await expect(page.locator('[aria-label="Reset to defaults"]')).toBeVisible();
  });

  test('additional settings section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Additional settings"]')).toBeVisible();
  });

  test('can switch to dark theme', async ({ page }) => {
    await page.locator('[aria-label="Set theme to dark"]').check();
    await expect(page.locator('[aria-label="Set theme to dark"]')).toBeChecked();
  });

  test('can switch to light theme', async ({ page }) => {
    await page.locator('[aria-label="Set theme to dark"]').check();
    await page.locator('[aria-label="Set theme to light"]').check();
    await expect(page.locator('[aria-label="Set theme to light"]')).toBeChecked();
  });

  test('reset to defaults button is clickable without errors', async ({ page }) => {
    await page.locator('[aria-label="Set theme to dark"]').check();
    await page.locator('.reset-btn').click();
    await expect(page.locator('[aria-label="User preferences"]')).toBeVisible();
  });
});

test.describe('Preferences navigation', () => {
  test('can navigate to preferences from navbar', async ({ page }) => {
    await page.goto('/');
    await page.locator('a', { hasText: 'Preferences' }).first().click();
    await expect(page).toHaveURL(/\/preferences/);
    await expect(page.locator('h2')).toContainText('User Preferences');
  });

  test('can navigate back to dashboard from preferences page', async ({ page }) => {
    await page.goto('/preferences');
    await page.locator('a', { hasText: 'Dashboard' }).first().click();
    await expect(page).toHaveURL('/');
  });

  test('can navigate from preferences to notifications', async ({ page }) => {
    await page.goto('/preferences');
    await page.locator('a', { hasText: 'Notifications' }).first().click();
    await expect(page).toHaveURL(/\/notifications/);
  });
});
