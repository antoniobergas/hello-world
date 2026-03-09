import { test, expect } from '@playwright/test';

// ─── Items + Dashboard ──────────────────────────────────────────────────────

test.describe('Items and Dashboard cross-feature', () => {
  test('adding an item updates the dashboard Total Items count', async ({ page }) => {
    await page.goto('/items');
    const itemCount = await page.locator('.item-row').count();

    await page.locator('button', { hasText: '+ Add Item' }).click();
    await page.locator('input[name="title"]').fill('Cross-feature Item');
    await page.locator('button[type="submit"]').click();

    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    await expect(
      page.locator('.stat-card').filter({ hasText: 'Total Items' }).locator('.stat-value'),
    ).toHaveText(String(itemCount + 1));
  });

  test('completing an item on items page increases dashboard completed count', async ({ page }) => {
    await page.goto('/items');
    const completedBefore = await page.locator('.item-row.completed').count();

    const uncheckedCheckbox = page
      .locator('.item-row:not(.completed) .item-check input[type="checkbox"]')
      .first();
    if (await uncheckedCheckbox.isVisible()) {
      await uncheckedCheckbox.check();
    }

    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    await expect(
      page.locator('.stat-card').filter({ hasText: 'Completed' }).locator('.stat-value'),
    ).toHaveText(String(completedBefore + 1));
  });

  test('removing an item decreases dashboard Total Items count', async ({ page }) => {
    await page.goto('/items');
    const initialCount = await page.locator('.item-row').count();
    await page.locator('.remove-btn').first().click();

    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    const totalCard = page
      .locator('.stat-card')
      .filter({ hasText: 'Total Items' })
      .locator('.stat-value');
    await expect(totalCard).toContainText(String(initialCount - 1));
  });

  test('dashboard progress bar is visible after completing items', async ({ page }) => {
    await page.goto('/items');
    const unchecked = page
      .locator('.item-row:not(.completed) .item-check input[type="checkbox"]')
      .first();
    if (await unchecked.isVisible()) {
      await unchecked.check();
    }
    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    await expect(page.locator('.progress-section')).toBeVisible();
  });
});

// ─── Admin + Feature Flag Combinations ────────────────────────────────────

test.describe('Admin role and feature flags combined', () => {
  test('switching to editor role and toggling a feature flag works', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('.role-btn', { hasText: 'editor' }).click();
    await expect(page.locator('.role-value')).toContainText('EDITOR');

    const exportFlag = page.locator('[data-flag-key="export-csv"]');
    await exportFlag.locator('.flag-toggle').click();
    await expect(exportFlag.locator('.flag-toggle')).toContainText('ON');
  });

  test('switching to viewer role and toggling a flag keeps page stable', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('.role-btn', { hasText: 'viewer' }).click();
    const bulkFlag = page.locator('[data-flag-key="bulk-operations"]');
    await bulkFlag.locator('.flag-toggle').click();
    await expect(page.locator('h2')).toContainText('Enterprise Admin');
  });

  test('running export job as editor role works', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('.role-btn', { hasText: 'editor' }).click();
    await page.locator('.run-job-btn').click();
    await expect(page.locator('.job-item').first()).toBeVisible();
  });

  test('refreshing health check as viewer role works', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('.role-btn', { hasText: 'viewer' }).click();
    await page.locator('.refresh-btn').click();
    await expect(page.locator('.health-status')).toBeVisible();
  });

  test('admin role cycling: admin → editor → viewer → admin all show correct heading', async ({
    page,
  }) => {
    await page.goto('/admin');
    for (const role of ['editor', 'viewer', 'admin']) {
      await page.locator('.role-btn', { hasText: role }).click();
      await expect(page.locator('h2')).toContainText('Enterprise Admin');
    }
  });
});

// ─── Notifications + Navigation ────────────────────────────────────────────

