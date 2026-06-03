import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/home.page';

test('Validate product details on product page', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.navigate('https://www.amazon.in');
  const searchResultsPage = await homePage.search('headphones');
  await searchResultsPage.waitForResults();
  const productPage = await searchResultsPage.openFirstProduct('https://www.amazon.in');

  await expect(productPage.elements.productTitle()).toBeVisible();
  await expect(productPage.elements.productTitle()).not.toBeEmpty();
  await expect(productPage.elements.priceBlock()).toBeVisible();
  await expect(productPage.elements.buyNowButton()).toBeVisible();
  await expect(productPage.elements.buyNowButton()).toBeEnabled();
});
