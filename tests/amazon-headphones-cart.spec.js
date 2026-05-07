import { test, expect } from '@playwright/test';

test('Search for headphones on Amazon.in and add to cart', async ({ page }) => {
  // 1. Open Amazon.in
  await page.goto('https://www.amazon.in');

  // 2. Search for headphones
  await page.fill('#twotabsearchtextbox', 'headphones');
  await page.click('#nav-search-submit-button');

  // 3. Wait for search results to load
  await page.waitForSelector('[data-component-type="s-search-result"]');

  // 4. Open the first product from search results
  // Retrieve the href and navigate directly to avoid potential new-tab issues
  const firstProductLink = page
    .locator('[data-component-type="s-search-result"] h2 a')
    .first();
  const productHref = await firstProductLink.getAttribute('href');
  await page.goto(`https://www.amazon.in${productHref}`);

  // 5. Add the product to cart
  await page.waitForSelector('#add-to-cart-button', { state: 'visible' });
  await page.click('#add-to-cart-button');

  // 6. Verify the product was added to cart successfully
  // Amazon redirects to the cart page (smart-wagon or gp/cart) after adding an item
  await expect(page).toHaveURL(/amazon\.in\/cart|amazon\.in\/gp\/cart/);
  await expect(page).toHaveTitle(/Shopping Cart/);
});
