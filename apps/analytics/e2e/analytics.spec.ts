import { test, expect } from '@playwright/test';

test.describe('Analytics App - KPI Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('h1 is "Analytics Dashboard"', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Analytics Dashboard');
  });

  test('shows .metric-card elements', async ({ page }) => {
    const cards = page.locator('.metric-card');
    await expect(cards.first()).toBeVisible();
  });

  test('shows .dashboard-summary', async ({ page }) => {
    await expect(page.locator('.dashboard-summary')).toBeVisible();
  });

  test('shows category tabs', async ({ page }) => {
    const tabs = page.locator('.category-tab');
    await expect(tabs).toHaveCount(6);
  });

  test('can click refresh on a metric', async ({ page }) => {
    const refreshBtn = page.locator('.refresh-btn').first();
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await expect(page.locator('.metric-card').first()).toBeVisible();
  });
});

test.describe('Analytics App - Trends', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/trends');
  });

  test('h1 is "Trend Analysis"', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Trend Analysis');
  });

  test('shows series selector', async ({ page }) => {
    await expect(page.locator('.series-select')).toBeVisible();
  });

  test('shows data point rows for default selection', async ({ page }) => {
    const rows = page.locator('.data-point-row');
    await expect(rows.first()).toBeVisible();
  });

  test('shows trend summary', async ({ page }) => {
    await expect(page.locator('.trend-summary')).toBeVisible();
  });
});

test.describe('Analytics App - Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/alerts');
  });

  test('h1 is "Analytics Alerts"', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Analytics Alerts');
  });

  test('shows .alert-row elements', async ({ page }) => {
    const rows = page.locator('.alert-row');
    await expect(rows.first()).toBeVisible();
  });

  test('shows .alerts-summary', async ({ page }) => {
    await expect(page.locator('.alerts-summary')).toBeVisible();
  });

  test('severity filter tabs are visible', async ({ page }) => {
    const tabs = page.locator('.severity-tab');
    await expect(tabs).toHaveCount(4);
  });

  test('can acknowledge an active alert', async ({ page }) => {
    const ackBtn = page.locator('.ack-btn').first();
    if (await ackBtn.isVisible()) {
      await ackBtn.click();
      await expect(page.locator('.alerts-summary')).toBeVisible();
    }
  });

  test('can add a new alert', async ({ page }) => {
    const beforeCount = await page.locator('.alert-row').count();
    await page.click('.add-alert-btn');
    await expect(page.locator('input[name="alertTitle"]')).toBeVisible();
    await page.fill('input[name="alertTitle"]', 'E2E Test Alert');
    await page.fill('textarea[name="alertDescription"]', 'Created by E2E test');
    await page.click('.save-alert-btn');
    const afterCount = await page.locator('.alert-row').count();
    expect(afterCount).toBeGreaterThan(beforeCount);
  });
});
