import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/search/home.page';

const SEARCH_KEYWORD = 'headphones';
const BASE_URL = 'https://www.amazon.in';

test('Search on Amazon.in and validate product page details', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.navigate(BASE_URL);

  const searchResultsPage = await homePage.search(SEARCH_KEYWORD);
  await searchResultsPage.waitForResults();

  const productPage = await searchResultsPage.openFirstProduct(BASE_URL);

  await expect(productPage.elements.productTitle()).toBeVisible();
  await expect(productPage.elements.productTitle()).not.toBeEmpty();

  await expect(productPage.elements.priceBlock()).toBeVisible();

  await expect(productPage.elements.buyNowButton()).toBeVisible();
  await expect(productPage.elements.buyNowButton()).toBeEnabled();
});
