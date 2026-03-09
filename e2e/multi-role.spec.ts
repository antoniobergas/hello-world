import { test, expect } from '@playwright/test';

test.describe('Multi-role behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('admin page shows role management (RBAC) section', async ({ page }) => {
    await expect(page.locator('[aria-label="RBAC section"]')).toBeVisible();
  });

  test('shows admin role badge by default', async ({ page }) => {
    await expect(page.locator('.role-value')).toContainText('ADMIN');
  });

  test('can switch to editor role', async ({ page }) => {
    await page.locator('.role-btn', { hasText: 'editor' }).click();
    await expect(page.locator('.role-value')).toContainText('EDITOR');
  });

  test('can switch to viewer role', async ({ page }) => {
    await page.locator('.role-btn', { hasText: 'viewer' }).click();
    await expect(page.locator('.role-value')).toContainText('VIEWER');
  });

  test('can switch to admin role from viewer', async ({ page }) => {
    await page.locator('.role-btn', { hasText: 'viewer' }).click();
    await page.locator('.role-btn', { hasText: 'admin' }).click();
    await expect(page.locator('.role-value')).toContainText('ADMIN');
  });

  test('role badge updates immediately after switching roles', async ({ page }) => {
    await page.locator('.role-btn', { hasText: 'editor' }).click();
    await expect(page.locator('.role-value')).toContainText('EDITOR');
    await page.locator('.role-btn', { hasText: 'viewer' }).click();
    await expect(page.locator('.role-value')).toContainText('VIEWER');
  });

  test('feature flags section is visible for admin role', async ({ page }) => {
    await expect(page.locator('[aria-label="Feature flags section"]')).toBeVisible();
  });

  test('feature flags section is visible after switching to editor role', async ({ page }) => {
    await page.locator('.role-btn', { hasText: 'editor' }).click();
    await expect(page.locator('[aria-label="Feature flags section"]')).toBeVisible();
  });

  test('feature flags section is visible after switching to viewer role', async ({ page }) => {
    await page.locator('.role-btn', { hasText: 'viewer' }).click();
    await expect(page.locator('[aria-label="Feature flags section"]')).toBeVisible();
  });

  test('admin role: health check section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Health check section"]')).toBeVisible();
  });

  test('admin role: background jobs section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Background jobs section"]')).toBeVisible();
  });

  test('admin role: audit log section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Audit log section"]')).toBeVisible();
  });

  test('admin role: config section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Config section"]')).toBeVisible();
  });

  test('switching role does not hide the RBAC section', async ({ page }) => {
    await page.locator('.role-btn', { hasText: 'editor' }).click();
    await expect(page.locator('[aria-label="RBAC section"]')).toBeVisible();
    await page.locator('.role-btn', { hasText: 'viewer' }).click();
    await expect(page.locator('[aria-label="RBAC section"]')).toBeVisible();
  });

  test('feature flag list has expected number of flags', async ({ page }) => {
    await expect(page.locator('.flag-item')).toHaveCount(6);
  });

  test('can toggle a feature flag as admin', async ({ page }) => {
    const exportFlag = page.locator('[data-flag-key="export-csv"]');
    await exportFlag.locator('.flag-toggle').click();
    await expect(exportFlag.locator('.flag-toggle')).toContainText('ON');
  });
});
