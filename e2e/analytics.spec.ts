import { test, expect } from '@playwright/test';

test.describe('Analytics page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analytics');
  });

  test('page loads with Analytics Dashboard heading', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Analytics Dashboard');
  });

  test('analytics dashboard section has correct aria-label', async ({ page }) => {
    await expect(page.locator('[aria-label="Analytics dashboard"]')).toBeVisible();
  });

  test('widgets section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Dashboard widgets"]')).toBeVisible();
  });

  test('metrics summary section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Metrics summary"]')).toBeVisible();
  });

  test('top metrics section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Top metrics"]')).toBeVisible();
  });

  test('record metrics section is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Record metrics"]')).toBeVisible();
  });

  test('Record Sample Metric button is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Record sample metric"]')).toBeVisible();
  });

  test('initial total recorded count is 0', async ({ page }) => {
    await expect(page.locator('.metric-count')).toContainText('Total recorded: 0');
  });

  test('clicking Record Sample Metric increases metrics count', async ({ page }) => {
    await page.locator('.sample-btn').click();
    await expect(page.locator('.metric-count')).toContainText('Total recorded: 1');
  });

  test('recording multiple metrics increments count correctly', async ({ page }) => {
    await page.locator('.sample-btn').click();
    await page.locator('.sample-btn').click();
    await page.locator('.sample-btn').click();
    await expect(page.locator('.metric-count')).toContainText('Total recorded: 3');
  });

  test('after recording a metric, top metrics section shows data', async ({ page }) => {
    await page.locator('.sample-btn').click();
    const topMetrics = page.locator('[aria-label="Top metrics"]');
    await expect(topMetrics.locator('.top-metric-item').first()).toBeVisible();
  });

  test('after recording a metric, metrics summary table appears', async ({ page }) => {
    await page.locator('.sample-btn').click();
    await expect(page.locator('[aria-label="Metrics summary table"]')).toBeVisible();
  });

  test('add sample widget button is visible', async ({ page }) => {
    await expect(page.locator('[aria-label="Add sample widget"]')).toBeVisible();
  });

  test('clicking add sample widget adds a widget to the list', async ({ page }) => {
    const widgetsSection = page.locator('[aria-label="Dashboard widgets"]');
    await page.locator('[aria-label="Add sample widget"]').click();
    await expect(widgetsSection.locator('.widget-item').first()).toBeVisible();
  });

  test('added widget shows title and type badge', async ({ page }) => {
    await page.locator('[aria-label="Add sample widget"]').click();
    const firstWidget = page.locator('.widget-item').first();
    await expect(firstWidget.locator('.widget-title')).toBeVisible();
    await expect(firstWidget.locator('.badge-type')).toBeVisible();
  });
});

test.describe('Analytics navigation', () => {
  test('can navigate to analytics from navbar', async ({ page }) => {
    await page.goto('/');
    await page.locator('a', { hasText: 'Analytics' }).first().click();
    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.locator('h2')).toContainText('Analytics Dashboard');
  });

  test('can navigate back to dashboard from analytics page', async ({ page }) => {
    await page.goto('/analytics');
    await page.locator('a', { hasText: 'Dashboard' }).first().click();
    await expect(page).toHaveURL('/');
  });

  test('can navigate from analytics to approvals', async ({ page }) => {
    await page.goto('/analytics');
    await page.locator('a', { hasText: 'Approvals' }).first().click();
    await expect(page).toHaveURL(/\/approvals/);
  });
});
