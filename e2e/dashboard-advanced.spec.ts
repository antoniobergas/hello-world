import { test, expect } from '@playwright/test';

test.describe('Dashboard stats cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Total Items stat card is visible', async ({ page }) => {
    await expect(page.locator('.stat-card').filter({ hasText: 'Total Items' })).toBeVisible();
  });

  test('Completed stat card is visible', async ({ page }) => {
    await expect(page.locator('.stat-card').filter({ hasText: 'Completed' })).toBeVisible();
  });

  test('Pending stat card is visible', async ({ page }) => {
    await expect(page.locator('.stat-card').filter({ hasText: 'Pending' })).toBeVisible();
  });

  test('Overdue stat card is visible', async ({ page }) => {
    await expect(page.locator('.stat-card').filter({ hasText: 'Overdue' })).toBeVisible();
  });

  test('Counter stat card is visible', async ({ page }) => {
    await expect(page.locator('.stat-card').filter({ hasText: 'Counter' })).toBeVisible();
  });

  test('Total Items stat value is a non-negative number', async ({ page }) => {
    const value = await page
      .locator('.stat-card')
      .filter({ hasText: 'Total Items' })
      .locator('.stat-value')
      .textContent();
    expect(Number(value?.trim())).toBeGreaterThanOrEqual(0);
  });

  test('Completed stat value is a non-negative number', async ({ page }) => {
    const value = await page
      .locator('.stat-card')
      .filter({ hasText: 'Completed' })
      .locator('.stat-value')
      .textContent();
    expect(Number(value?.trim())).toBeGreaterThanOrEqual(0);
  });

  test('Pending stat value is a non-negative number', async ({ page }) => {
    const value = await page
      .locator('.stat-card')
      .filter({ hasText: 'Pending' })
      .locator('.stat-value')
      .textContent();
    expect(Number(value?.trim())).toBeGreaterThanOrEqual(0);
  });

  test('five stat cards are visible', async ({ page }) => {
    await expect(page.locator('.stat-card')).toHaveCount(5);
  });
});

test.describe('Dashboard counter widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('counter increment button is visible', async ({ page }) => {
    await expect(page.locator('button', { hasText: '+' })).toBeVisible();
  });

  test('counter decrement button is visible', async ({ page }) => {
    await expect(page.locator('button', { hasText: '-' })).toBeVisible();
  });

  test('clicking + increments counter display', async ({ page }) => {
    const before = await page.locator('.count').textContent();
    await page.locator('button', { hasText: '+' }).click();
    const after = await page.locator('.count').textContent();
    expect(Number(after)).toBeGreaterThan(Number(before));
  });

  test('clicking - decrements counter display', async ({ page }) => {
    // First increment so we can safely decrement
    await page.locator('button', { hasText: '+' }).click();
    const before = await page.locator('.count').textContent();
    await page.locator('button', { hasText: '-' }).click();
    const after = await page.locator('.count').textContent();
    expect(Number(after)).toBeLessThan(Number(before));
  });

  test('clicking + multiple times increments the counter', async ({ page }) => {
    const before = Number((await page.locator('.count').textContent()) ?? '0');
    for (let i = 0; i < 3; i++) {
      await page.locator('button', { hasText: '+' }).click();
    }
    const after = await page.locator('.count').textContent();
    expect(Number(after)).toBe(before + 3);
  });

  test('counter stat card reflects click count', async ({ page }) => {
    const before = Number(
      await page
        .locator('.stat-card')
        .filter({ hasText: 'Counter' })
        .locator('.stat-value')
        .textContent(),
    );
    await page.locator('button', { hasText: '+' }).click();
    const after = Number(
      await page
        .locator('.stat-card')
        .filter({ hasText: 'Counter' })
        .locator('.stat-value')
        .textContent(),
    );
    expect(after).toBeGreaterThan(before);
  });
});

test.describe('Dashboard greeting and structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('greeting message is visible', async ({ page }) => {
    await expect(page.locator('app-greeting')).toBeVisible();
  });

  test('progress bar section is visible', async ({ page }) => {
    await expect(page.locator('.progress-section')).toBeVisible();
  });

  test('Manage Items button is visible', async ({ page }) => {
    await expect(page.locator('a', { hasText: 'Manage Items' })).toBeVisible();
  });

  test('counter widget section is visible on dashboard', async ({ page }) => {
    await expect(page.locator('app-counter')).toBeVisible();
  });
});

test.describe('Dashboard - Manage Items navigation', () => {
  test('Manage Items button navigates to items page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a', { hasText: 'Manage Items' }).click();
    await expect(page).toHaveURL(/\/items/);
  });

  test('dashboard heading includes AppBench Dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('AppBench Dashboard');
  });

  test('incrementing counter multiple times and navigating away persists count', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('button', { hasText: '+' }).click();
    await page.locator('button', { hasText: '+' }).click();
    const before = await page.locator('.count').textContent();

    await page.locator('nav.navbar a', { hasText: 'Items' }).click();
    await page.locator('nav.navbar a', { hasText: 'Dashboard' }).click();
    const after = await page.locator('.count').textContent();
    expect(Number(after)).toBeGreaterThanOrEqual(Number(before));
  });

  test('Overdue stat value is a non-negative number', async ({ page }) => {
    await page.goto('/');
    const value = await page
      .locator('.stat-card')
      .filter({ hasText: 'Overdue' })
      .locator('.stat-value')
      .textContent();
    expect(Number(value?.trim())).toBeGreaterThanOrEqual(0);
  });

  test('counter decrement does not go below minimum display value', async ({ page }) => {
    await page.goto('/');
    // Clicking decrement from 0 should not crash the page
    const currentCount = Number((await page.locator('.count').textContent()) ?? '0');
    if (currentCount === 0) {
      await page.locator('button', { hasText: '-' }).click();
      // Page should still be stable
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('progress section label text is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.progress-section')).toContainText('Completion');
  });

  test('stats and counter widget coexist on the same page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.stats')).toBeVisible();
    await expect(page.locator('app-counter')).toBeVisible();
  });

  test('quick actions section is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.quick-actions')).toBeVisible();
  });
});
