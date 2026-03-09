import { test, expect } from '@playwright/test';

test.describe('Approvals - submitting multiple requests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/approvals');
  });

  test('submitting two requests shows two pending items', async ({ page }) => {
    await page.locator('.submit-btn').click();
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await expect(pendingSection.locator('.approval-item')).toHaveCount(2);
  });

  test('submitting three requests shows three pending items', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.locator('.submit-btn').click();
    }
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await expect(pendingSection.locator('.approval-item')).toHaveCount(3);
  });

  test('submitted request shows a title', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await expect(pendingSection.locator('.approval-title').first()).toBeVisible();
  });

  test('submitted request shows meta information', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await expect(pendingSection.locator('.approval-meta').first()).toBeVisible();
  });

  test('submitted request shows a description', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await expect(pendingSection.locator('.approval-desc').first()).toBeVisible();
  });

  test('each pending item has an approve button', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await expect(pendingSection.locator('.approve-btn').first()).toBeVisible();
  });

  test('each pending item has a reject button', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await expect(pendingSection.locator('.reject-btn').first()).toBeVisible();
  });

  test('pending item aria-label contains request title', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await expect(pendingSection.locator('.approval-item').first()).toHaveAttribute(
      'aria-label',
      /Pending request:/,
    );
  });
});

test.describe('Approvals - approve flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/approvals');
  });

  test('approving a request removes it from pending', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await pendingSection.locator('.approve-btn').first().click();
    await expect(pendingSection.locator('.approval-item')).toHaveCount(0);
  });

  test('approving a request shows it in history', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await pendingSection.locator('.approve-btn').first().click();
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.approval-item').first()).toBeVisible();
  });

  test('approved item shows APPROVED status badge', async ({ page }) => {
    await page.locator('.submit-btn').click();
    await page.locator('[aria-label="Pending approvals"]').locator('.approve-btn').first().click();
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.status-badge').first()).toContainText('APPROVED');
  });

  test('approving one of two requests leaves one pending', async ({ page }) => {
    await page.locator('.submit-btn').click();
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await pendingSection.locator('.approve-btn').first().click();
    await expect(pendingSection.locator('.approval-item')).toHaveCount(1);
  });

  test('approving all requests shows empty pending state', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await pendingSection.locator('.approve-btn').first().click();
    await expect(pendingSection.locator('.empty-state')).toBeVisible();
  });

  test('approved history item shows title', async ({ page }) => {
    await page.locator('.submit-btn').click();
    await page.locator('[aria-label="Pending approvals"]').locator('.approve-btn').first().click();
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.approval-title').first()).toBeVisible();
  });

  test('approved history item has approval-approved css class', async ({ page }) => {
    await page.locator('.submit-btn').click();
    await page.locator('[aria-label="Pending approvals"]').locator('.approve-btn').first().click();
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.approval-approved').first()).toBeVisible();
  });
});

test.describe('Approvals - reject flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/approvals');
  });

  test('rejecting a request removes it from pending', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await pendingSection.locator('.reject-btn').first().click();
    await expect(pendingSection.locator('.approval-item')).toHaveCount(0);
  });

  test('rejecting a request shows it in history', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await pendingSection.locator('.reject-btn').first().click();
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.approval-item').first()).toBeVisible();
  });

  test('rejected item shows REJECTED status badge', async ({ page }) => {
    await page.locator('.submit-btn').click();
    await page.locator('[aria-label="Pending approvals"]').locator('.reject-btn').first().click();
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.status-badge').first()).toContainText('REJECTED');
  });

  test('rejected history item has approval-rejected css class', async ({ page }) => {
    await page.locator('.submit-btn').click();
    await page.locator('[aria-label="Pending approvals"]').locator('.reject-btn').first().click();
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.approval-rejected').first()).toBeVisible();
  });

  test('history shows mixed approved and rejected items', async ({ page }) => {
    await page.locator('.submit-btn').click();
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await pendingSection.locator('.approve-btn').first().click();
    await pendingSection.locator('.reject-btn').first().click();
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.approval-item')).toHaveCount(2);
  });

  test('history empty state is shown when all requests are pending (not yet actioned)', async ({
    page,
  }) => {
    // With no submissions, history is empty
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.empty-state')).toBeVisible();
  });

  test('rejecting all requests leaves pending empty state', async ({ page }) => {
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await pendingSection.locator('.reject-btn').first().click();
    await expect(pendingSection.locator('.empty-state')).toBeVisible();
  });
});
