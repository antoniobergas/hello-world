import { test, expect } from '@playwright/test';

test.describe('Multi-step user journeys', () => {
  test('create item, view it in list, then complete it', async ({ page }) => {
    await page.goto('/items');

    // Create a new item
    await page.locator('button', { hasText: '+ Add Item' }).click();
    await page.locator('input[name="title"]').fill('Workflow Test Item');
    await page.locator('input[name="description"]').fill('Created during workflow test');
    await page.locator('button[type="submit"]').click();

    // Verify item appears in list
    const newItem = page.locator('.item-row', { hasText: 'Workflow Test Item' });
    await expect(newItem).toBeVisible();

    // Complete the item via its checkbox
    await newItem.locator('.item-check input[type="checkbox"]').check();
    await expect(newItem).toHaveClass(/completed/);
  });

  test('navigate through all main sections: dashboard -> items -> admin -> analytics -> approvals', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Hello World');

    await page.locator('a', { hasText: 'Items' }).first().click();
    await expect(page).toHaveURL(/\/items/);
    await expect(page.locator('h2')).toContainText('Items');

    await page.locator('a', { hasText: 'Admin' }).first().click();
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('h2')).toContainText('Enterprise Admin');

    await page.locator('a', { hasText: 'Analytics' }).first().click();
    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.locator('h2')).toContainText('Analytics Dashboard');

    await page.locator('a', { hasText: 'Approvals' }).first().click();
    await expect(page).toHaveURL(/\/approvals/);
    await expect(page.locator('h2')).toContainText('Approval Workflow');
  });

  test('navigating to different pages does not break the navbar', async ({ page }) => {
    const pages = [
      { link: 'Items', url: /\/items/ },
      { link: 'Admin', url: /\/admin/ },
      { link: 'Notifications', url: /\/notifications/ },
      { link: 'Preferences', url: /\/preferences/ },
    ];

    await page.goto('/');
    for (const { link, url } of pages) {
      await page.locator('a', { hasText: link }).first().click();
      await expect(page).toHaveURL(url);
      // Navbar should remain present on each page
      await expect(page.locator('nav.navbar')).toBeVisible();
    }
  });

  test('items added on items page are visible after navigating away and back', async ({ page }) => {
    await page.goto('/items');
    await page.locator('button', { hasText: '+ Add Item' }).click();
    await page.locator('input[name="title"]').fill('Persistent Item');
    await page.locator('input[name="description"]').fill('Should survive navigation');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.item-row', { hasText: 'Persistent Item' })).toBeVisible();

    // Navigate away and come back
    await page.locator('a', { hasText: 'Dashboard' }).first().click();
    await expect(page).toHaveURL('/');
    await page.locator('a', { hasText: 'Items' }).first().click();
    await expect(page).toHaveURL(/\/items/);
    await expect(page.locator('.item-row', { hasText: 'Persistent Item' })).toBeVisible();
  });

  test('submit approval request, approve it, then verify history from navigation', async ({ page }) => {
    await page.goto('/approvals');
    await page.locator('.submit-btn').click();
    const pendingSection = page.locator('[aria-label="Pending approvals"]');
    await pendingSection.locator('.approve-btn').first().click();

    // Navigate away and come back to verify history persists
    await page.locator('a', { hasText: 'Dashboard' }).first().click();
    await page.locator('a', { hasText: 'Approvals' }).first().click();
    const historySection = page.locator('[aria-label="Approval history"]');
    await expect(historySection.locator('.approval-item').first()).toBeVisible();
  });

  test('recording analytics metrics persists after navigating away and back', async ({ page }) => {
    await page.goto('/analytics');
    await page.locator('.sample-btn').click();
    await page.locator('.sample-btn').click();
    await expect(page.locator('.metric-count')).toContainText('Total recorded: 2');

    await page.locator('a', { hasText: 'Dashboard' }).first().click();
    await page.locator('a', { hasText: 'Analytics' }).first().click();
    await expect(page.locator('.metric-count')).toContainText('Total recorded: 2');
  });

  test('full workflow: add notification, check preferences, view items, go back to dashboard', async ({ page }) => {
    // Add a notification
    await page.goto('/notifications');
    await page.locator('.demo-btn.info').click();
    await expect(page.locator('.notification-item').first()).toBeVisible();

    // Check preferences page loads correctly
    await page.locator('a', { hasText: 'Preferences' }).first().click();
    await expect(page).toHaveURL(/\/preferences/);
    await expect(page.locator('h2')).toContainText('User Preferences');

    // Navigate to items
    await page.locator('a', { hasText: 'Items' }).first().click();
    await expect(page).toHaveURL(/\/items/);
    await expect(page.locator('.item-row')).toHaveCount(4);

    // Return to dashboard
    await page.locator('a', { hasText: 'Dashboard' }).first().click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Hello World');
  });
});
