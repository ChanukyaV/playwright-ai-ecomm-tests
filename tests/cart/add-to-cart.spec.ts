import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/home.page';

test('Add product to cart', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.navigate('https://www.amazon.in');
  const searchResultsPage = await homePage.search('headphones');
  await searchResultsPage.waitForResults();
  const productPage = await searchResultsPage.openFirstProduct('https://www.amazon.in');

  const cartPage = await productPage.addToCart();

  await expect(cartPage.currentPage).toHaveURL(/amazon\.in\/cart|amazon\.in\/gp\/cart/);
  await expect(cartPage.currentPage).toHaveTitle(/Shopping Cart/);
});
