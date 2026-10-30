import { expect, test } from '@playwright/test';
import { resetCart } from '../support/cart';

/*
 * ACCEPTANCE TESTING (UAT) - does it satisfy the BUSINESS requirement?
 * Written in the customer's language (Given / When / Then), not the developer's.
 * A product owner should be able to read this file and say "yes, that is what I asked for".
 *
 * Acceptance criteria (as a product owner might write them):
 *   AC1  A customer can add a product to the cart and see it there.
 *   AC2  The cart total always equals the sum of price x quantity.
 *   AC3  After checkout the customer sees a confirmation and the cart is emptied.
 */

test.beforeEach(({ request }) => resetCart(request));
test.afterEach(({ request }) => resetCart(request));

test('AC1: customer can add a product to the cart', async ({ page }) => {
  await test.step('Given I am viewing the Mechanical Keyboard', async () => {
    await page.goto('/products/p2');
  });
  await test.step('When I click "Add to Cart"', async () => {
    await page.getByTestId('add-to-cart-btn').click();
    await page.getByTestId('go-to-cart-btn').click();
  });
  await test.step('Then the keyboard is in my cart', async () => {
    await expect(page.getByTestId('cart-item-name')).toHaveText('Mechanical Keyboard');
  });
});

test('AC2: cart total equals price x quantity', async ({ page, request }) => {
  await test.step('Given my cart has 3 LED Desk Lamps at $39.99', async () => {
    await request.post('/api/cart', { data: { productId: 'p5', quantity: 3 } });
  });
  await test.step('When I open my cart', async () => {
    await page.goto('/cart');
  });
  await test.step('Then the total is $119.97', async () => {
    await expect(page.getByTestId('cart-total')).toHaveText('$119.97');
  });
});

test('AC3: checkout confirms the order and empties the cart', async ({ page, request }) => {
  await test.step('Given I have an item in my cart', async () => {
    await request.post('/api/cart', { data: { productId: 'p6', quantity: 1 } });
    await page.goto('/cart');
  });
  await test.step('When I click Checkout', async () => {
    await page.getByTestId('checkout-btn').click();
  });
  await test.step('Then I see "Order Placed Successfully!" and my cart is empty', async () => {
    await expect(page.getByTestId('order-success-title')).toBeVisible();
    const cart = await (await request.get('/api/cart')).json();
    expect(cart.items).toHaveLength(0);
  });
});
