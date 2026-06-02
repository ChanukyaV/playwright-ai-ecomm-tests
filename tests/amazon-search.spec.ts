import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

test('Search for iPhone on Amazon and verify results', async ({ page }) => {
  const homePage = new HomePage(page);

  // Navigate to Amazon
  await homePage.navigate('https://www.amazon.com');

  // Search for "iPhone"
  const searchResultsPage = await homePage.search('Iphone');

  // Wait for search results to load
  await searchResultsPage.waitForResults();

  // Verify results contain "iPhone" using the main search results container
  await expect(page.locator('.s-main-slot')).toContainText('iPhone');
});