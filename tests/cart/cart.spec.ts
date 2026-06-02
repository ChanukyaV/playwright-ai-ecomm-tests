import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/search/home.page';

const SEARCH_KEYWORD = 'headphones';
const BASE_URL = 'https://www.amazon.in';

test('Search on Amazon.in and add product to cart', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.navigate(BASE_URL);

  const searchResultsPage = await homePage.search(SEARCH_KEYWORD);
  await searchResultsPage.waitForResults();

  const productPage = await searchResultsPage.openFirstProduct(BASE_URL);

  const cartPage = await productPage.addToCart();

  await expect(cartPage.currentPage).toHaveURL(/amazon\.in\/cart|amazon\.in\/gp\/cart/);
  await expect(cartPage.currentPage).toHaveTitle(/Shopping Cart/);
});
