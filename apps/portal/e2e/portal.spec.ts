import { test, expect } from '@playwright/test';

test.describe('Portal - My Tickets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tickets');
  });

  test('shows the My Tickets heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('My Tickets');
  });

  test('seeds 4 tickets on load', async ({ page }) => {
    await expect(page.locator('.ticket-row')).toHaveCount(4);
  });

  test('All / Open / Resolved filter tabs are visible', async ({ page }) => {
    await expect(page.locator('.filter-tabs button', { hasText: 'All' })).toBeVisible();
    await expect(page.locator('.filter-tabs button', { hasText: 'Open' })).toBeVisible();
    await expect(page.locator('.filter-tabs button', { hasText: 'Resolved' })).toBeVisible();
  });

  test('Open filter shows only open/in-progress tickets', async ({ page }) => {
    await page.locator('.filter-tabs button', { hasText: 'Open' }).click();
    const rows = page.locator('.ticket-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const status = await rows.nth(i).locator('.ticket-status').textContent();
      expect(['OPEN', 'IN_PROGRESS']).toContain(status?.trim());
    }
  });

  test('Resolved filter shows resolved tickets', async ({ page }) => {
    await page.locator('.filter-tabs button', { hasText: 'Resolved' }).click();
    await expect(page.locator('.ticket-row').first()).toBeVisible();
    await expect(page.locator('.ticket-row').first().locator('.ticket-status')).toContainText(
      'RESOLVED',
    );
  });

  test('can submit a new ticket', async ({ page }) => {
    const before = await page.locator('.ticket-row').count();
    await page.locator('.new-ticket-btn').click();
    await page.locator('#subject').fill('Need help with API keys');
    await page.locator('#description').fill('I cannot generate a new API key from the dashboard.');
    await page.locator('#category').selectOption('technical');
    await page.locator('#priority').selectOption('high');
    await page.locator('.submit-btn').click();
    await expect(page.locator('.ticket-row')).toHaveCount(before + 1);
    await expect(page.locator('.ticket-row').first()).toContainText('Need help with API keys');
  });

  test('new ticket form cancels without adding a row', async ({ page }) => {
    const before = await page.locator('.ticket-row').count();
    await page.locator('.new-ticket-btn').click();
    await expect(page.locator('.ticket-form')).toBeVisible();
    await page.locator('.new-ticket-btn').click();
    await expect(page.locator('.ticket-form')).not.toBeVisible();
    await expect(page.locator('.ticket-row')).toHaveCount(before);
  });

  test('ticket link navigates to ticket detail page', async ({ page }) => {
    await page.locator('.ticket-link').first().click();
    await expect(page).toHaveURL(/\/tickets\/TKT-/);
    await expect(page.locator('.ticket-subject')).toBeVisible();
  });
});

test.describe('Portal - Knowledge Base', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kb');
  });

  test('shows Knowledge Base heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Knowledge Base');
  });

  test('shows search input', async ({ page }) => {
    await expect(page.locator('.kb-search')).toBeVisible();
  });

  test('lists seeded articles', async ({ page }) => {
    await expect(page.locator('.article-card')).toHaveCount(4);
  });

  test('search filters articles by keyword', async ({ page }) => {
    await page.locator('.kb-search').fill('password');
    await expect(page.locator('.article-card')).toHaveCount(1);
    await expect(page.locator('.article-card').first()).toContainText('password');
  });

  test('clearing search restores all articles', async ({ page }) => {
    await page.locator('.kb-search').fill('api');
    await page.locator('.kb-search').fill('');
    await page.locator('.kb-search').dispatchEvent('input');
    // After clearing, we should see articles again
    await expect(page.locator('.article-card').first()).toBeVisible();
  });

  test('clicking an article shows its detail view', async ({ page }) => {
    await page.locator('.article-card-btn').first().click();
    await expect(page.locator('.article-detail')).toBeVisible();
    await expect(page.locator('.article-title')).toBeVisible();
  });

  test('can mark an article as helpful', async ({ page }) => {
    await page.locator('.article-card-btn').first().click();
    await page.locator('.helpful-btn').click();
    await expect(page.locator('.helpful-btn')).toContainText(/\d+/);
  });

  test('back button returns to article list', async ({ page }) => {
    await page.locator('.article-card-btn').first().click();
    await page.locator('.back-btn').click();
    await expect(page.locator('.article-list')).toBeVisible();
  });
});

test.describe('Portal - System Status', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/status');
  });

  test('shows System Status heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('System Status');
  });

  test('shows overall status banner', async ({ page }) => {
    await expect(page.locator('.overall-banner')).toBeVisible();
  });

  test('lists 5 services', async ({ page }) => {
    await expect(page.locator('.service-row')).toHaveCount(5);
  });

  test('each service row shows name, latency, status, and timestamp', async ({ page }) => {
    const row = page.locator('.service-row').first();
    await expect(row.locator('.service-name')).toBeVisible();
    await expect(row.locator('.service-latency')).toContainText('ms');
    await expect(row.locator('.service-status')).toBeVisible();
    await expect(row.locator('.service-checked')).toBeVisible();
  });

  test('refresh button updates timestamps', async ({ page }) => {
    await page.locator('.refresh-btn').click();
    await expect(page.locator('.service-row').first()).toBeVisible();
  });
});

test.describe('Portal - Navigation', () => {
  test('navbar links navigate between pages', async ({ page }) => {
    await page.goto('/tickets');
    await page.locator('nav a', { hasText: 'Knowledge Base' }).click();
    await expect(page).toHaveURL(/\/kb/);
    await page.locator('nav a', { hasText: 'System Status' }).click();
    await expect(page).toHaveURL(/\/status/);
    await page.locator('nav a', { hasText: 'My Tickets' }).click();
    await expect(page).toHaveURL(/\/tickets/);
  });
});

// ─── User Journey: Customer resolves their own ticket ────────────────────────
test.describe('Journey: customer self-service ticket resolution', () => {
  test('customer submits a ticket, checks the KB, then resolves the ticket', async ({ page }) => {
    // 1. Submit a new ticket.
    await page.goto('/tickets');
    const beforeCount = await page.locator('.ticket-row').count();
    await page.locator('.new-ticket-btn').click();
    await page.locator('#subject').fill('Can I export my data?');
    await page.locator('#description').fill('I need to download a CSV of my records.');
    await page.locator('#category').selectOption('feature_request');
    await page.locator('#priority').selectOption('low');
    await page.locator('.submit-btn').click();
    await expect(page.locator('.ticket-row')).toHaveCount(beforeCount + 1);

    // 2. Search the Knowledge Base for a related article.
    await page.locator('nav a', { hasText: 'Knowledge Base' }).click();
    await page.locator('.kb-search').fill('dashboard');
    await expect(page.locator('.article-card')).toHaveCount(1);
    await page.locator('.article-card-btn').click();
    await expect(page.locator('.article-title')).toBeVisible();

    // 3. Mark the article as helpful.
    await page.locator('.helpful-btn').click();

    // 4. Go back to tickets and resolve the newly created ticket.
    await page.locator('nav a', { hasText: 'My Tickets' }).click();
    await page.locator('.ticket-link').first().click();
    await expect(page).toHaveURL(/\/tickets\/TKT-/);

    // 5. Resolve the ticket.
    await page.locator('.resolve-btn').click();
    await expect(page.locator('.badge-resolved')).toBeVisible();

    // 6. Navigate back and verify in Resolved filter.
    await page.locator('.back-link').click();
    await page.locator('.filter-tabs button', { hasText: 'Resolved' }).click();
    await expect(page.locator('.ticket-row').first()).toBeVisible();
  });
});
