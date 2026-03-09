import { test, expect } from '@playwright/test';

test.describe('Notifications - adding multiple types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notifications');
    // start fresh
    await page.locator('.clear-btn').click();
  });

  test('adding an error notification shows it in the list', async ({ page }) => {
    await page.locator('.demo-btn.error').click();
    await expect(page.locator('.notification-item').first()).toBeVisible();
  });

  test('adding a warning notification shows it in the list', async ({ page }) => {
    await page.locator('.demo-btn.warning').click();
    await expect(page.locator('.notification-item').first()).toBeVisible();
  });

  test('adding all four types shows four notifications', async ({ page }) => {
    await page.locator('.demo-btn.success').click();
    await page.locator('.demo-btn.error').click();
    await page.locator('.demo-btn.info').click();
    await page.locator('.demo-btn.warning').click();
    await expect(page.locator('.notification-item')).toHaveCount(4);
  });

  test('notification type badge shows the notification type', async ({ page }) => {
    await page.locator('.demo-btn.success').click();
    await expect(page.locator('.notification-type-badge').first()).toBeVisible();
  });

  test('notification message is visible', async ({ page }) => {
    await page.locator('.demo-btn.info').click();
    await expect(page.locator('.notification-message').first()).toBeVisible();
  });

  test('adding two success notifications shows count of two', async ({ page }) => {
    await page.locator('.demo-btn.success').click();
    await page.locator('.demo-btn.success').click();
    await expect(page.locator('.notification-item')).toHaveCount(2);
  });

  test('adding three notifications shows badge with count 3', async ({ page }) => {
    await page.locator('.demo-btn.success').click();
    await page.locator('.demo-btn.error').click();
    await page.locator('.demo-btn.info').click();
    await expect(page.locator('.badge')).toContainText('3');
  });

  test('notification item has a dismiss button', async ({ page }) => {
    await page.locator('.demo-btn.info').click();
    await expect(page.locator('.dismiss-btn').first()).toBeVisible();
  });

  test('each notification item has an aria-label', async ({ page }) => {
    await page.locator('.demo-btn.success').click();
    await expect(page.locator('.notification-item').first()).toHaveAttribute(
      'aria-label',
      /notification:/,
    );
  });
});

test.describe('Notifications - dismiss behaviour', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notifications');
    await page.locator('.clear-btn').click();
  });

  test('dismissing a notification removes it from the list', async ({ page }) => {
    await page.locator('.demo-btn.info').click();
    await page.locator('.dismiss-btn').first().click();
    await expect(page.locator('.notification-item')).toHaveCount(0);
  });

  test('dismissing one of two notifications leaves one remaining', async ({ page }) => {
    await page.locator('.demo-btn.info').click();
    await page.locator('.demo-btn.success').click();
    await page.locator('.dismiss-btn').first().click();
    await expect(page.locator('.notification-item')).toHaveCount(1);
  });

  test('after dismissing all, empty state is shown', async ({ page }) => {
    await page.locator('.demo-btn.info').click();
    await page.locator('.dismiss-btn').first().click();
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('dismiss button aria-label contains notification message', async ({ page }) => {
    await page.locator('.demo-btn.error').click();
    await expect(page.locator('.dismiss-btn').first()).toHaveAttribute(
      'aria-label',
      /Dismiss notification:/,
    );
  });

  test('dismissing removes the badge when count reaches zero', async ({ page }) => {
    await page.locator('.demo-btn.info').click();
    await page.locator('.dismiss-btn').first().click();
    await expect(page.locator('.badge')).not.toBeVisible();
  });
});

test.describe('Notifications - clear all', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notifications');
    await page.locator('.clear-btn').click();
  });

  test('clear all removes all notifications', async ({ page }) => {
    await page.locator('.demo-btn.success').click();
    await page.locator('.demo-btn.error').click();
    await page.locator('.demo-btn.info').click();
    await page.locator('.clear-btn').click();
    await expect(page.locator('.notification-item')).toHaveCount(0);
  });

  test('clear all shows empty state', async ({ page }) => {
    await page.locator('.demo-btn.warning').click();
    await page.locator('.clear-btn').click();
    await expect(page.locator('.empty-state')).toContainText('No notifications');
  });

  test('clear all button is present with no notifications', async ({ page }) => {
    await expect(page.locator('.clear-btn')).toBeVisible();
  });

  test('add sample notification section is always visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Add sample notifications"]')).toBeVisible();
  });

  test('all four demo buttons are visible', async ({ page }) => {
    await expect(page.locator('.demo-btn.success')).toBeVisible();
    await expect(page.locator('.demo-btn.error')).toBeVisible();
    await expect(page.locator('.demo-btn.info')).toBeVisible();
    await expect(page.locator('.demo-btn.warning')).toBeVisible();
  });

  test('badge is not visible when there are no notifications', async ({ page }) => {
    await expect(page.locator('.badge')).not.toBeVisible();
  });

  test('badge appears after adding a notification', async ({ page }) => {
    await page.locator('.demo-btn.success').click();
    await expect(page.locator('.badge')).toBeVisible();
  });
});