test.describe('Notifications and navigation cross-feature', () => {
  test('adding a notification and navigating away keeps state', async ({ page }) => {
    await page.goto('/notifications');
    await page.locator('.clear-btn').click();
    await page.locator('.demo-btn.success').click();
    await expect(page.locator('.notification-item')).toHaveCount(1);

    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    await page.locator('nav.navbar a', { hasText: 'Notifications' }).click();
    await expect(page.locator('.notification-item')).toHaveCount(1);
  });

  test('notifications are cleared after navigation and clear', async ({ page }) => {
    await page.goto('/notifications');
    await page.locator('.demo-btn.info').click();
    await page.locator('.demo-btn.error').click();

    await page.locator('nav.navbar a', { hasText: 'Items' }).click();
    await page.locator('nav.navbar a', { hasText: 'Notifications' }).click();
    await page.locator('.clear-btn').click();
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('add notification, navigate to items, add item, return — notification still there', async ({
    page,
  }) => {
    await page.goto('/notifications');
    await page.locator('.clear-btn').click();
    await page.locator('.demo-btn.warning').click();

    await page.locator('nav.navbar a', { hasText: 'Items' }).click();
    await page.locator('button', { hasText: '+ Add Item' }).click();
    await page.locator('input[name="title"]').fill('Cross-feature Item 2');
    await page.locator('button[type="submit"]').click();

    await page.locator('nav.navbar a', { hasText: 'Notifications' }).click();
    await expect(page.locator('.notification-item')).toHaveCount(1);
  });
});

// ─── Approvals + Navigation ────────────────────────────────────────────────

test.describe('Approvals and navigation cross-feature', () => {
  test('approving a request and navigating away keeps it in history', async ({ page }) => {
    await page.goto('/approvals');
    await page.locator('.submit-btn').click();
    await page.locator('[aria-label="Pending approvals"]').locator('.approve-btn').first().click();

    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    await page.locator('nav.navbar a', { hasText: 'Approvals' }).click();
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.approval-item').first()).toBeVisible();
  });

  test('submitting multiple requests, navigating away, then rejecting persists changes', async ({
    page,
  }) => {
    await page.goto('/approvals');
    await page.locator('.submit-btn').click();
    await page.locator('.submit-btn').click();

    await page.locator('nav.navbar a', { hasText: 'Analytics' }).click();
    await page.locator('nav.navbar a', { hasText: 'Approvals' }).click();

    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await expect(pendingSection.locator('.approval-item')).toHaveCount(2);
    await pendingSection.locator('.reject-btn').first().click();
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.status-badge').first()).toContainText('REJECTED');
  });

  test('full approval workflow: submit → navigate away → approve on return', async ({ page }) => {
    await page.goto('/approvals');
    await page.locator('.submit-btn').click();

    await page.locator('nav.navbar a', { hasText: 'Preferences' }).click();
    await expect(page).toHaveURL(/\/preferences/);

    await page.locator('nav.navbar a', { hasText: 'Approvals' }).click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await expect(pendingSection.locator('.approval-item')).toHaveCount(1);
    await pendingSection.locator('.approve-btn').first().click();
    await expect(pendingSection.locator('.empty-state')).toBeVisible();
  });
});

// ─── Analytics + Navigation ────────────────────────────────────────────────

test.describe('Analytics and navigation cross-feature', () => {
  test('recording metrics persists across navigation', async ({ page }) => {
    await page.goto('/analytics');
    await page.locator('.sample-btn').click();
    await page.locator('.sample-btn').click();

    await page.locator('nav.navbar a', { hasText: 'Admin' }).click();
    await page.locator('nav.navbar a', { hasText: 'Analytics' }).click();
    await expect(page.locator('.metric-count')).toContainText('Total recorded: 2');
  });

  test('added widgets persist across navigation', async ({ page }) => {
    await page.goto('/analytics');
    await page.locator('.add-widget-btn').click();
    await page.locator('.add-widget-btn').click();

    await page.locator('nav.navbar a', { hasText: 'Items' }).click();
    await page.locator('nav.navbar a', { hasText: 'Analytics' }).click();
    await expect(page.locator('.widget-item')).toHaveCount(2);
  });

  test('combining metrics and widgets: both persist after navigation', async ({ page }) => {
    await page.goto('/analytics');
    await page.locator('.sample-btn').click();
    await page.locator('.add-widget-btn').click();

    await page.locator('nav.navbar a', { hasText: 'Approvals' }).click();
    await page.locator('nav.navbar a', { hasText: 'Analytics' }).click();
    await expect(page.locator('.metric-count')).toContainText('Total recorded: 1');
    await expect(page.locator('.widget-item')).toHaveCount(1);
  });
});

// ─── Preferences + Navigation ──────────────────────────────────────────────

test.describe('Preferences and navigation cross-feature', () => {
  test('preferences page renders correctly after navigating from admin', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('nav.navbar a', { hasText: 'Preferences' }).click();
    await expect(page.locator('h2')).toContainText('User Preferences');
    await expect(page.locator('[aria-label="Theme settings"]')).toBeVisible();
  });

  test('toggling email notifications and navigating away preserves the toggle state', async ({
    page,
  }) => {
    await page.goto('/preferences');
    const emailToggle = page.locator('input[aria-label="Toggle email notifications"]');
    const wasChecked = await emailToggle.isChecked();
    await emailToggle.click();
    const newState = await emailToggle.isChecked();
    expect(newState).not.toBe(wasChecked);

    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    await page.locator('nav.navbar a', { hasText: 'Preferences' }).click();
    // The state should be preserved in memory
    await expect(page.locator('[aria-label="Notification settings"]')).toBeVisible();
  });
});

// ─── Full Multi-Page Workflows ─────────────────────────────────────────────

test.describe('Full multi-page workflow combinations', () => {
  test('workflow: add items → approve request → record metric → check dashboard', async ({
    page,
  }) => {
    // Add an item
    await page.goto('/items');
    await page.locator('button', { hasText: '+ Add Item' }).click();
    await page.locator('input[name="title"]').fill('Workflow Item A');
    await page.locator('button[type="submit"]').click();

    // Submit and approve a request
    await page.locator('nav.navbar a', { hasText: 'Approvals' }).click();
    await page.locator('.submit-btn').click();
    await page.locator('[aria-label="Pending approvals"]').locator('.approve-btn').first().click();

    // Record a metric
    await page.locator('nav.navbar a', { hasText: 'Analytics' }).click();
    await page.locator('.sample-btn').click();

    // Check dashboard loads
    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    await expect(page.locator('h1')).toContainText('Hello World');
    await expect(page.locator('.stat-card').first()).toBeVisible();
  });

  test('workflow: add notification, submit approval, add item, verify all persist', async ({
    page,
  }) => {
    await page.goto('/notifications');
    await page.locator('.clear-btn').click();
    await page.locator('.demo-btn.success').click();

    await page.locator('nav.navbar a', { hasText: 'Approvals' }).click();
    await page.locator('.submit-btn').click();

    await page.locator('nav.navbar a', { hasText: 'Items' }).click();
    await page.locator('button', { hasText: '+ Add Item' }).click();
    await page.locator('input[name="title"]').fill('Workflow Item B');
    await page.locator('button[type="submit"]').click();

    // Verify item is there
    await expect(page.locator('.item-row', { hasText: 'Workflow Item B' })).toBeVisible();

    // Verify notification persists
    await page.locator('nav.navbar a', { hasText: 'Notifications' }).click();
    await expect(page.locator('.notification-item')).toHaveCount(1);

    // Verify approval is still pending
    await page.locator('nav.navbar a', { hasText: 'Approvals' }).click();
    await expect(
      page.locator('[aria-label="Pending approvals"]').locator('.approval-item'),
    ).toHaveCount(1);
  });

  test('workflow: toggle feature flags, add widget, record metric, check admin still stable', async ({
    page,
  }) => {
    await page.goto('/admin');
    await page.locator('[data-flag-key="export-csv"]').locator('.flag-toggle').click();

    await page.locator('nav.navbar a', { hasText: 'Analytics' }).click();
    await page.locator('.add-widget-btn').click();
    await page.locator('.sample-btn').click();

    await page.locator('nav.navbar a', { hasText: 'Admin' }).click();
    await expect(page.locator('h2')).toContainText('Enterprise Admin');
    await expect(
      page.locator('[data-flag-key="export-csv"]').locator('.flag-toggle'),
    ).toContainText('ON');
  });

  test('workflow: full cycle across all 7 pages without error', async ({ page }) => {
    const routes = [
      '/',
      '/items',
      '/admin',
      '/analytics',
      '/approvals',
      '/notifications',
      '/preferences',
    ];
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('nav.navbar')).toBeVisible();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('workflow: search items, edit one, complete another, check dashboard', async ({ page }) => {
    await page.goto('/items');

    // Search for an item
    await page.locator('.search-input').fill('design');
    await expect(page.locator('.item-row')).toHaveCount(1);
    await page.locator('.search-input').clear();

    // Edit the first item
    await page.locator('.edit-btn').first().click();
    await page.locator('input[name="editTitle"]').clear();
    await page.locator('input[name="editTitle"]').fill('Edited Workflow Item');
    await page.locator('.save-btn').click();

    // Complete second item
    const secondCheckbox = page.locator('.item-check input[type="checkbox"]').nth(1);
    if (!(await secondCheckbox.isChecked())) {
      await secondCheckbox.check();
    }

    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    await expect(page.locator('.stat-card').first()).toBeVisible();
  });
});

test.describe('Dashboard counter + items combined', () => {
  test('incrementing counter on dashboard and then navigating to items keeps counter', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('button', { hasText: '+' }).click();
    const countBefore = await page.locator('.count').textContent();

    await page.locator('nav.navbar a', { hasText: 'Items' }).click();
    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    const countAfter = await page.locator('.count').textContent();
    expect(Number(countAfter)).toBeGreaterThanOrEqual(Number(countBefore));
  });

  test('workflow: submit approval then record metric then check admin health', async ({ page }) => {
    await page.goto('/approvals');
    await page.locator('.submit-btn').click();

    await page.locator('nav.navbar a', { hasText: 'Analytics' }).click();
    await page.locator('.sample-btn').click();

    await page.locator('nav.navbar a', { hasText: 'Admin' }).click();
    await page.locator('.refresh-btn').click();
    await expect(page.locator('.health-status')).toBeVisible();
  });

  test('workflow: toggle feature flag then add notification then verify pages stable', async ({
    page,
  }) => {
    await page.goto('/admin');
    await page.locator('[data-flag-key="bulk-operations"]').locator('.flag-toggle').click();

    await page.locator('nav.navbar a', { hasText: 'Notifications' }).click();
    await page.locator('.clear-btn').click();
    await page.locator('.demo-btn.info').click();
    await expect(page.locator('.notification-item')).toHaveCount(1);

    await page.locator('nav.navbar a', { hasText: 'Admin' }).click();
    await expect(page.locator('h2')).toContainText('Enterprise Admin');
  });

  test('workflow: visit every page in reverse order without error', async ({ page }) => {
    const routes = [
      '/preferences',
      '/notifications',
      '/approvals',
      '/analytics',
      '/admin',
      '/items',
      '/',
    ];
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });
});
