import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/search/home.page';

const SEARCH_KEYWORD = 'iPhone';
const BASE_URL = 'https://www.amazon.com';

test('Search on Amazon and verify results', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.navigate(BASE_URL);

  const searchResultsPage = await homePage.search(SEARCH_KEYWORD);

  await searchResultsPage.waitForResults();

  await expect(page.locator('.s-main-slot')).toContainText(SEARCH_KEYWORD);
});
