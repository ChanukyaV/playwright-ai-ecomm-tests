import { expect, test } from '@playwright/test';

test.describe('ShopLab API', () => {
  test('API-01: Get All Products', async ({ request }) => {
    const response = await request.get('/api/products');

    expect(response.status()).toBe(200);
    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products).toHaveLength(100);

    for (const product of products) {
      expect(product).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          price: expect.any(Number),
          category: expect.any(String),
          emoji: expect.any(String),
          color: expect.any(String),
          stock: expect.any(Number),
          rating: expect.any(Number),
        }),
      );
    }
  });

  test('API-02: Get Product By Valid ID', async ({ request }) => {
    const response = await request.get('/api/products/p1');

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ id: 'p1' });
  });

  test('API-03: Get Product By Invalid ID', async ({ request }) => {
    const response = await request.get('/api/products/does-not-exist');

    expect(response.status()).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Product not found' });
  });

  test.describe('Cart endpoints', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ request }) => {
      const response = await request.delete('/api/cart');
      expect(response.status()).toBe(200);
    });

    test.afterEach(async ({ request }) => {
      const response = await request.delete('/api/cart');
      expect(response.status()).toBe(200);
    });

    test('API-04: Clear Cart', async ({ request }) => {
      const response = await request.delete('/api/cart');

      expect(response.status()).toBe(200);
      await expect(response.json()).resolves.toEqual({ message: 'Cart cleared' });
    });

    test('API-05: Add Item To Cart (Valid)', async ({ request }) => {
      const response = await request.post('/api/cart', {
        data: { productId: 'p1', quantity: 2 },
      });

      expect(response.status()).toBe(201);
      await expect(response.json()).resolves.toMatchObject({
        product: { id: 'p1' },
        quantity: 2,
      });
    });

    test('API-06: Add Item To Cart (Invalid Product)', async ({ request }) => {
      const response = await request.post('/api/cart', {
        data: { productId: 'bad-id', quantity: 1 },
      });

      expect(response.status()).toBe(404);
      await expect(response.json()).resolves.toEqual({ error: 'Product not found' });
    });

    test('API-07: Get Cart After Add', async ({ request }) => {
      const addResponse = await request.post('/api/cart', {
        data: { productId: 'p1', quantity: 2 },
      });
      expect(addResponse.status()).toBe(201);

      const response = await request.get('/api/cart');

      expect(response.status()).toBe(200);
      const cart = await response.json();
      expect(cart).toMatchObject({
        items: [{ product: { id: 'p1' }, quantity: 2 }],
        total: 159.98,
      });
      expect(cart.items).toHaveLength(1);
    });

    test('API-08: Update Cart Item Quantity', async ({ request }) => {
      const addResponse = await request.post('/api/cart', {
        data: { productId: 'p1', quantity: 2 },
      });
      expect(addResponse.status()).toBe(201);

      const response = await request.patch('/api/cart/p1', {
        data: { quantity: 1 },
      });

      expect(response.status()).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        product: { id: 'p1' },
        quantity: 1,
      });
    });

    test('API-09: Update Cart Item To Zero Removes Item', async ({ request }) => {
      const addResponse = await request.post('/api/cart', {
        data: { productId: 'p1', quantity: 1 },
      });
      expect(addResponse.status()).toBe(201);

      const updateResponse = await request.patch('/api/cart/p1', {
        data: { quantity: 0 },
      });

      expect(updateResponse.status()).toBe(200);
      await expect(updateResponse.json()).resolves.toEqual({ message: 'Item removed' });

      const cartResponse = await request.get('/api/cart');
      expect(cartResponse.status()).toBe(200);
      const cart = await cartResponse.json();
      expect(cart.items).not.toContainEqual(
        expect.objectContaining({ product: expect.objectContaining({ id: 'p1' }) }),
      );
    });

    test('API-10: Update Missing Cart Item', async ({ request }) => {
      const response = await request.patch('/api/cart/p1', {
        data: { quantity: 2 },
      });

      expect(response.status()).toBe(404);
      await expect(response.json()).resolves.toEqual({ error: 'Item not found in cart' });
    });

    test('API-11: Delete Existing Cart Item', async ({ request }) => {
      const addResponse = await request.post('/api/cart', {
        data: { productId: 'p1', quantity: 1 },
      });
      expect(addResponse.status()).toBe(201);

      const response = await request.delete('/api/cart/p1');

      expect(response.status()).toBe(200);
      await expect(response.json()).resolves.toEqual({ message: 'Item removed' });
    });

    test('API-12: Delete Missing Cart Item', async ({ request }) => {
      const response = await request.delete('/api/cart/p1');

      expect(response.status()).toBe(404);
      await expect(response.json()).resolves.toEqual({ error: 'Item not found in cart' });
    });
  });

  test.describe('Pagination, filtering and categories', () => {
    test('API-15: Get Products Paginated', async ({ request }) => {
      const response = await request.get('/api/products?page=2&pageSize=12');

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toMatchObject({ page: 2, pageSize: 12, total: 100, totalPages: 9 });
      expect(body.items).toHaveLength(12);
      expect(body.items[0].id).toBe('p13');
    });

    test('API-16: Last Page Has Remaining Products', async ({ request }) => {
      const response = await request.get('/api/products?page=9&pageSize=12');

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.items).toHaveLength(4);
      expect(body.items.at(-1).id).toBe('p100');
    });

    test('API-17: Page Beyond The Last Page Is Empty', async ({ request }) => {
      const response = await request.get('/api/products?page=99');

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.items).toEqual([]);
      expect(body.total).toBe(100);
    });

    test('API-18: Invalid Pagination Parameters Are Rejected', async ({ request }) => {
      for (const query of ['page=0', 'page=abc', 'pageSize=0', 'pageSize=101']) {
        const response = await request.get(`/api/products?${query}`);

        expect(response.status(), query).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: expect.any(String) });
      }
    });

    test('API-19: Filter Products By Category', async ({ request }) => {
      const response = await request.get('/api/products?category=audio&pageSize=100');

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.total).toBe(14);
      for (const product of body.items) {
        expect(product.category).toBe('Audio');
      }
    });

    test('API-20: Search Products With Pagination', async ({ request }) => {
      const response = await request.get('/api/products?q=keyboard');

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.total).toBe(1);
      expect(body.items[0]).toMatchObject({ id: 'p2', name: 'Mechanical Keyboard' });
    });

    test('API-21: List Categories', async ({ request }) => {
      const response = await request.get('/api/categories');

      expect(response.status()).toBe(200);
      const categories: { name: string; count: number }[] = await response.json();
      expect(categories).toHaveLength(7);
      expect(categories.reduce((sum, c) => sum + c.count, 0)).toBe(100);
      expect(categories).toContainEqual({ name: 'Audio', count: 14 });
    });
  });

  test('API-13: Chat API Error Path (Gemini Unavailable)', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: { message: 'hello', history: [] },
    });

    test.skip(response.status() === 200, 'Gemini is available; the unavailable-path precondition is not met.');
    expect(response.status()).toBe(503);
    const body = await response.json();
    expect(body.error).toMatch(/^Failed to connect to Gemini/);
  });

  test('API-14: Chat API Success Path (When Gemini Is Configured)', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: { message: 'Recommend a keyboard', history: [] },
    });

    test.skip(response.status() === 503, 'Gemini is unavailable; the success-path precondition is not met.');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.reply).toMatchObject({
      role: 'assistant',
      content: expect.any(String),
    });
    expect(body.reply.content.trim().length).toBeGreaterThan(0);
  });
});