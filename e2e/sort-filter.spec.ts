import { test, expect } from '@playwright/test';

test.describe('Item sorting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/items');
  });

  test('sort direction toggle button is visible', async ({ page }) => {
    await expect(page.locator('.sort-dir-btn')).toBeVisible();
  });

  test('sort by select is present', async ({ page }) => {
    const sortSelect = page.locator('select[aria-label="Sort by"]');
    await expect(sortSelect).toBeVisible();
  });

  test('clicking sort direction button toggles between ↑ and ↓', async ({ page }) => {
    const btn = page.locator('.sort-dir-btn');
    // starts as ascending; after click should show descending arrow
    await expect(btn).toHaveText('↑');
    await btn.click();
    await expect(btn).toHaveText('↓');
  });

  test('items list is rendered after changing sort field', async ({ page }) => {
    await page.locator('select[aria-label="Sort by"]').selectOption('title');
    await expect(page.locator('.item-row').first()).toBeVisible();
  });

  test('sorting by title renders items without errors', async ({ page }) => {
    await page.locator('select[aria-label="Sort by"]').selectOption('title');
    const rows = page.locator('.item-row');
    await expect(rows).toHaveCount(4);
  });

  test('sorting by priority renders items without errors', async ({ page }) => {
    await page.locator('select[aria-label="Sort by"]').selectOption('priority');
    const rows = page.locator('.item-row');
    await expect(rows).toHaveCount(4);
  });
});

test.describe('Category filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/items');
  });

  test('category filter select is present', async ({ page }) => {
    await expect(page.locator('select[aria-label="Filter by category"]')).toBeVisible();
  });

  test('filtering by design category shows only design items', async ({ page }) => {
    await page.locator('select[aria-label="Filter by category"]').selectOption('design');
    await expect(page.locator('.item-row')).toHaveCount(1);
    await expect(page.locator('.item-title').first()).toContainText('Design');
  });

  test('resetting category filter to all restores full list', async ({ page }) => {
    await page.locator('select[aria-label="Filter by category"]').selectOption('design');
    await page.locator('select[aria-label="Filter by category"]').selectOption('');
    await expect(page.locator('.item-row')).toHaveCount(4);
  });

  test('category filter combined with status filter works', async ({ page }) => {
    await page.locator('.filter-tabs button', { hasText: 'Completed' }).click();
    await page.locator('select[aria-label="Filter by category"]').selectOption('design');
    await expect(page.locator('.item-row')).toHaveCount(1);
  });
});

test.describe('Priority filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/items');
  });

  test('priority filter select is present', async ({ page }) => {
    await expect(page.locator('select[aria-label="Filter by priority"]')).toBeVisible();
  });

  test('filtering by high priority shows 2 items', async ({ page }) => {
    await page.locator('select[aria-label="Filter by priority"]').selectOption('high');
    await expect(page.locator('.item-row')).toHaveCount(2);
  });

  test('filtering by low priority shows 1 item', async ({ page }) => {
    await page.locator('select[aria-label="Filter by priority"]').selectOption('low');
    await expect(page.locator('.item-row')).toHaveCount(1);
  });

  test('resetting priority filter to all restores full list', async ({ page }) => {
    await page.locator('select[aria-label="Filter by priority"]').selectOption('high');
    await page.locator('select[aria-label="Filter by priority"]').selectOption('');
    await expect(page.locator('.item-row')).toHaveCount(4);
  });
});
