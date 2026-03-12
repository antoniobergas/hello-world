import { test, expect } from '@playwright/test';

test.describe('Workforce App - Schedule', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/schedule');
  });

  test('h1 is "Employee Schedule"', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Employee Schedule');
  });

  test('shows schedule summary', async ({ page }) => {
    await expect(page.locator('.schedule-summary')).toBeVisible();
  });

  test('shows week navigation buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Previous week/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Next week/i })).toBeVisible();
  });
});

test.describe('Workforce App - Add Shift', () => {
  test('can open add shift form', async ({ page }) => {
    await page.goto('/schedule');
    await page.click('.add-shift-btn');
    await expect(page.locator('select[name="employeeId"]')).toBeVisible();
    await expect(page.locator('input[name="shiftDate"]')).toBeVisible();
    await expect(page.locator('input[name="startTime"]')).toBeVisible();
    await expect(page.locator('input[name="endTime"]')).toBeVisible();
    await expect(page.locator('.save-shift-btn')).toBeVisible();
  });
});

test.describe('Workforce App - Leave', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leave');
  });

  test('h1 is "Leave Requests"', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Leave Requests');
  });

  test('shows .leave-row elements', async ({ page }) => {
    const rows = page.locator('.leave-row');
    await expect(rows.first()).toBeVisible();
  });

  test('shows leave filter buttons All/Pending/Approved/Rejected', async ({ page }) => {
    const btns = page.locator('.leave-filter-btn');
    await expect(btns).toHaveCount(4);
  });

  test('can open new leave request form', async ({ page }) => {
    await page.click('.new-leave-btn');
    await expect(page.locator('select[name="leaveType"]')).toBeVisible();
    await expect(page.locator('input[name="startDate"]')).toBeVisible();
    await expect(page.locator('input[name="endDate"]')).toBeVisible();
    await expect(page.locator('.submit-leave-btn')).toBeVisible();
  });
});

test.describe('Workforce App - Timesheet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/timesheet');
  });

  test('h1 is "Timesheets"', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Timesheets');
  });

  test('shows .timesheet-row elements', async ({ page }) => {
    const rows = page.locator('.timesheet-row');
    await expect(rows.first()).toBeVisible();
  });

  test('shows .timesheet-summary', async ({ page }) => {
    await expect(page.locator('.timesheet-summary')).toBeVisible();
  });

  test('can open log hours form', async ({ page }) => {
    await page.click('.log-hours-btn');
    await expect(page.locator('select[name="employeeId"]')).toBeVisible();
    await expect(page.locator('input[name="timesheetDate"]')).toBeVisible();
    await expect(page.locator('input[name="hoursWorked"]')).toBeVisible();
    await expect(page.locator('input[name="project"]')).toBeVisible();
    await expect(page.locator('.save-hours-btn')).toBeVisible();
  });
});
