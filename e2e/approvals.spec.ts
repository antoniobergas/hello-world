import { test, expect } from '@playwright/test';

test.describe('Approvals page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/approvals');
  });

  test('page loads with Approval Workflow heading', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Approval Workflow');
  });

  test('pending approvals section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Pending approvals"]')).toBeVisible();
  });

  test('approval history section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Approval history"]')).toBeVisible();
  });

  test('submit sample request button is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Submit a sample approval request"]')).toBeVisible();
  });

  test('pending section shows empty state initially', async ({ page }) => {
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await expect(pendingSection.locator('.empty-state')).toBeVisible();
  });

  test('history section shows empty state initially', async ({ page }) => {
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.empty-state')).toBeVisible();
  });

  test('submitting a request shows it in pending list with approve button', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await expect(pendingSection.locator('.approve-btn').first()).toBeVisible();
  });

  test('submitting a request shows reject button on pending item', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await expect(pendingSection.locator('.reject-btn').first()).toBeVisible();
  });

  test('approving a pending request moves it to history', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await pendingSection.locator('.approve-btn').first().click();
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.approval-item').first()).toBeVisible();
  });

  test('approved item shows APPROVED badge in history', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await pendingSection.locator('.approve-btn').first().click();
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.status-badge').first()).toContainText('APPROVED');
  });

  test('rejecting a pending request moves it to history', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await pendingSection.locator('.reject-btn').first().click();
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.approval-item').first()).toBeVisible();
  });

  test('rejected item shows REJECTED badge in history', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await pendingSection.locator('.reject-btn').first().click();
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.status-badge').first()).toContainText('REJECTED');
  });

  test('after approving, pending section shows empty state', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await pendingSection.locator('.approve-btn').first().click();
    await expect(pendingSection.locator('.empty-state')).toBeVisible();
  });

  test('can submit multiple requests and all appear in pending', async ({ page }) => {
    await page.locator('.submit-btn').click();
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await expect(pendingSection.locator('.approval-item')).toHaveCount(2);
  });
});

test.describe('Approvals navigation', () => {
  test('can navigate to approvals from navbar', async ({ page }) => {
    await page.goto('/');
    await page.locator('a', { hasText: 'Approvals' }).first().click();
    await expect(page).toHaveURL(/\/approvals/);
    await expect(page.locator('h2')).toContainText('Approval Workflow');
  });

  test('can navigate back to dashboard from approvals page', async ({ page }) => {
    await page.goto('/approvals');
    await page.locator('a', { hasText: 'Dashboard' }).first().click();
    await expect(page).toHaveURL('/');
  });
});
