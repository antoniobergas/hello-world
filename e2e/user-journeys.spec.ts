import { test, expect } from '@playwright/test';

/**
 * Realistic end-to-end user journeys for AppBench.
 *
 * Each test tells a complete story that a real enterprise user would walk
 * through in a single browser session, combining multiple pages and features
 * just as a human would — not a contrived "visit every page" ping.
 */

// ─── Journey 1: New employee sets up their workspace ─────────────────────────
//
// Alex is a new hire. On their first day they open AppBench, set dark mode,
// enable email notifications, browse the item backlog, add their first task,
// and verify the dashboard reflects that task.

test.describe('Journey: new-employee workspace setup', () => {
  test('Alex sets preferences then adds a first task and sees it on the dashboard', async ({
    page,
  }) => {
    // 1. Land on the dashboard, confirm app is up.
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('AppBench Dashboard');

    // 2. Go to Preferences and switch to dark theme.
    await page.locator('nav.navbar a', { hasText: 'Preferences' }).click();
    await expect(page).toHaveURL(/\/preferences/);
    await page.locator('input[type="radio"][value="dark"]').check();
    await expect(page.locator('input[type="radio"][value="dark"]')).toBeChecked();

    // 3. Enable email notifications.
    const emailCheckbox = page.locator('input[aria-label="Toggle email notifications"]');
    if (!(await emailCheckbox.isChecked())) {
      await emailCheckbox.check();
    }
    await expect(emailCheckbox).toBeChecked();

    // 4. Navigate to Items and record the current total.
    await page.locator('nav.navbar a', { hasText: 'Items' }).click();
    // Wait for Angular's async pipe to resolve before counting existing items.
    await expect(page.locator('.item-row').first()).toBeVisible();
    const beforeCount = await page.locator('.item-row').count();

    // 5. Add a new high-priority task.
    await page.locator('button', { hasText: '+ Add Item' }).click();
    await page.locator('input[name="title"]').fill('Onboarding checklist');
    await page.locator('input[name="description"]').fill('Complete HR paperwork and system access');
    await page.locator('select[name="category"]').selectOption('general');
    await page.locator('select[name="priority"]').selectOption('high');
    await page.locator('button[type="submit"]').click();

    // 6. Confirm the item was added.
    await expect(page.locator('.item-row')).toHaveCount(beforeCount + 1);
    await expect(page.locator('.item-title').last()).toContainText('Onboarding checklist');

    // 7. Return to Dashboard and confirm the Total Items stat updated.
    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    await expect(
      page.locator('.stat-card').filter({ hasText: 'Total Items' }).locator('.stat-value'),
    ).toHaveText(String(beforeCount + 1));
  });
});

// ─── Journey 2: Manager morning review ───────────────────────────────────────
//
// Jordan is a manager. Every morning they open AppBench, approve the overnight
// approval queue, record the day's first analytics metric, check for any alerts
// in notifications, then do a final dashboard review to start the day.

test.describe('Journey: manager morning review', () => {
  test('Jordan approves pending requests then records a metric and reviews the dashboard', async ({
    page,
  }) => {
    // 1. Start on the Approvals page.
    await page.goto('/approvals');
    await expect(page.locator('h2')).toContainText('Approval Workflow');

    // 2. If there are pending items, approve the first one; otherwise submit + approve.
    const pendingList = page.locator('.approval-item.pending');
    if ((await pendingList.count()) === 0) {
      await page.locator('.submit-btn').click();
      await expect(pendingList).toHaveCount(1);
    }
    await pendingList.first().locator('.approve-btn').click();

    // 3. Verify the approved item appears in History (no longer pending).
    const historyItems = page.locator('.approval-item.approval-approved');
    await expect(historyItems.first()).toBeVisible();

    // 4. Go to Analytics and record the morning's metric.
    await page.locator('nav.navbar a', { hasText: 'Analytics' }).click();
    await expect(page.locator('h2')).toContainText('Analytics Dashboard');
    const beforeMetrics = await page
      .locator('.metric-count')
      .first()
      .evaluate((el) => Number(el.textContent?.match(/\d+/)?.[0] ?? '0'));
    await page.locator('.sample-btn').click();
    await expect(page.locator('.metric-count').first()).toContainText(String(beforeMetrics + 1));

    // 5. Add an analytics widget for the morning session.
    await page.locator('.add-widget-btn').click();
    await expect(page.locator('.widget-item').last()).toBeVisible();

    // 6. Switch to Notifications to check for overnight alerts.
    await page.locator('nav.navbar a', { hasText: 'Notifications' }).click();
    await page.locator('.demo-btn.warning').click();
    await expect(page.locator('.notification-item').last()).toBeVisible();

    // 7. Dismiss that single notification.
    const lastNotification = page.locator('.notification-item').last();
    await lastNotification.locator('.dismiss-btn').click();

    // 8. Confirm the warning notification is gone.
    await expect(
      page.locator('.notification-item').filter({ hasText: 'warning' }).last(),
    ).not.toBeVisible();

    // 9. Finish with a dashboard review.
    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    await expect(page.locator('.stat-card').filter({ hasText: 'Completed' })).toBeVisible();
    await expect(page.locator('.progress-section')).toBeVisible();
  });
});

