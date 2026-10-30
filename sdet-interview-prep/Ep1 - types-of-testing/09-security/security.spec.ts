import { expect, test } from '@playwright/test';
import { resetCart } from '../support/cart';

/*
 * SECURITY TESTING - can someone abuse the app? We think like an attacker:
 * bad input, tampered URLs, information leaks.
 *
 * Tests that start with test.fail(true, ...) describe SECURE behaviour that ShopLab does NOT
 * have yet. They document real DEFECTS: the suite stays green now, and the moment a developer
 * fixes the defect the test "unexpectedly passes" - your cue to delete the test.fail() line.
 */

test.beforeEach(({ request }) => resetCart(request));
test.afterEach(({ request }) => resetCart(request));

test.describe('injection & tampering (app handles these safely)', () => {
  test('SQL-injection style product id is just "not found"', async ({ request }) => {
    const res = await request.get(`/api/products/${encodeURIComponent("' OR 1=1 --")}`);

    expect(res.status()).toBe(404);
  });

  test('XSS payload typed in search is shown as text, never executed', async ({ page }) => {
    let dialogOpened = false;
    page.on('dialog', async (d) => { dialogOpened = true; await d.dismiss(); });
    await page.goto('/products');

    await page.getByTestId('product-search-input').fill('<img src=x onerror=alert(1)>');

    await expect(page.getByTestId('no-search-results')).toContainText('<img src=x onerror=alert(1)>');
    expect(dialogOpened).toBe(false);
  });

  test('path traversal attempt is blocked', async ({ request }) => {
    const res = await request.get('/api/products/..%2F..%2Fetc%2Fpasswd');

    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('input validation (KNOWN DEFECTS - the API trusts its input)', () => {
  test('negative quantity must be rejected', async ({ request }) => {
    test.fail(true, 'defect: accepted with 201 and the cart total becomes negative');

    const res = await request.post('/api/cart', { data: { productId: 'p1', quantity: -5 } });

    expect(res.status()).toBe(400);
  });

  test('non-numeric quantity must be rejected', async ({ request }) => {
    test.fail(true, 'defect: accepted with 201 and the cart holds quantity "abc"');

    const res = await request.post('/api/cart', { data: { productId: 'p1', quantity: 'abc' } });

    expect(res.status()).toBe(400);
  });

  test('malformed JSON must return 400, not a 500 server error', async ({ request }) => {
    test.fail(true, 'defect: unhandled exception returns 500');

    const res = await request.post('/api/cart', {
      headers: { 'Content-Type': 'application/json' },
      data: '{bad json',
    });

    expect(res.status()).toBe(400);
  });

  test('cannot order more than the available stock', async ({ request }) => {
    test.fail(true, 'defect: p1 has 25 in stock but 26 is accepted');

    const res = await request.post('/api/cart', { data: { productId: 'p1', quantity: 26 } });

    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('information disclosure', () => {
  test('responses do not reveal the technology stack', async ({ request }) => {
    test.fail(true, 'defect: "X-Powered-By: Next.js" helps attackers pick known exploits');

    const res = await request.get('/products');

    expect(res.headers()['x-powered-by']).toBeUndefined();
  });
});
