import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/search/home.page';

const SEARCH_KEYWORD = 'headphones';
const BASE_URL = 'https://www.amazon.in';

test('Search on Amazon.in and add product to wishlist', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.navigate(BASE_URL);

  const searchResultsPage = await homePage.search(SEARCH_KEYWORD);
  await searchResultsPage.waitForResults();

  const productPage = await searchResultsPage.openFirstProduct(BASE_URL);

  const productTitle = await productPage.elements.productTitle().innerText();

  const wishlistPage = await productPage.addToWishlist();

  await expect(wishlistPage.currentPage).toHaveURL(/amazon\.in/);
  await expect(wishlistPage.currentPage.getByText(productTitle.trim().substring(0, 30))).toBeVisible();
});