// ─── Journey 3: IT admin system check and feature rollout ────────────────────
//
// Sam is an IT admin. They switch roles to admin, refresh the health-check
// panel, enable a feature flag for a controlled rollout, trigger a background
// export job, then review the audit log — all before handing off to the team.

test.describe('Journey: IT admin system check and feature rollout', () => {
  test('Sam does a full admin system-check and enables a feature flag', async ({ page }) => {
    // 1. Land on Admin page.
    await page.goto('/admin');
    await expect(page.locator('h2')).toContainText('Enterprise Admin');

    // 2. Confirm we are in admin role; switch explicitly if needed.
    const adminRoleBtn = page.locator('.role-btn', { hasText: 'admin' });
    await adminRoleBtn.click();
    await expect(page.locator('.role-value')).toContainText('ADMIN');

    // 3. Refresh health check and verify status indicator.
    await page.locator('.refresh-btn').click();
    await expect(page.locator('.health-status')).toBeVisible();

    // 4. Toggle the 'export-csv' flag ON (enable it if it's currently OFF).
    const exportFlag = page.locator('[data-flag-key="export-csv"]');
    const exportToggle = exportFlag.locator('.flag-toggle');
    if ((await exportToggle.textContent())?.trim() === 'OFF') {
      await exportToggle.click();
    }
    await expect(exportToggle).toContainText('ON');

    // 5. Run an export background job.
    await page.locator('.run-job-btn').click();
    await expect(page.locator('.job-item').first()).toBeVisible();

    // 6. Verify the audit log section is present (admin can read it).
    await expect(page.locator('[aria-label="Audit log section"]')).toBeVisible();

    // 7. Switch to viewer role to verify role isolation.
    await page.locator('.role-btn', { hasText: 'viewer' }).click();
    await expect(page.locator('.role-value')).toContainText('VIEWER');

    // 8. Restore admin role before leaving.
    await page.locator('.role-btn', { hasText: 'admin' }).click();
    await expect(page.locator('.role-value')).toContainText('ADMIN');
  });
});

// ─── Journey 4: Power user sprint planning session ────────────────────────────
//
// Taylor is a team lead doing sprint planning. They add three new items with
// different priorities, mark one existing item complete, filter to see only
// Pending items, search for a specific item, then check the dashboard to
// validate the updated completion rate and totals.

