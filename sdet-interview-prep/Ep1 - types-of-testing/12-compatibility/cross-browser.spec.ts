import { expect, test } from '@playwright/test';
import { resetCart } from '../support/cart';

/*
 * COMPATIBILITY TESTING - same app, different browsers / devices / screen sizes.
 * Nothing special in the tests: playwright.config.ts runs this folder on 4 projects:
 *   compat-chrome, compat-firefox, compat-webkit (Safari engine), compat-mobile (Pixel 7).
 *
 *   npx playwright test -c "sdet-interview-prep/Ep1 - types-of-testing" 12-compatibility
 *   npx playwright test -c "sdet-interview-prep/Ep1 - types-of-testing" 12-compatibility --project=compat-firefox
 * Missing a browser?  npx playwright install firefox webkit
 */

test.beforeEach(({ request }) => resetCart(request));
test.afterEach(({ request }) => resetCart(request));

test('products page renders all products', async ({ page }) => {
  await page.goto('/products');

  await expect(page.getByTestId('product-card')).toHaveCount(8);
});

test('layout fits the screen (no sideways scrolling)', async ({ page }) => {
  await page.goto('/products');
  await expect(page.getByTestId('product-card').first()).toBeVisible();

  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

  expect(overflows).toBe(false);
});

test('core flow works: search, add to cart, see it in the cart', async ({ page }) => {
  await page.goto('/products');
  await page.getByTestId('product-search-input').fill('lamp');
  await page.getByTestId('add-to-cart-btn').click();
  await expect(page.getByTestId('go-to-cart-btn')).toBeVisible();

  await page.getByTestId('nav-link-cart').click();

  await expect(page.getByTestId('cart-item-name')).toHaveText('LED Desk Lamp');
  await expect(page.getByTestId('cart-total')).toHaveText('$39.99');
});
