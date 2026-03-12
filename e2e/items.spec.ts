import { test, expect } from '@playwright/test';

test.describe('Items page', () => {
  test('has "Items" heading', async ({ page }) => {
    await page.goto('/items');
    await expect(page.locator('h2')).toContainText('Items');
  });

  test('shows initial items', async ({ page }) => {
    await page.goto('/items');
    const rows = page.locator('.item-row');
    await expect(rows).toHaveCount(4);
  });

  test('search filters items by title', async ({ page }) => {
    await page.goto('/items');
    await page.locator('.search-input').fill('design');
    await expect(page.locator('.item-row')).toHaveCount(1);
    await expect(page.locator('.item-title').first()).toContainText('Design');
  });

  test('search shows empty state when no match', async ({ page }) => {
    await page.goto('/items');
    await page.locator('.search-input').fill('xyznotfound');
    await expect(page.locator('.item-row')).toHaveCount(0);
    await expect(page.locator('.empty')).toBeVisible();
  });

  test('can add a new item via the form', async ({ page }) => {
    await page.goto('/items');
    await page.locator('button', { hasText: '+ Add Item' }).click();
    await page.locator('input[name="title"]').fill('E2E Test Item');
    await page.locator('input[name="description"]').fill('Added in E2E');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.item-row', { hasText: 'E2E Test Item' })).toBeVisible();
  });

  test('can remove an item', async ({ page }) => {
    await page.goto('/items');
    const initialCount = await page.locator('.item-row').count();
    await page.locator('.remove-btn').first().click();
    await expect(page.locator('.item-row')).toHaveCount(initialCount - 1);
  });

  test('can mark an item as completed', async ({ page }) => {
    await page.goto('/items');
    // Second item (API integration) starts unchecked
    const secondCheckbox = page.locator('.item-check input[type="checkbox"]').nth(1);
    await secondCheckbox.check();
    const secondRow = page.locator('.item-row').nth(1);
    await expect(secondRow).toHaveClass(/completed/);
  });

  test('status filter — Pending shows only pending items', async ({ page }) => {
    await page.goto('/items');
    await page.locator('.filter-tabs button', { hasText: 'Pending' }).click();
    const rows = page.locator('.item-row');
    // Initial data: 3 pending items
    await expect(rows).toHaveCount(3);
  });

  test('status filter — Completed shows only completed items', async ({ page }) => {
    await page.goto('/items');
    await page.locator('.filter-tabs button', { hasText: 'Completed' }).click();
    const rows = page.locator('.item-row');
    // Initial data: 1 completed item
    await expect(rows).toHaveCount(1);
  });

  test('status filter — All restores full list', async ({ page }) => {
    await page.goto('/items');
    await page.locator('.filter-tabs button', { hasText: 'Pending' }).click();
    await page.locator('.filter-tabs button', { hasText: 'All' }).click();
    await expect(page.locator('.item-row')).toHaveCount(4);
  });
});

test.describe('Navigation', () => {
  test('can navigate from dashboard to items page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a', { hasText: 'Items' }).first().click();
    await expect(page).toHaveURL(/\/items/);
    await expect(page.locator('h2')).toContainText('Items');
  });

  test('can navigate back to dashboard from items page', async ({ page }) => {
    await page.goto('/items');
    await page.locator('a', { hasText: 'Dashboard' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Hello World');
  });
});

test.describe('Theme toggle', () => {
  test('theme toggle button is visible in navbar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.theme-toggle')).toBeVisible();
  });
});
