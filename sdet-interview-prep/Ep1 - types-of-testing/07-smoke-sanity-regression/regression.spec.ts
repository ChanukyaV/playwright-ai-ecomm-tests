import { expect, test } from '@playwright/test';
import { addToCartViaApi, resetCart } from '../support/cart';

/*
 * REGRESSION TESTING - after ANY change, re-run the existing suite to prove old features
 * still work. In practice it is the whole automated suite, tagged @regression and run in CI.
 * Every bug that was ever fixed should leave behind a test so it can never come back.
 *
 * Run only these:   npx playwright test -c "sdet-interview-prep/Ep1 - types-of-testing" --grep @regression
 * Retest vs regression: RETEST re-checks the one defect that was fixed;
 *                       REGRESSION checks that nothing ELSE broke.
 */

test.describe('regression', { tag: '@regression' }, () => {
  test.beforeEach(({ request }) => resetCart(request));
  test.afterEach(({ request }) => resetCart(request));

  test('REG-01 products list still has 8 items', async ({ request }) => {
    const products = await (await request.get('/api/products')).json();

    expect(products).toHaveLength(8);
  });

  test('REG-02 cart add -> update -> remove still works', async ({ request }) => {
    await addToCartViaApi(request, 'p1', 1);
    expect((await request.patch('/api/cart/p1', { data: { quantity: 3 } })).status()).toBe(200);
    expect((await request.delete('/api/cart/p1')).status()).toBe(200);

    expect((await (await request.get('/api/cart')).json()).items).toHaveLength(0);
  });

  // A test born from a past bug: floating point made 3 x 39.99 = 119.97000000000001.
  test('REG-03 (old bug) total is rounded to 2 decimals', async ({ request }) => {
    await addToCartViaApi(request, 'p5', 3);

    const cart = await (await request.get('/api/cart')).json();
    expect(cart.total).toBe(119.97);
  });

  test('REG-04 checkout still shows the confirmation', async ({ page, request }) => {
    await addToCartViaApi(request, 'p1', 1);
    await page.goto('/cart');
    await page.getByTestId('checkout-btn').click();

    await expect(page.getByTestId('order-success-title')).toBeVisible();
  });
});
