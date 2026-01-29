import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/XYNO/i);
});

test('should display daily quota indicator on share page after shortening', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder(/example\.com/i).first();
  await input.fill('https://example.com/test-' + Date.now());
  await page.getByRole('button', { name: /shorten/i }).first().click();

  // Wait for the redirect to happen
  await page.waitForURL(/\/share/, { timeout: 20000 });

  // Wait for the share content to be visible
  await expect(page.getByText(/Your Short Link/i)).toBeVisible({ timeout: 20000 });

  // Wait for the quota indicator to be rendered using Test ID
  const quotaIndicator = page.getByTestId('quota-indicator');
  await expect(quotaIndicator).toBeVisible({ timeout: 15000 });

  const quotaRemaining = page.getByTestId('quota-remaining');
  await expect(quotaRemaining).toBeVisible();
  const text = await quotaRemaining.innerText();
  expect(text).toMatch(/\d+\/\d+ REMAINING/);
});
