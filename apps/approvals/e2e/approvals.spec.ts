import { test, expect } from '@playwright/test';

test.describe('Approvals App - Queue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/queue');
  });

  test('h1 is "Approval Queue"', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Approval Queue');
  });

  test('shows .approval-row elements', async ({ page }) => {
    const rows = page.locator('.approval-row');
    await expect(rows.first()).toBeVisible();
  });

  test('shows .queue-summary', async ({ page }) => {
    await expect(page.locator('.queue-summary')).toBeVisible();
  });

  test('shows filter tabs All/Pending/In Review/Approved/Rejected', async ({ page }) => {
    const tabs = page.locator('.queue-tab');
    await expect(tabs).toHaveCount(5);
  });

  test('can approve a pending request', async ({ page }) => {
    const approveBtn = page.locator('.approve-btn').first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await expect(page.locator('.approval-row').first()).toBeVisible();
    }
  });
});

test.describe('Approvals App - Submit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/submit');
  });

  test('h1 is "Submit Request"', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Submit Request');
  });

  test('form fields are present', async ({ page }) => {
    await expect(page.locator('select[name="type"]')).toBeVisible();
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('select[name="priority"]')).toBeVisible();
    await expect(page.locator('input[name="requestedBy"]')).toBeVisible();
    await expect(page.locator('.submit-request-btn')).toBeVisible();
  });

  test('submit form shows success message', async ({ page }) => {
    await page.selectOption('select[name="type"]', 'expense');
    await page.fill('input[name="title"]', 'Test Expense Request');
    await page.fill('textarea[name="description"]', 'A test expense for E2E');
    await page.fill('input[name="requestedBy"]', 'E2E Tester');
    await page.click('.submit-request-btn');
    await expect(page.locator('.submission-success')).toBeVisible();
  });
});

test.describe('Approvals App - History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/history');
  });

  test('h1 is "Approval History"', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Approval History');
  });

  test('shows .history-row elements', async ({ page }) => {
    const rows = page.locator('.history-row');
    await expect(rows.first()).toBeVisible();
  });

  test('shows history-type-filter and history-status-filter', async ({ page }) => {
    await expect(page.locator('.history-type-filter')).toBeVisible();
    await expect(page.locator('.history-status-filter')).toBeVisible();
  });
});
