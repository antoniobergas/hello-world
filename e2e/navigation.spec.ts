import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', heading: 'Hello World' },
  { path: '/items', heading: 'Items' },
  { path: '/admin', heading: 'Enterprise Admin' },
  { path: '/analytics', heading: 'Analytics Dashboard' },
  { path: '/approvals', heading: 'Approval Workflow' },
  { path: '/notifications', heading: 'Notifications' },
  { path: '/preferences', heading: 'User Preferences' },
];

test.describe('Direct URL navigation', () => {
  for (const { path, heading } of pages) {
    test(`navigating directly to ${path} shows correct heading`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1, h2').first()).toContainText(heading);
    });
  }
});

test.describe('Navbar presence on all pages', () => {
  for (const { path } of pages) {
    test(`navbar is visible on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('nav.navbar')).toBeVisible();
    });
  }
});

test.describe('Navbar links', () => {
  test('navbar has a Dashboard link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav.navbar a', { hasText: 'Dashboard' })).toBeVisible();
  });

  test('navbar has an Items link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav.navbar a', { hasText: 'Items' })).toBeVisible();
  });

  test('navbar has an Admin link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav.navbar a', { hasText: 'Admin' })).toBeVisible();
  });

  test('navbar has an Analytics link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav.navbar a', { hasText: 'Analytics' })).toBeVisible();
  });

  test('navbar has an Approvals link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav.navbar a', { hasText: 'Approvals' })).toBeVisible();
  });

  test('navbar has a Notifications link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav.navbar a', { hasText: 'Notifications' })).toBeVisible();
  });

  test('navbar has a Preferences link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav.navbar a', { hasText: 'Preferences' })).toBeVisible();
  });

  test('clicking Dashboard link navigates to /', async ({ page }) => {
    await page.goto('/items');
    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    await expect(page).toHaveURL('/');
  });

  test('clicking Items link navigates to /items', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav.navbar a', { hasText: 'Items' }).click();
    await expect(page).toHaveURL(/\/items/);
  });

  test('clicking Admin link navigates to /admin', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav.navbar a', { hasText: 'Admin' }).click();
    await expect(page).toHaveURL(/\/admin/);
  });

  test('clicking Analytics link navigates to /analytics', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav.navbar a', { hasText: 'Analytics' }).click();
    await expect(page).toHaveURL(/\/analytics/);
  });

  test('clicking Approvals link navigates to /approvals', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav.navbar a', { hasText: 'Approvals' }).click();
    await expect(page).toHaveURL(/\/approvals/);
  });

  test('clicking Notifications link navigates to /notifications', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav.navbar a', { hasText: 'Notifications' }).click();
    await expect(page).toHaveURL(/\/notifications/);
  });

  test('clicking Preferences link navigates to /preferences', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav.navbar a', { hasText: 'Preferences' }).click();
    await expect(page).toHaveURL(/\/preferences/);
  });
});

test.describe('Back navigation via navbar', () => {
  test('can navigate admin → items → dashboard without errors', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('nav.navbar a', { hasText: 'Items' }).click();
    await expect(page).toHaveURL(/\/items/);
    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Hello World');
  });

  test('can navigate analytics → approvals → notifications without errors', async ({ page }) => {
    await page.goto('/analytics');
    await page.locator('nav.navbar a', { hasText: 'Approvals' }).click();
    await expect(page).toHaveURL(/\/approvals/);
    await page.locator('nav.navbar a', { hasText: 'Notifications' }).click();
    await expect(page).toHaveURL(/\/notifications/);
    await expect(page.locator('h2')).toContainText('Notifications');
  });

  test('dashboard Manage Items button navigates to /items', async ({ page }) => {
    await page.goto('/');
    await page.locator('a', { hasText: 'Manage Items' }).click();
    await expect(page).toHaveURL(/\/items/);
  });
});
