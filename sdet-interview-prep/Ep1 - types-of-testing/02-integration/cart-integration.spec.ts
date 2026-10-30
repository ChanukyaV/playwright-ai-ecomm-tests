import { expect, test } from '@playwright/test';
import { addToCart, clearCart, getCart, getCartTotal } from '../../../platform/src/lib/cart-store';
import { getProductById } from '../../../platform/src/lib/products';
import { CartPage } from '../../../pages/cart.page';
import { addToCartViaApi, resetCart } from '../support/cart';

/*
 * INTEGRATION TESTING - do two or more parts work TOGETHER?
 * Unit tests proved cart-store works alone; now we plug in the REAL product catalogue.
 * Enhancement 2 goes one level up: the API and the UI must agree on the same data.
 */

test.describe('A) module + module: catalogue + cart-store', () => {
  test.beforeEach(() => clearCart());

  test('products from the real catalogue add up to the correct total', () => {
    addToCart(getProductById('p1')!, 2); // Headphones 79.99
    addToCart(getProductById('p2')!, 1); // Keyboard 129.99

    expect(getCart()).toHaveLength(2);
    expect(getCartTotal()).toBe(289.97); // 2 x 79.99 + 129.99
  });
});

test.describe('B) API + UI: what the API stores, the UI shows', () => {
  test.beforeEach(({ request }) => resetCart(request));
  test.afterEach(({ request }) => resetCart(request));

  test('item added through the API appears on the cart page with the right subtotal', async ({ page, request }) => {
    await addToCartViaApi(request, 'p3', 2); // Ergonomic Wireless Mouse 49.99

    const cartPage = new CartPage(page);
    await cartPage.navigate();

    const item = await cartPage.getCartItemByIndex(0);
    await expect(item.productName).toHaveText('Ergonomic Wireless Mouse');
    await expect(item.subtotal).toHaveText('$99.98');
    await expect(page.getByTestId('cart-total')).toHaveText('$99.98');
  });
});
