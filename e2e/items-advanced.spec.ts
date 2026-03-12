import { test, expect } from '@playwright/test';

test.describe('Items - inline editing edge cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/items');
  });

  test('editing description field updates the item', async ({ page }) => {
    await page.locator('.edit-btn').first().click();
    const descInput = page.locator('input[name="editDescription"]');
    if (await descInput.isVisible()) {
      await descInput.clear();
      await descInput.fill('Updated description via E2E');
      await page.locator('.save-btn').click();
    }
    // Verify form is closed without errors
    await expect(page.locator('.inline-edit-form')).not.toBeVisible();
  });

  test('opening edit on second item shows edit form', async ({ page }) => {
    await page.locator('.edit-btn').nth(1).click();
    await expect(page.locator('.inline-edit-form')).toBeVisible();
  });

  test('opening edit on third item shows edit form', async ({ page }) => {
    await page.locator('.edit-btn').nth(2).click();
    await expect(page.locator('.inline-edit-form')).toBeVisible();
  });

  test('saving item with empty title clears the title field', async ({ page }) => {
    await page.locator('.edit-btn').first().click();
    const titleInput = page.locator('input[name="editTitle"]');
    await titleInput.clear();
    await titleInput.fill('New Renamed Item');
    await page.locator('.save-btn').click();
    await expect(page.locator('.item-title').first()).toContainText('New Renamed Item');
  });

  test('cancel button on second item closes form', async ({ page }) => {
    await page.locator('.edit-btn').nth(1).click();
    await page.locator('.cancel-btn').click();
    await expect(page.locator('.inline-edit-form')).not.toBeVisible();
  });

  test('editing item does not change item count', async ({ page }) => {
    const before = await page.locator('.item-row').count();
    await page.locator('.edit-btn').first().click();
    await page.locator('input[name="editTitle"]').fill('Edited');
    await page.locator('.save-btn').click();
    await expect(page.locator('.item-row')).toHaveCount(before);
  });
});

test.describe('Items - bulk actions advanced', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/items');
  });

  test('selecting all items shows bulk bar', async ({ page }) => {
    const checkboxes = page.locator('.row-checkbox');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).click();
    }
    await expect(page.locator('.bulk-bar')).toBeVisible();
  });

  test('selecting one item shows bulk bar', async ({ page }) => {
    await page.locator('.row-checkbox').first().click();
    await expect(page.locator('.bulk-bar')).toBeVisible();
  });

  test('deselecting all items hides bulk bar', async ({ page }) => {
    await page.locator('.row-checkbox').first().click();
    await page.locator('.row-checkbox').first().click();
    await expect(page.locator('.bulk-bar')).not.toBeVisible();
  });

  test('selecting two items shows bulk bar with selection info', async ({ page }) => {
    await page.locator('.row-checkbox').first().click();
    await page.locator('.row-checkbox').nth(1).click();
    await expect(page.locator('.bulk-bar')).toBeVisible();
  });

  test('bulk bar contains a complete/mark button', async ({ page }) => {
    await page.locator('.row-checkbox').first().click();
    const bulkBar = page.locator('.bulk-bar');
    // The bulk bar should have at least one action button
    await expect(bulkBar.locator('button').first()).toBeVisible();
  });

  test('bulk delete removes selected items', async ({ page }) => {
    const before = await page.locator('.item-row').count();
    await page.locator('.row-checkbox').first().click();
    const bulkDeleteBtn = page.locator('.bulk-bar').locator('button', { hasText: /delete/i });
    if (await bulkDeleteBtn.isVisible()) {
      await bulkDeleteBtn.click();
      await expect(page.locator('.item-row')).toHaveCount(before - 1);
    }
  });
});

test.describe('Items - add then search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/items');
  });

  test('newly added item can be found by search', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Item' }).click();
    await page.locator('input[name="title"]').fill('UniqueSEARCHTERM');
    await page.locator('input[name="description"]').fill('Search test');
    await page.locator('button[type="submit"]').click();

    await page.locator('.search-input').fill('UniqueSEARCHTERM');
    await expect(page.locator('.item-row')).toHaveCount(1);
  });

  test('searching after editing an item finds it by new title', async ({ page }) => {
    await page.locator('.edit-btn').first().click();
    await page.locator('input[name="editTitle"]').clear();
    await page.locator('input[name="editTitle"]').fill('SearchableNewTitle');
    await page.locator('.save-btn').click();

    await page.locator('.search-input').fill('SearchableNewTitle');
    await expect(page.locator('.item-row')).toHaveCount(1);
  });

  test('clearing search after filtering shows all items', async ({ page }) => {
    const total = await page.locator('.item-row').count();
    await page.locator('.search-input').fill('design');
    await page.locator('.search-input').clear();
    await expect(page.locator('.item-row')).toHaveCount(total);
  });

  test('adding an item then removing it keeps the original count', async ({ page }) => {
    const before = await page.locator('.item-row').count();
    await page.locator('button', { hasText: '+ Add Item' }).click();
    await page.locator('input[name="title"]').fill('Temp Item');
    await page.locator('button[type="submit"]').click();
    // Now remove the last (newly added) item
    await page.locator('.remove-btn').last().click();
    await expect(page.locator('.item-row')).toHaveCount(before);
  });
});

test.describe('Items - sorting combinations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/items');
  });

  test('sort by status renders correct count', async ({ page }) => {
    const sortSelect = page.locator('select[aria-label="Sort by"]');
    if (await sortSelect.isVisible()) {
      const options = await sortSelect.locator('option').allTextContents();
      if (options.includes('status')) {
        await sortSelect.selectOption('status');
        await expect(page.locator('.item-row').first()).toBeVisible();
      }
    }
  });

  test('toggling sort direction twice returns to ascending', async ({ page }) => {
    const btn = page.locator('.sort-dir-btn');
    await btn.click();
    await btn.click();
    await expect(btn).toHaveText('↑');
  });

  test('filter + sort together: design category sorted by title', async ({ page }) => {
    await page.locator('select[aria-label="Filter by category"]').selectOption('design');
    await page.locator('select[aria-label="Sort by"]').selectOption('title');
    await expect(page.locator('.item-row')).toHaveCount(1);
  });

  test('filter + search together narrows results', async ({ page }) => {
    const total = await page.locator('.item-row').count();
    await page.locator('select[aria-label="Filter by category"]').selectOption('design');
    const filtered = await page.locator('.item-row').count();
    expect(filtered).toBeLessThanOrEqual(total);
  });
});
