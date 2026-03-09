import { test, expect } from '@playwright/test';

test.describe('Dashboard stats and progress', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows five stat cards', async ({ page }) => {
    await expect(page.locator('.stat-card')).toHaveCount(5);
  });

  test('shows the progress bar', async ({ page }) => {
    await expect(page.locator('.progress-track')).toBeVisible();
  });

  test('shows the progress bar label with percentage', async ({ page }) => {
    await expect(page.locator('.progress-label')).toBeVisible();
    await expect(page.locator('.progress-pct')).toContainText('%');
  });

  test('Overdue stat card is present', async ({ page }) => {
    const statTitles = await page.locator('.stat-card h3').allTextContents();
    const lower = statTitles.map((t) => t.toLowerCase());
    expect(lower.some((t) => t.includes('overdue'))).toBe(true);
  });

  test('Total Items shows 4 initially', async ({ page }) => {
    const cards = page.locator('.stat-card');
    const totalCard = cards.filter({ hasText: 'Total Items' });
    await expect(totalCard.locator('.stat-value')).toContainText('4');
  });

  test('Completed shows 1 initially', async ({ page }) => {
    const cards = page.locator('.stat-card');
    const completedCard = cards.filter({ hasText: 'Completed' });
    await expect(completedCard.locator('.stat-value')).toContainText('1');
  });

  test('Pending shows 3 initially', async ({ page }) => {
    const cards = page.locator('.stat-card');
    const pendingCard = cards.filter({ hasText: 'Pending' });
    await expect(pendingCard.locator('.stat-value')).toContainText('3');
  });

  test('progress bar fill width reflects completion rate', async ({ page }) => {
    const fill = page.locator('.progress-fill');
    const style = await fill.getAttribute('style');
    // 1/4 = 25%
    expect(style).toContain('25%');
  });
});

test.describe('Dashboard counter interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Counter stat card updates after incrementing', async ({ page }) => {
    const counterCard = page.locator('.stat-card').filter({ hasText: 'Counter' });
    await expect(counterCard.locator('.stat-value')).toContainText('0');
    await page.locator('button', { hasText: '+' }).click();
    await expect(counterCard.locator('.stat-value')).toContainText('1');
  });

  test('Counter stat card updates after decrementing', async ({ page }) => {
    await page.locator('button', { hasText: '+' }).click();
    await page.locator('button', { hasText: '-' }).click();
    const counterCard = page.locator('.stat-card').filter({ hasText: 'Counter' });
    await expect(counterCard.locator('.stat-value')).toContainText('0');
  });
});
