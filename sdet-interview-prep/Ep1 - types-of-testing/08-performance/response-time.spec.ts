import { expect, test } from '@playwright/test';
import { addToCartViaApi, resetCart } from '../support/cart';

/*
 * PERFORMANCE TESTING - how FAST and how much can it take?
 * Playwright is fine for a quick response-time budget and a tiny concurrency check.
 * For real load / stress / spike use k6 (see shoplab-spike.js here and ../../../k6/shoplab-api.js).
 *
 *   Load        expected traffic          (20 users for 3 minutes)
 *   Stress      beyond limits             (ramp to 150 users until it breaks)
 *   Spike       sudden burst              (5 -> 100 users in seconds)   <- shoplab-spike.js
 *   Volume      lots of DATA              (huge quantity / many items)  <- below
 *   Scalability does more hardware = more throughput? (run same load at 1 vs 3 instances)
 */

test.beforeEach(({ request }) => resetCart(request));
test.afterEach(({ request }) => resetCart(request));

test('response time budget: product list under 1.5s', async ({ request }) => {
  await request.get('/api/products'); // warm-up (Cloud Run cold start)
  const start = Date.now();

  const res = await request.get('/api/products');

  expect(res.status()).toBe(200);
  expect(Date.now() - start).toBeLessThan(1500);
});

test('mini load: 20 concurrent users all succeed, slowest under 3s', async ({ request }) => {
  const timings = await Promise.all(
    Array.from({ length: 20 }, async () => {
      const start = Date.now();
      const res = await request.get('/api/products');
      expect(res.status()).toBe(200);
      return Date.now() - start;
    }),
  );

  expect(Math.max(...timings)).toBeLessThan(3000);
});

test('volume: a very large quantity is still totalled correctly', async ({ request }) => {
  await addToCartViaApi(request, 'p1', 1_000_000);

  const cart = await (await request.get('/api/cart')).json();
  expect(cart.total).toBe(79_990_000);
});

test('page load budget: products page is interactive under 5s', async ({ page }) => {
  const start = Date.now();

  await page.goto('/products');
  await expect(page.getByTestId('product-card').first()).toBeVisible();

  expect(Date.now() - start).toBeLessThan(5000);
});
