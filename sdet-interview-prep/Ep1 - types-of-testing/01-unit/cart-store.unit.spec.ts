import { expect, test } from '@playwright/test';
import {
  addToCart,
  clearCart,
  getCart,
  getCartTotal,
  removeFromCart,
  updateCartItem,
} from '../../../platform/src/lib/cart-store';
import { Product } from '../../../platform/src/lib/types';

/*
 * UNIT TESTING - one function/module in isolation. No browser, no server, no network.
 * Fast (milliseconds) and the first line of defence.
 * Here we test platform/src/lib/cart-store.ts directly, using our own fake product
 * so the test does not depend on the real product catalogue.
 */

const pen: Product = {
  id: 'x1', name: 'Test Pen', description: 'fake', price: 1.1,
  category: 'Test', emoji: '🖊️', color: '#fff', stock: 10, rating: 5,
};

test.beforeEach(() => clearCart());

// Step 1: the simplest happy-path test.
test('addToCart puts a new item in the cart with the given quantity', () => {
  addToCart(pen, 2);

  expect(getCart()).toEqual([{ product: pen, quantity: 2 }]);
});

// Step 2: more behaviours, one rule per test.
test('adding the same product twice increases the quantity instead of duplicating', () => {
  addToCart(pen, 1);
  addToCart(pen, 2);

  expect(getCart()).toHaveLength(1);
  expect(getCart()[0].quantity).toBe(3);
});

test('updateCartItem to 0 removes the item', () => {
  addToCart(pen, 1);

  expect(updateCartItem('x1', 0)).toBeNull();
  expect(getCart()).toHaveLength(0);
});

test('removeFromCart returns false when the item is not in the cart', () => {
  expect(removeFromCart('missing')).toBe(false);
});

// Step 3: floating point - 3 x 1.10 is 3.3000000000000003 in JavaScript.
test('getCartTotal rounds to 2 decimals', () => {
  addToCart(pen, 3);

  expect(getCartTotal()).toBe(3.3);
});

// Step 4: data-driven + boundary values (quantity 0, 1, many).
for (const [quantity, expectedTotal] of [[1, 1.1], [2, 2.2], [10, 11], [100, 110]]) {
  test(`total for quantity ${quantity} is ${expectedTotal}`, () => {
    addToCart(pen, quantity);

    expect(getCartTotal()).toBe(expectedTotal);
  });
}
