import { test, expect } from '@playwright/test';

test.describe('Inline item editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/items');
  });

  test('each item row has an edit button', async ({ page }) => {
    const editButtons = page.locator('.edit-btn');
    await expect(editButtons).toHaveCount(4);
  });

  test('clicking edit button shows inline edit form', async ({ page }) => {
    await page.locator('.edit-btn').first().click();
    await expect(page.locator('.inline-edit-form')).toBeVisible();
  });

  test('cancel button closes edit form without saving', async ({ page }) => {
    const firstTitle = await page.locator('.item-title').first().textContent();
    await page.locator('.edit-btn').first().click();
    await page.locator('.cancel-btn').click();
    await expect(page.locator('.inline-edit-form')).not.toBeVisible();
    await expect(page.locator('.item-title').first()).toContainText(firstTitle!.trim());
  });

  test('can update item title via inline edit form', async ({ page }) => {
    await page.locator('.edit-btn').first().click();
    const titleInput = page.locator('input[name="editTitle"]');
    await titleInput.clear();
    await titleInput.fill('Updated via E2E');
    await page.locator('.save-btn').click();
    await expect(page.locator('.item-title').first()).toContainText('Updated via E2E');
  });

  test('save closes the edit form', async ({ page }) => {
    await page.locator('.edit-btn').first().click();
    const titleInput = page.locator('input[name="editTitle"]');
    await titleInput.fill('New Title');
    await page.locator('.save-btn').click();
    await expect(page.locator('.inline-edit-form')).not.toBeVisible();
  });

  test('edit form is not visible initially', async ({ page }) => {
    await expect(page.locator('.inline-edit-form')).not.toBeVisible();
  });
});

test.describe('Bulk actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/items');
  });

  test('each item row has a selection checkbox', async ({ page }) => {
    const checkboxes = page.locator('.row-checkbox');
    await expect(checkboxes).toHaveCount(4);
  });

  test('bulk bar is not visible when nothing selected', async ({ page }) => {
    await expect(page.locator('.bulk-bar')).not.toBeVisible();
  });

  test('bulk bar appears after selecting an item', async ({ page }) => {
    await page.locator('.row-checkbox').first().check();
    await expect(page.locator('.bulk-bar')).toBeVisible();
  });

  test('bulk bar shows selected count', async ({ page }) => {
    await page.locator('.row-checkbox').first().check();
    await page.locator('.row-checkbox').nth(1).check();
    await expect(page.locator('.bulk-bar')).toContainText('2 selected');
  });

  test('bulk delete removes selected items', async ({ page }) => {
    await page.locator('.row-checkbox').first().check();
    await page.locator('.row-checkbox').nth(1).check();
    await page.locator('.bulk-btn.delete-btn').click();
    await expect(page.locator('.item-row')).toHaveCount(2);
  });

  test('bulk complete marks selected items as done', async ({ page }) => {
    // Select a pending item (index 1 = API integration, pending)
    await page.locator('.row-checkbox').nth(1).check();
    await page.locator('.bulk-btn.complete-btn').click();
    // The second row should now have completed class
    await expect(page.locator('.item-row').nth(1)).toHaveClass(/completed/);
  });

  test('"Clear selection" button hides bulk bar', async ({ page }) => {
    await page.locator('.row-checkbox').first().check();
    await expect(page.locator('.bulk-bar')).toBeVisible();
    await page.locator('.bulk-bar button', { hasText: 'Clear selection' }).click();
    await expect(page.locator('.bulk-bar')).not.toBeVisible();
  });
});
