import { test, expect } from '@playwright/test';

test.describe('Notifications page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notifications');
  });

  test('page loads with Notifications heading', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Notifications');
  });

  test('notification center section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Notification center"]')).toBeVisible();
  });

  test('clear all button is visible', async ({ page }) => {
    await expect(page.locator('.clear-btn')).toBeVisible();
  });

  test('notifications list is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Notifications list"]')).toBeVisible();
  });

  test('shows empty state when no notifications', async ({ page }) => {
    await page.locator('.clear-btn').click();
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.empty-state')).toContainText('No notifications');
  });

  test('adding a success notification shows it in the list', async ({ page }) => {
    await page.locator('.clear-btn').click();
    await page.locator('.demo-btn.success').click();
    await expect(page.locator('.notification-item').first()).toBeVisible();
  });

  test('notification badge count reflects number of notifications', async ({ page }) => {
    await page.locator('.clear-btn').click();
    await page.locator('.demo-btn.info').click();
    await page.locator('.demo-btn.info').click();
    await expect(page.locator('.badge')).toContainText('2');
  });

  test('can dismiss an individual notification', async ({ page }) => {
    await page.locator('.clear-btn').click();
    await page.locator('.demo-btn.success').click();
    await page.locator('.demo-btn.success').click();
    const countBefore = await page.locator('.notification-item').count();
    await page.locator('.dismiss-btn').first().click();
    await expect(page.locator('.notification-item')).toHaveCount(countBefore - 1);
  });

  test('clear all removes all notifications and shows empty state', async ({ page }) => {
    await page.locator('.demo-btn.error').click();
    await page.locator('.demo-btn.info').click();
    await page.locator('.clear-btn').click();
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.notification-item')).toHaveCount(0);
  });

  test('after clearing, badge is not visible', async ({ page }) => {
    await page.locator('.demo-btn.warning').click();
    await page.locator('.clear-btn').click();
    await expect(page.locator('.badge')).not.toBeVisible();
  });

  test('demo section with sample notification buttons is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Add sample notifications"]')).toBeVisible();
  });

  test('can add a warning notification', async ({ page }) => {
    await page.locator('.clear-btn').click();
    await page.locator('.demo-btn.warning').click();
    const item = page.locator('.notification-item').first();
    await expect(item).toBeVisible();
    await expect(item.locator('.notification-type-badge')).toContainText('warning');
  });

  test('can add an error notification', async ({ page }) => {
    await page.locator('.clear-btn').click();
    await page.locator('.demo-btn.error').click();
    const item = page.locator('.notification-item').first();
    await expect(item.locator('.notification-type-badge')).toContainText('error');
  });
});

test.describe('Notifications navigation', () => {
  test('can navigate to notifications from navbar', async ({ page }) => {
    await page.goto('/');
    await page.locator('a', { hasText: 'Notifications' }).first().click();
    await expect(page).toHaveURL(/\/notifications/);
    await expect(page.locator('h2')).toContainText('Notifications');
  });

  test('can navigate back to dashboard from notifications page', async ({ page }) => {
    await page.goto('/notifications');
    await page.locator('a', { hasText: 'Dashboard' }).first().click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Hello World');
  });

  test('can navigate from notifications to items', async ({ page }) => {
    await page.goto('/notifications');
    await page.locator('a', { hasText: 'Items' }).first().click();
    await expect(page).toHaveURL(/\/items/);
  });
});
