import { expect, test } from '@playwright/test';

/*
 * SMOKE TESTING - "is the build alive?" A handful of very fast, shallow checks run
 * right after every deployment. If any fails, stop: the build is not worth testing further.
 *
 * Run only these:   npx playwright test -c "sdet-interview-prep/Ep1 - types-of-testing" --grep @smoke
 */

test.describe('smoke', { tag: '@smoke' }, () => {
  test('site opens and shows the product page', async ({ page }) => {
    const res = await page.goto('/products');

    expect(res?.status()).toBe(200);
    await expect(page.getByTestId('page-title')).toHaveText('All Products');
  });

  test('backend API is alive', async ({ request }) => {
    const res = await request.get('/api/products');

    expect(res.status()).toBe(200);
  });

  test('main navigation reaches the cart page', async ({ page }) => {
    await page.goto('/products');
    await page.getByTestId('nav-link-cart').click();

    await expect(page.getByTestId('cart-title')).toBeVisible();
  });
});
