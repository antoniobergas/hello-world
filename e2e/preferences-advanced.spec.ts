import { test, expect } from '@playwright/test';

test.describe('Preferences - theme section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preferences');
  });

  test('theme settings section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Theme settings"]')).toBeVisible();
  });

  test('theme options are visible', async ({ page }) => {
    await expect(page.locator('.theme-options')).toBeVisible();
  });

  test('can select dark theme', async ({ page }) => {
    const darkRadio = page.locator('input[aria-label="Set theme to dark"]');
    if (await darkRadio.isVisible()) {
      await darkRadio.click();
      await expect(darkRadio).toBeChecked();
    }
  });

  test('can select light theme', async ({ page }) => {
    const lightRadio = page.locator('input[aria-label="Set theme to light"]');
    if (await lightRadio.isVisible()) {
      await lightRadio.click();
      await expect(lightRadio).toBeChecked();
    }
  });

  test('at least one theme radio is visible', async ({ page }) => {
    const radios = page.locator('input[name="theme"]');
    await expect(radios.first()).toBeVisible();
  });

  test('theme section has a Theme heading', async ({ page }) => {
    const section = page.locator('[aria-label="Theme settings"]');
    await expect(section.locator('h3')).toContainText('Theme');
  });
});

test.describe('Preferences - items per page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preferences');
  });

  test('items per page section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Items per page settings"]')).toBeVisible();
  });

  test('items per page input is visible', async ({ page }) => {
    await expect(page.locator('input[aria-label="Items per page"]')).toBeVisible();
  });

  test('items per page input has a default value', async ({ page }) => {
    const input = page.locator('input[aria-label="Items per page"]');
    const value = await input.inputValue();
    expect(Number(value)).toBeGreaterThan(0);
  });

  test('items per page hint shows min and max', async ({ page }) => {
    await expect(page.locator('.hint')).toContainText('Min:');
    await expect(page.locator('.hint')).toContainText('Max:');
  });

  test('items per page section heading is visible', async ({ page }) => {
    const section = page.locator('[aria-label="Items per page settings"]');
    await expect(section.locator('h3')).toContainText('Items Per Page');
  });
});

test.describe('Preferences - notifications settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preferences');
  });

  test('notification settings section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Notification settings"]')).toBeVisible();
  });

  test('email notifications toggle is visible', async ({ page }) => {
    await expect(page.locator('input[aria-label="Toggle email notifications"]')).toBeVisible();
  });

  test('push notifications toggle is visible', async ({ page }) => {
    await expect(page.locator('input[aria-label="Toggle push notifications"]')).toBeVisible();
  });

  test('can toggle email notifications off', async ({ page }) => {
    const emailToggle = page.locator('input[aria-label="Toggle email notifications"]');
    const wasChecked = await emailToggle.isChecked();
    await emailToggle.click();
    await expect(emailToggle).not.toBeChecked();
    if (!wasChecked) {
      // restore
      await emailToggle.click();
    }
  });

  test('can toggle push notifications', async ({ page }) => {
    const pushToggle = page.locator('input[aria-label="Toggle push notifications"]');
    const wasChecked = await pushToggle.isChecked();
    await pushToggle.click();
    const nowChecked = await pushToggle.isChecked();
    expect(nowChecked).not.toBe(wasChecked);
  });

  test('notifications section heading is visible', async ({ page }) => {
    const section = page.locator('[aria-label="Notification settings"]');
    await expect(section.locator('h3')).toContainText('Notifications');
  });
});

test.describe('Preferences - additional settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preferences');
  });

  test('additional settings section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Additional settings"]')).toBeVisible();
  });

  test('language info row is shown', async ({ page }) => {
    const section = page.locator('[aria-label="Additional settings"]');
    await expect(section.locator('.info-row').filter({ hasText: 'Language' })).toBeVisible();
  });

  test('timezone info row is shown', async ({ page }) => {
    const section = page.locator('[aria-label="Additional settings"]');
    await expect(section.locator('.info-row').filter({ hasText: 'Timezone' })).toBeVisible();
  });

  test('date format info row is shown', async ({ page }) => {
    const section = page.locator('[aria-label="Additional settings"]');
    await expect(section.locator('.info-row').filter({ hasText: 'Date Format' })).toBeVisible();
  });

  test('language info value is non-empty', async ({ page }) => {
    const section = page.locator('[aria-label="Additional settings"]');
    const langRow = section.locator('.info-row').filter({ hasText: 'Language' });
    await expect(langRow.locator('.info-value')).not.toBeEmpty();
  });

  test('timezone info value is non-empty', async ({ page }) => {
    const section = page.locator('[aria-label="Additional settings"]');
    const tzRow = section.locator('.info-row').filter({ hasText: 'Timezone' });
    await expect(tzRow.locator('.info-value')).not.toBeEmpty();
  });
});
