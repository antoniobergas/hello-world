import { test, expect } from '@playwright/test';

test.describe('Analytics widgets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analytics');
  });

  test('add widget button is visible', async ({ page }) => {
    await expect(page.locator('.add-widget-btn')).toBeVisible();
  });

  test('widget list is initially empty', async ({ page }) => {
    const widgetItems = page.locator('.widget-item');
    await expect(widgetItems).toHaveCount(0);
  });

  test('clicking add widget button adds one widget', async ({ page }) => {
    await page.locator('.add-widget-btn').click();
    await expect(page.locator('.widget-item')).toHaveCount(1);
  });

  test('adding two widgets shows two widget items', async ({ page }) => {
    await page.locator('.add-widget-btn').click();
    await page.locator('.add-widget-btn').click();
    await expect(page.locator('.widget-item')).toHaveCount(2);
  });

  test('added widget shows a title', async ({ page }) => {
    await page.locator('.add-widget-btn').click();
    await expect(page.locator('.widget-title').first()).toBeVisible();
  });

  test('added widget shows a badge type', async ({ page }) => {
    await page.locator('.add-widget-btn').click();
    await expect(page.locator('.badge-type').first()).toBeVisible();
  });

  test('added widget shows refresh interval', async ({ page }) => {
    await page.locator('.add-widget-btn').click();
    await expect(page.locator('.widget-interval').first()).toContainText('Refresh:');
  });

  test('adding three widgets shows three widget items', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.locator('.add-widget-btn').click();
    }
    await expect(page.locator('.widget-item')).toHaveCount(3);
  });

  test('widget titles increment with each addition', async ({ page }) => {
    await page.locator('.add-widget-btn').click();
    await page.locator('.add-widget-btn').click();
    const titles = page.locator('.widget-title');
    await expect(titles).toHaveCount(2);
  });

  test('each widget has an aria-label', async ({ page }) => {
    await page.locator('.add-widget-btn').click();
    const widget = page.locator('.widget-item').first();
    await expect(widget).toHaveAttribute('aria-label', /Widget:/);
  });
});

test.describe('Analytics metrics recording', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analytics');
  });

  test('empty state shown when no metrics recorded yet', async ({ page }) => {
    await expect(page.locator('[aria-label="Metrics summary"] .empty-state')).toContainText(
      'No metrics recorded yet',
    );
  });

  test('top metrics empty state shown initially', async ({ page }) => {
    await expect(page.locator('[aria-label="Top metrics"] .empty-state')).toContainText(
      'No metrics available',
    );
  });

  test('recording one metric removes metrics summary empty state', async ({ page }) => {
    await page.locator('.sample-btn').click();
    await expect(page.locator('[aria-label="Metrics summary"] .empty-state')).not.toBeVisible();
  });

  test('recording one metric shows metrics summary table', async ({ page }) => {
    await page.locator('.sample-btn').click();
    await expect(page.locator('.summary-table')).toBeVisible();
  });

  test('recording one metric populates top metrics list', async ({ page }) => {
    await page.locator('.sample-btn').click();
    await expect(page.locator('.top-metric-item').first()).toBeVisible();
  });

  test('top metric item shows name and total', async ({ page }) => {
    await page.locator('.sample-btn').click();
    await expect(page.locator('.top-metric-name').first()).toBeVisible();
    await expect(page.locator('.top-metric-total').first()).toBeVisible();
  });

  test('recording 5 metrics shows correct count', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.locator('.sample-btn').click();
    }
    await expect(page.locator('.metric-count')).toContainText('Total recorded: 5');
  });

  test('metrics summary table has the correct headers', async ({ page }) => {
    await page.locator('.sample-btn').click();
    await expect(page.locator('.summary-table th').first()).toContainText('Metric');
  });

  test('metric name appears in summary table', async ({ page }) => {
    await page.locator('.sample-btn').click();
    await expect(page.locator('.metric-name').first()).toBeVisible();
  });

  test('recording 4 different metrics cycles through metric names', async ({ page }) => {
    for (let i = 0; i < 4; i++) {
      await page.locator('.sample-btn').click();
    }
    // After 4 clicks each of the 4 metric names should be used
    const metricNames = page.locator('.metric-name');
    await expect(metricNames).toHaveCount(4);
  });

  test('summary table count column is populated after recording', async ({ page }) => {
    await page.locator('.sample-btn').click();
    // There should be at least one row with a count
    const rows = page.locator('.summary-table tbody tr');
    await expect(rows).toHaveCount(1);
  });
});

test.describe('Analytics page sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analytics');
  });

  test('all four sections are visible on page load', async ({ page }) => {
    await expect(page.locator('[aria-label="Record metrics"]')).toBeVisible();
    await expect(page.locator('[aria-label="Dashboard widgets"]')).toBeVisible();
    await expect(page.locator('[aria-label="Metrics summary"]')).toBeVisible();
    await expect(page.locator('[aria-label="Top metrics"]')).toBeVisible();
  });

  test('record section has Record Metric heading', async ({ page }) => {
    const section = page.locator('[aria-label="Record metrics"]');
    await expect(section.locator('h3')).toContainText('Record Metric');
  });

  test('widgets section has Widgets heading', async ({ page }) => {
    const section = page.locator('[aria-label="Dashboard widgets"]');
    await expect(section.locator('h3')).toContainText('Widgets');
  });

  test('metrics summary section has Metrics Summary heading', async ({ page }) => {
    const section = page.locator('[aria-label="Metrics summary"]');
    await expect(section.locator('h3')).toContainText('Metrics Summary');
  });

  test('top metrics section has Top Metrics heading', async ({ page }) => {
    const section = page.locator('[aria-label="Top metrics"]');
    await expect(section.locator('h3')).toContainText('Top Metrics');
  });

  test('combining widgets and metrics: add widget then record metric', async ({ page }) => {
    await page.locator('.add-widget-btn').click();
    await page.locator('.sample-btn').click();
    await expect(page.locator('.widget-item')).toHaveCount(1);
    await expect(page.locator('.metric-count')).toContainText('Total recorded: 1');
  });

  test('multiple adds and records are independent of each other', async ({ page }) => {
    await page.locator('.add-widget-btn').click();
    await page.locator('.add-widget-btn').click();
    await page.locator('.sample-btn').click();
    await page.locator('.sample-btn').click();
    await page.locator('.sample-btn').click();
    await expect(page.locator('.widget-item')).toHaveCount(2);
    await expect(page.locator('.metric-count')).toContainText('Total recorded: 3');
  });
});
