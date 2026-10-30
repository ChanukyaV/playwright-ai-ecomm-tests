import { expect, test } from '@playwright/test';
import { addToCartViaApi, resetCart } from '../support/cart';

/*
 * API / INTERFACE TESTING - talk to the backend directly over HTTP. No browser.
 * Faster and more stable than UI tests, and covers rules the UI never exercises.
 * Enhancements: status code -> response body shape -> negative cases -> chained calls.
 */

test.describe('Products API', () => {
  // Step 1: status code only.
  test('GET /api/products returns 200', async ({ request }) => {
    const res = await request.get('/api/products');
    expect(res.status()).toBe(200);
  });

  // Step 2: the contract (shape of the data).
  test('every product has the agreed fields and types', async ({ request }) => {
    const products = await (await request.get('/api/products')).json();

    expect(products).toHaveLength(8);
    for (const p of products) {
      expect(p).toMatchObject({ id: expect.any(String), name: expect.any(String), price: expect.any(Number), stock: expect.any(Number) });
    }
  });

  // Step 3: negative case.
  test('unknown product id returns 404 with an error message', async ({ request }) => {
    const res = await request.get('/api/products/does-not-exist');

    expect(res.status()).toBe(404);
    expect(await res.json()).toEqual({ error: 'Product not found' });
  });
});

test.describe('Cart API', () => {
  test.beforeEach(({ request }) => resetCart(request));
  test.afterEach(({ request }) => resetCart(request));

  // Step 4: chained calls - POST, then GET to prove it was really stored (state check).
  test('POST then GET: the added item and total are returned', async ({ request }) => {
    await addToCartViaApi(request, 'p1', 2);

    const cart = await (await request.get('/api/cart')).json();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({ product: { id: 'p1' }, quantity: 2 });
    expect(cart.total).toBe(159.98);
  });

  // Step 5: full lifecycle (CRUD): create -> update -> delete.
  test('update quantity, then delete the item', async ({ request }) => {
    await addToCartViaApi(request, 'p1', 2);

    const patched = await request.patch('/api/cart/p1', { data: { quantity: 5 } });
    expect(patched.status()).toBe(200);
    expect((await patched.json()).quantity).toBe(5);

    expect((await request.delete('/api/cart/p1')).status()).toBe(200);
    expect((await request.delete('/api/cart/p1')).status()).toBe(404); // already gone
  });

  test('adding an unknown product is rejected', async ({ request }) => {
    const res = await request.post('/api/cart', { data: { productId: 'bad-id', quantity: 1 } });

    expect(res.status()).toBe(404);
  });
});
