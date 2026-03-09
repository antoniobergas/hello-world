import { test, expect } from '@playwright/test';

test.describe('LocalStorage persistence', () => {
  test('items added on items page persist after navigating away and back', async ({ page }) => {
    await page.goto('/items');

    // Add a new item
    await page.locator('button', { hasText: '+ Add Item' }).click();
    await page.locator('input[name="title"]').fill('Persistent Item');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.item-row', { hasText: 'Persistent Item' })).toBeVisible();

    // Navigate to dashboard then back
    await page.locator('a', { hasText: 'Dashboard' }).click();
    await page.locator('a', { hasText: 'Items' }).first().click();

    // Item should still be visible
    await expect(page.locator('.item-row', { hasText: 'Persistent Item' })).toBeVisible();
  });

  test('item removal persists after navigation', async ({ page }) => {
    await page.goto('/items');
    const initialCount = await page.locator('.item-row').count();

    // Remove first item
    await page.locator('.remove-btn').first().click();
    await expect(page.locator('.item-row')).toHaveCount(initialCount - 1);

    // Navigate away and back
    await page.locator('a', { hasText: 'Dashboard' }).click();
    await page.locator('a', { hasText: 'Items' }).first().click();

    await expect(page.locator('.item-row')).toHaveCount(initialCount - 1);
  });

  test('completed state persists after navigation', async ({ page }) => {
    await page.goto('/items');

    // Complete the second item (pending → completed)
    const secondCheckbox = page.locator('.item-check input[type="checkbox"]').nth(1);
    await secondCheckbox.check();
    await expect(page.locator('.item-row').nth(1)).toHaveClass(/completed/);

    // Navigate away and back
    await page.locator('a', { hasText: 'Dashboard' }).click();
    await page.locator('a', { hasText: 'Items' }).first().click();

    await expect(page.locator('.item-row').nth(1)).toHaveClass(/completed/);
  });

  test('dashboard stat counts update after adding items', async ({ page }) => {
    await page.goto('/items');
    await page.locator('button', { hasText: '+ Add Item' }).click();
    await page.locator('input[name="title"]').fill('New Stat Item');
    await page.locator('button[type="submit"]').click();

    await page.locator('a', { hasText: 'Dashboard' }).click();
    const totalCard = page.locator('.stat-card').filter({ hasText: 'Total Items' });
    await expect(totalCard.locator('.stat-value')).toContainText('5');
  });
});
