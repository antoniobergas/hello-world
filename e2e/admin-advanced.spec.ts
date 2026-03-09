import { test, expect } from '@playwright/test';

test.describe('Admin - health check', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('health status is visible', async ({ page }) => {
    await expect(page.locator('.health-status')).toBeVisible();
  });

  test('health status contains an Overall label', async ({ page }) => {
    await expect(page.locator('.health-status')).toContainText('Overall:');
  });

  test('refresh health button is visible', async ({ page }) => {
    await expect(page.locator('.refresh-btn')).toBeVisible();
  });

  test('clicking refresh health does not crash the page', async ({ page }) => {
    await page.locator('.refresh-btn').click();
    await expect(page.locator('h2')).toContainText('Enterprise Admin');
  });

  test('health indicators list is visible', async ({ page }) => {
    await expect(page.locator('.indicator-list')).toBeVisible();
  });

  test('health indicators contain indicator items', async ({ page }) => {
    const items = page.locator('.indicator-item');
    await expect(items.first()).toBeVisible();
  });

  test('each indicator shows a name', async ({ page }) => {
    await expect(page.locator('.indicator-name').first()).toBeVisible();
  });

  test('each indicator shows a status', async ({ page }) => {
    await expect(page.locator('.indicator-status').first()).toBeVisible();
  });

  test('each indicator shows a message', async ({ page }) => {
    await expect(page.locator('.indicator-message').first()).toBeVisible();
  });
});

test.describe('Admin - background jobs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('run export job button is visible', async ({ page }) => {
    await expect(page.locator('.run-job-btn')).toBeVisible();
  });

  test('clear completed button is visible', async ({ page }) => {
    await expect(page.locator('.clear-jobs-btn')).toBeVisible();
  });

  test('job list section shows empty or populated state', async ({ page }) => {
    await expect(page.locator('[aria-label="Background jobs section"]')).toBeVisible();
  });

  test('clicking run export job adds a job to the list', async ({ page }) => {
    await page.locator('.run-job-btn').click();
    await expect(page.locator('.job-item').first()).toBeVisible();
  });

  test('job item shows job name', async ({ page }) => {
    await page.locator('.run-job-btn').click();
    await expect(page.locator('.job-name').first()).toBeVisible();
  });

  test('job item shows job status', async ({ page }) => {
    await page.locator('.run-job-btn').click();
    await expect(page.locator('.job-status').first()).toBeVisible();
  });

  test('job item shows job progress', async ({ page }) => {
    await page.locator('.run-job-btn').click();
    await expect(page.locator('.job-progress').first()).toBeVisible();
  });

  test('running two export jobs adds two jobs', async ({ page }) => {
    await page.locator('.run-job-btn').click();
    await page.locator('.run-job-btn').click();
    await expect(page.locator('.job-item')).toHaveCount(2);
  });
});

test.describe('Admin - audit log', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('audit log section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Audit log section"]')).toBeVisible();
  });

  test('clear audit log button is visible', async ({ page }) => {
    await expect(page.locator('.clear-audit-btn')).toBeVisible();
  });

  test('clicking clear audit log button does not crash the page', async ({ page }) => {
    await page.locator('.clear-audit-btn').click();
    await expect(page.locator('h2')).toContainText('Enterprise Admin');
  });

  test('after clearing audit log, no-entries message appears', async ({ page }) => {
    await page.locator('.clear-audit-btn').click();
    await expect(page.locator('.no-entries')).toBeVisible();
  });
});

test.describe('Admin - configuration section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('config section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Config section"]')).toBeVisible();
  });

  test('environment config item is visible', async ({ page }) => {
    const envItem = page.locator('.config-item').filter({ hasText: 'Environment' });
    await expect(envItem).toBeVisible();
  });

  test('api base url config item is visible', async ({ page }) => {
    const apiItem = page.locator('.config-item').filter({ hasText: 'API Base URL' });
    await expect(apiItem).toBeVisible();
  });

  test('max items per page config item is visible', async ({ page }) => {
    const maxItem = page.locator('.config-item').filter({ hasText: 'Max Items Per Page' });
    await expect(maxItem).toBeVisible();
  });

  test('debug mode config item is visible', async ({ page }) => {
    const debugItem = page.locator('.config-item').filter({ hasText: 'Debug Mode' });
    await expect(debugItem).toBeVisible();
  });

  test('environment badge is shown', async ({ page }) => {
    await expect(page.locator('.env-badge')).toBeVisible();
  });

  test('api base url config value is shown', async ({ page }) => {
    const apiItem = page.locator('.config-item').filter({ hasText: 'API Base URL' });
    await expect(apiItem.locator('.config-value')).toBeVisible();
  });
});

test.describe('Admin - feature flags advanced', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('toggling a flag twice restores original state', async ({ page }) => {
    const exportFlag = page.locator('[data-flag-key="export-csv"]');
    const toggle = exportFlag.locator('.flag-toggle');
    const originalText = await toggle.textContent();
    await toggle.click();
    await toggle.click();
    await expect(toggle).toContainText(originalText!.trim());
  });

  test('each flag item shows flag name', async ({ page }) => {
    await expect(page.locator('.flag-name').first()).toBeVisible();
  });

  test('each flag item shows flag description', async ({ page }) => {
    await expect(page.locator('.flag-desc').first()).toBeVisible();
  });

  test('toggling multiple flags works independently', async ({ page }) => {
    const exportFlag = page.locator('[data-flag-key="export-csv"]');
    const bulkFlag = page.locator('[data-flag-key="bulk-operations"]');
    await exportFlag.locator('.flag-toggle').click();
    await expect(exportFlag.locator('.flag-toggle')).toContainText('ON');
    await expect(bulkFlag.locator('.flag-toggle')).toContainText('ON');
  });
});
