import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/home.page';

test('Search for products and verify results', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.navigate('https://www.amazon.com');
  const searchResultsPage = await homePage.search('Iphone');
  await searchResultsPage.waitForResults();

  await expect(page.locator('.s-main-slot')).toContainText('iPhone');
});
