import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

test('Search for headphones on Amazon.in and validate product page details', async ({ page }) => {
  const homePage = new HomePage(page);

  // 1. Navigate to Amazon.in
  await homePage.navigate('https://www.amazon.in');

  // 2. Search for headphones
  const searchResultsPage = await homePage.search('headphones');

  // 3. Wait for search results to load
  await searchResultsPage.waitForResults();

  // 4. Open the first product from search results
  const productPage = await searchResultsPage.openFirstProduct('https://www.amazon.in');

  // 5. Validate product title is visible
  await expect(productPage.elements.productTitle()).toBeVisible();
  await expect(productPage.elements.productTitle()).not.toBeEmpty();

  // 6. Validate product price is displayed
  await expect(productPage.elements.priceBlock()).toBeVisible();

  // 7. Validate Buy Now button is present
  await expect(productPage.elements.buyNowButton()).toBeVisible();
  await expect(productPage.elements.buyNowButton()).toBeEnabled();
});