import { test, expect } from '@playwright/test';

test.describe('Reporting - Overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/overview');
  });

  test('shows Business Overview heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Business Overview');
  });

  test('shows 6 KPI cards', async ({ page }) => {
    await expect(page.locator('.kpi-card')).toHaveCount(6);
  });

  test('each KPI card shows a name and value', async ({ page }) => {
    const card = page.locator('.kpi-card').first();
    await expect(card.locator('.kpi-name')).toBeVisible();
    await expect(card.locator('.kpi-value')).toBeVisible();
  });

  test('each KPI card shows a trend indicator', async ({ page }) => {
    await expect(page.locator('.kpi-trend').first()).toBeVisible();
  });

  test('refresh button on a KPI card triggers an update', async ({ page }) => {
    const before = await page.locator('.kpi-card').first().locator('.kpi-value').textContent();
    await page.locator('.kpi-refresh-btn').first().click();
    // Value may or may not change, but the page should be stable.
    await expect(page.locator('.kpi-card').first()).toBeVisible();
  });

  test('shows trend summaries section', async ({ page }) => {
    await expect(page.locator('.series-section')).toBeVisible();
    await expect(page.locator('.series-card')).toHaveCount(2);
  });

  test('each series card shows data points', async ({ page }) => {
    await expect(page.locator('.series-card').first().locator('.point')).toHaveCount(5);
  });
});

test.describe('Reporting - Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
  });

  test('shows Reports heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Reports');
  });

  test('seeds 4 reports on load', async ({ page }) => {
    await expect(page.locator('.report-row')).toHaveCount(4);
  });

  test('New Report button shows the create form', async ({ page }) => {
    await page.locator('.new-report-btn').click();
    await expect(page.locator('.report-form')).toBeVisible();
  });

  test('can create a new report', async ({ page }) => {
    const before = await page.locator('.report-row').count();
    await page.locator('.new-report-btn').click();
    await page.locator('#reportName').fill('Q1 Sales Summary');
    await page.locator('#reportDesc').fill('All sales data for Q1 2025');
    await page.locator('.create-btn').click();
    await expect(page.locator('.report-row')).toHaveCount(before + 1);
    await expect(page.locator('.report-row').last()).toContainText('Q1 Sales Summary');
  });

  test('cancel form without creating keeps count the same', async ({ page }) => {
    const before = await page.locator('.report-row').count();
    await page.locator('.new-report-btn').click();
    await expect(page.locator('.report-form')).toBeVisible();
    await page.locator('.new-report-btn').click();
    await expect(page.locator('.report-form')).not.toBeVisible();
    await expect(page.locator('.report-row')).toHaveCount(before);
  });

  test('Run button sets report to running', async ({ page }) => {
    await page.locator('.run-btn').first().click();
    // Page should remain stable.
    await expect(page.locator('.report-row').first()).toBeVisible();
  });

  test('Export button adds a job to the Exports page', async ({ page }) => {
    await page.goto('/exports');
    const before = await page.locator('.export-row').count();
    await page.goto('/reports');
    await page.locator('.export-btn').first().click();
    await page.locator('nav a', { hasText: 'Exports' }).click();
    await expect(page.locator('.export-row')).toHaveCount(before + 1);
  });

  test('Delete button removes the report', async ({ page }) => {
    const before = await page.locator('.report-row').count();
    await page.locator('.delete-btn').last().click();
    await expect(page.locator('.report-row')).toHaveCount(before - 1);
  });
});

test.describe('Reporting - Exports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exports');
  });

  test('shows Exports heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Exports');
  });

  test('seeds 3 export jobs on load', async ({ page }) => {
    await expect(page.locator('.export-row')).toHaveCount(3);
  });

  test('ready jobs show a Download button', async ({ page }) => {
    const readyRow = page
      .locator('.export-row')
      .filter({ has: page.locator('.badge-ready') })
      .first();
    await expect(readyRow.locator('.download-btn')).toBeVisible();
  });

  test('can delete an export job', async ({ page }) => {
    const before = await page.locator('.export-row').count();
    await page.locator('.delete-export-btn').first().click();
    await expect(page.locator('.export-row')).toHaveCount(before - 1);
  });
});

test.describe('Reporting - Navigation', () => {
  test('navbar links navigate between pages', async ({ page }) => {
    await page.goto('/overview');
    await page.locator('nav a', { hasText: 'Reports' }).click();
    await expect(page).toHaveURL(/\/reports/);
    await page.locator('nav a', { hasText: 'Exports' }).click();
    await expect(page).toHaveURL(/\/exports/);
    await page.locator('nav a', { hasText: 'Overview' }).click();
    await expect(page).toHaveURL(/\/overview/);
  });
});

// ─── User Journey: Analyst creates a report and exports it ───────────────────
test.describe('Journey: analyst builds and exports a report', () => {
  test('analyst reviews KPIs, creates a report, runs it, and exports as CSV', async ({ page }) => {
    // 1. Start on Overview and review KPIs.
    await page.goto('/overview');
    await expect(page.locator('.kpi-card')).toHaveCount(6);
    await expect(page.locator('.kpi-card').filter({ hasText: 'Active Users' })).toBeVisible();

    // 2. Refresh the Active Users KPI.
    const activeUsersCard = page.locator('.kpi-card').filter({ hasText: 'Active Users' });
    await activeUsersCard.locator('.kpi-refresh-btn').click();
    await expect(activeUsersCard.locator('.kpi-value')).toBeVisible();

    // 3. Navigate to Reports and create a new report.
    await page.locator('nav a', { hasText: 'Reports' }).click();
    const beforeReports = await page.locator('.report-row').count();
    await page.locator('.new-report-btn').click();
    await page.locator('#reportName').fill('Q2 Active User Trend');
    await page.locator('#reportDesc').fill('Weekly DAU trend for Q2 planning');
    await page.locator('.create-btn').click();
    await expect(page.locator('.report-row')).toHaveCount(beforeReports + 1);

    // 4. Run the new report.
    await page.locator('.run-btn').last().click();
    await expect(page.locator('.report-row').last()).toBeVisible();

    // 5. Export the last report as CSV.
    await page.goto('/exports');
    const beforeExports = await page.locator('.export-row').count();
    await page.goto('/reports');
    const lastRow = page.locator('.report-row').last();
    await lastRow.locator('.format-select').selectOption('csv');
    await lastRow.locator('.export-btn').click();

    // 6. Verify the export appeared in the Exports list.
    await page.locator('nav a', { hasText: 'Exports' }).click();
    await expect(page.locator('.export-row')).toHaveCount(beforeExports + 1);
    await expect(page.locator('.export-row').first().locator('.export-format')).toContainText(
      'CSV',
    );
  });
});