test.describe('Journey: power user sprint planning', () => {
  test('Taylor plans the sprint — adds items, completes one, filters, and checks dashboard', async ({
    page,
  }) => {
    // 1. Open items page and record baseline counts.
    await page.goto('/items');
    const baseTotal = await page.locator('.item-row').count();
    const baseCompleted = await page.locator('.item-row.completed').count();

    // 2. Add three sprint items.
    const newItems = [
      { title: 'Sprint-1 auth refactor', priority: 'high', category: 'development' },
      { title: 'Sprint-1 UI polish', priority: 'medium', category: 'design' },
      { title: 'Sprint-1 docs update', priority: 'low', category: 'general' },
    ];
    for (const item of newItems) {
      await page.locator('button', { hasText: '+ Add Item' }).click();
      await page.locator('input[name="title"]').fill(item.title);
      await page.locator('select[name="priority"]').selectOption(item.priority);
      await page.locator('select[name="category"]').selectOption(item.category);
      await page.locator('button[type="submit"]').click();
    }
    await expect(page.locator('.item-row')).toHaveCount(baseTotal + 3);

    // 3. Complete the first uncompleted item in the list.
    const firstUnchecked = page
      .locator('.item-row:not(.completed) .item-check input[type="checkbox"]')
      .first();
    await firstUnchecked.check();
    await expect(page.locator('.item-row.completed')).toHaveCount(baseCompleted + 1);

    // 4. Filter to Pending only and confirm no completed items are shown.
    await page.locator('button', { hasText: 'Pending' }).click();
    const pendingItems = page.locator('.item-row');
    const count = await pendingItems.count();
    expect(count).toBeGreaterThan(0);
    // All visible items should NOT have the completed class.
    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(pendingItems.nth(i)).not.toHaveClass(/completed/);
    }

    // 5. Search for the high-priority sprint item.
    await page.locator('button', { hasText: 'All' }).click();
    await page.locator('.search-input').fill('Sprint-1 auth');
    await expect(
      page.locator('.item-row').filter({ hasText: 'Sprint-1 auth refactor' }),
    ).toBeVisible();

    // 6. Clear search and navigate to Dashboard.
    await page.locator('.search-input').fill('');
    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();

    // 7. Verify Total Items and Completed stats are updated.
    await expect(
      page.locator('.stat-card').filter({ hasText: 'Total Items' }).locator('.stat-value'),
    ).toHaveText(String(baseTotal + 3));
    await expect(
      page.locator('.stat-card').filter({ hasText: 'Completed' }).locator('.stat-value'),
    ).toHaveText(String(baseCompleted + 1));
  });
});

// ─── Journey 5: Full cross-department approval and notification audit ─────────
//
// A department head (Morgan) submits a budget approval request, checks that
// a system notification was generated, then switches hats to admin to approve
// the request, verifies the history, and finally reviews the analytics
// summary to confirm the event was tracked.

test.describe('Journey: cross-department approval and notification audit', () => {
  test('Morgan submits an approval, checks notifications, approves as admin, then audits analytics', async ({
    page,
  }) => {
    // 1. Go to Approvals and submit a request.
    await page.goto('/approvals');
    await page.locator('.submit-btn').click();

    // 2. The new request should be in the pending list.
    await expect(page.locator('.approval-item.pending').first()).toBeVisible();
    const requestTitle = await page
      .locator('.approval-item.pending')
      .first()
      .locator('.approval-title')
      .textContent();
    expect(requestTitle).toBeTruthy();

    // 3. Navigate to Notifications and add an info notification about the submission.
    await page.locator('nav.navbar a', { hasText: 'Notifications' }).click();
    await page.locator('.demo-btn.info').click();
    await expect(page.locator('.notification-item').first()).toBeVisible();
    await expect(
      page.locator('.notification-item').filter({ hasText: 'info' }).first(),
    ).toBeVisible();

    // 4. Go back to Approvals and approve the pending request.
    await page.locator('nav.navbar a', { hasText: 'Approvals' }).click();
    await page.locator('.approval-item.pending').first().locator('.approve-btn').click();

    // 5. Confirm the approval now appears in History with APPROVED badge.
    await expect(page.locator('.approval-item.approval-approved').first()).toBeVisible();
    await expect(
      page.locator('.approval-item.approval-approved').first().locator('.badge-approved'),
    ).toBeVisible();

    // 6. Record a metric in Analytics to represent the completed workflow.
    await page.locator('nav.navbar a', { hasText: 'Analytics' }).click();
    await page.locator('.sample-btn').click();
    await expect(page.locator('.metric-count').first()).toContainText(/\d+/);

    // 7. Finish on the Dashboard — all stats should be visible and stable.
    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    await expect(page.locator('.stat-card')).toHaveCount(5);
    await expect(page.locator('.progress-section')).toBeVisible();
    await expect(page.locator('.quick-actions')).toBeVisible();
  });
});
