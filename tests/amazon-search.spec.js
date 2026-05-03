import { test, expect } from '@playwright/test';

test('Search for iPhone on Amazon and verify results', async ({ page }) => {
  // Open Amazon
  await page.goto('https://www.amazon.com');

  // Search for "Iphone"
  await page.fill('#twotabsearchtextbox', 'Iphone');
  await page.click('#nav-search-submit-button');

  // Verify results contain "Iphone" using the main search results container
  await expect(page.locator('.s-main-slot')).toContainText('iPhone');
});
