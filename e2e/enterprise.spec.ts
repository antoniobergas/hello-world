import { test, expect } from '@playwright/test';

test.describe('Enterprise Admin Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('admin page has Enterprise Admin heading', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Enterprise Admin');
  });

  test('RBAC section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="RBAC section"]')).toBeVisible();
  });

  test('feature flags section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Feature flags section"]')).toBeVisible();
  });

  test('health check section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Health check section"]')).toBeVisible();
  });

  test('background jobs section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Background jobs section"]')).toBeVisible();
  });

  test('audit log section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Audit log section"]')).toBeVisible();
  });

  test('config section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Config section"]')).toBeVisible();
  });

  test('shows admin role badge by default', async ({ page }) => {
    await expect(page.locator('.role-value')).toContainText('ADMIN');
  });

  test('can switch to viewer role', async ({ page }) => {
    await page.locator('.role-btn', { hasText: 'viewer' }).click();
    await expect(page.locator('.role-value')).toContainText('VIEWER');
  });

  test('can switch to editor role', async ({ page }) => {
    await page.locator('.role-btn', { hasText: 'editor' }).click();
    await expect(page.locator('.role-value')).toContainText('EDITOR');
  });

  test('can switch back to admin role', async ({ page }) => {
    await page.locator('.role-btn', { hasText: 'viewer' }).click();
    await page.locator('.role-btn', { hasText: 'admin' }).click();
    await expect(page.locator('.role-value')).toContainText('ADMIN');
  });

  test('feature flags list is populated', async ({ page }) => {
    const flags = page.locator('.flag-item');
    await expect(flags).toHaveCount(6);
  });

  test('bulk-operations flag shows ON by default', async ({ page }) => {
    const bulkFlag = page.locator('[data-flag-key="bulk-operations"]');
    await expect(bulkFlag.locator('.flag-toggle')).toContainText('ON');
  });

  test('export-csv flag shows OFF by default', async ({ page }) => {
    const exportFlag = page.locator('[data-flag-key="export-csv"]');
    await expect(exportFlag.locator('.flag-toggle')).toContainText('OFF');
  });

  test('can toggle a feature flag ON', async ({ page }) => {
    const exportFlag = page.locator('[data-flag-key="export-csv"]');
    await exportFlag.locator('.flag-toggle').click();
    await expect(exportFlag.locator('.flag-toggle')).toContainText('ON');
  });

  test('can toggle a feature flag OFF', async ({ page }) => {
    const bulkFlag = page.locator('[data-flag-key="bulk-operations"]');
    await bulkFlag.locator('.flag-toggle').click();
    await expect(bulkFlag.locator('.flag-toggle')).toContainText('OFF');
  });

  test('toggling flag twice returns to original state', async ({ page }) => {
    const bulkFlag = page.locator('[data-flag-key="bulk-operations"]');
    await bulkFlag.locator('.flag-toggle').click();
    await bulkFlag.locator('.flag-toggle').click();
    await expect(bulkFlag.locator('.flag-toggle')).toContainText('ON');
  });

  test('health status indicator is shown', async ({ page }) => {
    await expect(page.locator('.health-status')).toBeVisible();
  });

  test('health indicators list is shown', async ({ page }) => {
    const indicators = page.locator('.indicator-item');
    await expect(indicators).toHaveCount(3);
  });

  test('refresh health button works', async ({ page }) => {
    await page.locator('.refresh-btn').click();
    await expect(page.locator('.health-status')).toBeVisible();
  });

  test('background jobs section shows no jobs initially', async ({ page }) => {
    await expect(page.locator('.no-jobs')).toBeVisible();
  });

  test('can enqueue a background job', async ({ page }) => {
    await page.locator('.run-job-btn').click();
    await expect(page.locator('.job-item')).toHaveCount(1);
  });

  test('enqueued job shows name', async ({ page }) => {
    await page.locator('.run-job-btn').click();
    await expect(page.locator('.job-name').first()).toContainText('Export Items to CSV');
  });

  test('audit log is empty initially', async ({ page }) => {
    await expect(page.locator('.no-entries')).toBeVisible();
  });

  test('enqueuing a job creates an audit log entry', async ({ page }) => {
    await page.locator('.run-job-btn').click();
    await expect(page.locator('.audit-entry')).toHaveCount(1);
  });

  test('audit entry shows action', async ({ page }) => {
    await page.locator('.run-job-btn').click();
    await expect(page.locator('.audit-action').first()).toContainText('EXPORT');
  });

  test('can clear audit log', async ({ page }) => {
    await page.locator('.run-job-btn').click();
    await page.locator('.clear-audit-btn').click();
    await expect(page.locator('.no-entries')).toBeVisible();
  });

  test('config section shows environment value', async ({ page }) => {
    await expect(page.locator('.env-badge')).toContainText('development');
  });

  test('config section shows API URL', async ({ page }) => {
    await expect(page.locator('.config-value').filter({ hasText: 'localhost' })).toContainText(
      'localhost',
    );
  });
});

test.describe('Admin Page Navigation', () => {
  test('can navigate to admin page from navbar', async ({ page }) => {
    await page.goto('/');
    await page.locator('a', { hasText: 'Admin' }).first().click();
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('h2')).toContainText('Enterprise Admin');
  });

  test('can navigate from admin page to items', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('a', { hasText: 'Items' }).first().click();
    await expect(page).toHaveURL(/\/items/);
  });

  test('can navigate from admin page to dashboard', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('a', { hasText: 'Dashboard' }).first().click();
    await expect(page).toHaveURL('/');
  });
});
