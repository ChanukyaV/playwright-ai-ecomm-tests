import { expect, test } from '@playwright/test';
import { resetCart } from '../support/cart';

/*
 * END-TO-END (E2E) TESTING - one real user journey from start to finish,
 * through every layer (browser -> UI -> API -> data), with NO shortcuts.
 * Few in number, slow, but they prove the business flow actually works.
 */

test.beforeEach(({ request }) => resetCart(request));
test.afterEach(({ request }) => resetCart(request));

test('a shopper searches, adds two products, changes quantity and checks out', async ({ page }) => {
  await test.step('open the shop', async () => {
    await page.goto('/');
    await expect(page.getByTestId('page-title')).toHaveText('All Products');
  });

  await test.step('search for "mouse" and add it to the cart', async () => {
    await page.getByTestId('product-search-input').fill('mouse');
    await page.getByTestId('add-to-cart-btn').click();
    await expect(page.getByTestId('go-to-cart-btn')).toBeVisible();
  });

  await test.step('add a second product from its detail page', async () => {
    await page.goto('/products/p2');
    await page.getByTestId('add-to-cart-btn').click();
    await expect(page.getByTestId('go-to-cart-btn')).toBeVisible();
  });

  await test.step('open the cart and verify both items and the total', async () => {
    await page.getByTestId('nav-link-cart').click();
    await expect(page.getByTestId('cart-item')).toHaveCount(2);
    await expect(page.getByTestId('cart-total')).toHaveText('$179.98'); // 49.99 + 129.99
  });

  await test.step('increase the mouse quantity', async () => {
    await page.getByTestId('cart-item').first().getByTestId('quantity-increase').click();
    await expect(page.getByTestId('cart-total')).toHaveText('$229.97');
  });

  await test.step('check out', async () => {
    await page.getByTestId('checkout-btn').click();
    await expect(page.getByTestId('order-success-title')).toHaveText('Order Placed Successfully!');
  });

  await test.step('the cart is empty afterwards', async () => {
    await page.getByTestId('continue-shopping-btn').click();
    await page.getByTestId('nav-link-cart').click();
    await expect(page.getByTestId('empty-cart')).toBeVisible();
  });
});
