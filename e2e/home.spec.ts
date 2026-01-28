import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect the page to load and check title
  // Using a regex to be flexible
  await expect(page).toHaveTitle(/Shortener|Onyx/i);
});
