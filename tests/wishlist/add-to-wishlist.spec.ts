import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/home.page';

test('Add product to wishlist', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.navigate('https://www.amazon.in');
  const searchResultsPage = await homePage.search('headphones');
  await searchResultsPage.waitForResults();
  const productPage = await searchResultsPage.openFirstProduct('https://www.amazon.in');

  const wishlistPage = await productPage.addToWishlist();

  await expect(wishlistPage.currentPage).toHaveURL(/amazon\.in\/hz\/wishlist|amazon\.in\/gp\/registry/);
  await expect(wishlistPage.currentPage).toHaveTitle(/Wish List|Your Lists/);
});
