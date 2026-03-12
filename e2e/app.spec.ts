import { test, expect } from '@playwright/test';

test('has heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Hello World');
});

test('counter increments on click', async ({ page }) => {
  await page.goto('/');
  const incrementButton = page.locator('button', { hasText: '+' });
  await incrementButton.click();
  await expect(page.locator('.count')).toContainText('1');
});
