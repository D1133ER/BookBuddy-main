import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('can login with demo credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('maya@bookbuddy.local');
    await page.getByLabel(/password/i).fill('BookBuddy123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard|my-books/i, { timeout: 10000 });
  });

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/password/i).fill('wrongpass');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.locator('text=Invalid')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Catalog Flow', () => {
  test('catalog page loads and displays books', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.getByRole('heading', { name: /book catalog/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test('search filters work', async ({ page }) => {
    await page.goto('/catalog');
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('hobbit');
    await page.waitForTimeout(500);
    await expect(page.getByText(/the hobbit/i)).toBeVisible();
  });
});

test.describe('Navigation Flow', () => {
  test('mobile navigation works on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const nav = page.locator("nav[aria-label='Mobile navigation']");
    await expect(nav).toBeVisible();
  });

  test('command palette opens with keyboard shortcut', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Meta+K');
    await expect(page.getByPlaceholder(/search/i)).toBeVisible({
      timeout: 3000,
    });
  });
});
