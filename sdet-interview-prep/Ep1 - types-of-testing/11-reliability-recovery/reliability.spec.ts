import { expect, test } from '@playwright/test';
import { resetCart } from '../support/cart';

/*
 * RELIABILITY & RECOVERY TESTING - does it keep working, and does it bounce back,
 * when things go wrong (server error, network failure, slow network, page refresh)?
 * We use page.route() to SIMULATE failures that are hard to trigger on a real server.
 */

test.beforeEach(({ request }) => resetCart(request));
test.afterEach(({ request }) => resetCart(request));

test('data survives a page reload (state lives on the server)', async ({ page }) => {
  await page.goto('/products/p1');
  await page.getByTestId('add-to-cart-btn').click();
  await expect(page.getByTestId('go-to-cart-btn')).toBeVisible();

  await page.goto('/cart');
  await page.reload();

  await expect(page.getByTestId('cart-item-name')).toHaveText('Wireless Bluetooth Headphones');
});

test('server error: user sees a friendly message, then recovers on retry', async ({ page }) => {
  await page.goto('/products/p1');
  await page.route('**/api/cart', (route) => route.fulfill({ status: 500, body: '{"error":"boom"}' }));

  await page.getByTestId('add-to-cart-btn').click();
  await expect(page.getByTestId('add-to-cart-error')).toHaveText('Could not add to cart. Please try again.');

  await page.unroute('**/api/cart'); // the "server" is healthy again
  await page.getByTestId('add-to-cart-btn').click();

  await expect(page.getByTestId('go-to-cart-btn')).toBeVisible();
  await expect(page.getByTestId('add-to-cart-error')).toBeHidden();
});

test('network failure: the app shows an error instead of freezing', async ({ page }) => {
  await page.goto('/products/p2');
  await page.route('**/api/cart', (route) => route.abort('connectionfailed'));

  await page.getByTestId('add-to-cart-btn').click();

  await expect(page.getByTestId('add-to-cart-error')).toBeVisible();
  await expect(page.getByTestId('add-to-cart-btn')).toBeEnabled(); // user can try again
});

test('slow network: shows "Adding…" and still finishes', async ({ page }) => {
  await page.goto('/products/p3');
  await page.route('**/api/cart', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });

  await page.getByTestId('add-to-cart-btn').click();

  await expect(page.getByTestId('add-to-cart-btn')).toHaveText('Adding…');
  await expect(page.getByTestId('go-to-cart-btn')).toBeVisible({ timeout: 10_000 });
});

test('double click does not add the item twice', async ({ page, request }) => {
  await page.goto('/products/p4');

  await page.getByTestId('add-to-cart-btn').dblclick();
  await expect(page.getByTestId('go-to-cart-btn')).toBeVisible();

  const cart = await (await request.get('/api/cart')).json();
  expect(cart.items[0].quantity).toBe(1);
});
