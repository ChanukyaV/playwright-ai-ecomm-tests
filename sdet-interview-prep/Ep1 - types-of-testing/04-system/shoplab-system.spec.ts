import { expect, test } from '@playwright/test';
import { HomePage } from '../../../pages/home.page';
import { CartPage } from '../../../pages/cart.page';
import { resetCart } from '../support/cart';

/*
 * SYSTEM TESTING - the whole application, assembled, tested as one product
 * (UI + API + data) in a test environment. We check each feature area through the browser.
 * Compare with E2E (next folder): system tests check features; E2E checks a complete user journey.
 */

test.beforeEach(({ request }) => resetCart(request));
test.afterEach(({ request }) => resetCart(request));

test.describe('Product listing & search', () => {
  test('lists all 8 products', async ({ page }) => {
    await page.goto('/products');

    await expect(page.getByTestId('product-count')).toHaveText('8 products available');
    await expect(page.getByTestId('product-card')).toHaveCount(8);
  });

  test('search narrows the list', async ({ page }) => {
    await page.goto('/products');
    await page.getByTestId('product-search-input').fill('keyboard');

    await expect(page.getByTestId('product-card')).toHaveCount(1);
    await expect(page.getByTestId('search-result-count')).toHaveText(/1 result/);
  });

  test('search with no match shows a friendly message', async ({ page }) => {
    await page.goto('/products');
    await page.getByTestId('product-search-input').fill('zzzz');

    await expect(page.getByTestId('no-search-results')).toBeVisible();
  });
});

test.describe('Product details', () => {
  test('shows name, price and stock', async ({ page }) => {
    await page.goto('/products/p1');

    await expect(page.getByTestId('product-detail-name')).toHaveText('Wireless Bluetooth Headphones');
    await expect(page.getByTestId('product-detail-price')).toHaveText('$79.99');
    await expect(page.getByTestId('product-detail-stock')).toContainText('In Stock');
  });

  test('unknown product shows the 404 page', async ({ page }) => {
    const res = await page.goto('/products/nope');

    expect(res?.status()).toBe(404);
  });
});

test.describe('Cart', () => {
  test('empty cart message', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.navigate();

    await expect(cart.emptyCartMessage).toBeVisible();
  });

  test('quantity buttons update subtotal and total', async ({ page, request }) => {
    await request.post('/api/cart', { data: { productId: 'p5', quantity: 1 } }); // Desk Lamp 39.99
    const cart = new CartPage(page);
    await cart.navigate();
    const item = await cart.getCartItemByIndex(0);

    await item.increaseButton.click();

    await expect(item.quantity).toHaveText('2');
    await expect(item.subtotal).toHaveText('$79.98');
  });
});

test('home page object still works (POM reuse)', async ({ page }) => {
  const home = new HomePage(page);
  await home.navigate();

  expect(await home.getProductCount()).toBeGreaterThan(0);
});
