import { expect, test } from '@playwright/test';
import { loadSampleUi, resetCart } from '../support/sample-ui';

/*
 * getByRole() - the FIRST choice. Finds elements the way a user / screen reader does:
 * by ARIA role (button, link, heading, textbox, checkbox ...) + accessible name.
 * If getByRole can't find a control, a screen-reader user can't use it either.
 *
 *   npx playwright test -c "sdet-interview-prep/Ep2 - playwright-locators" 01-locator-strategies/01-get-by-role
 */

test.describe('sample UI', () => {
  test.beforeEach(({ page }) => loadSampleUi(page));

  test('button by role and name', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('status').first()).toHaveText('Welcome back!');
  });

  test('other roles: checkbox', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Remember me' }).check();

    await expect(page.getByRole('checkbox', { name: 'Remember me' })).toBeChecked();
  });

  test('headings can be filtered by level', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Products', level: 2 })).toBeVisible();
  });

  test('name is a case-insensitive substring unless exact: true', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'add to cart' })).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'add to cart', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Add to Cart', exact: true })).toHaveCount(2);
  });
});

test.describe('ShopLab', () => {
  test.beforeEach(({ request }) => resetCart(request));
  test.afterEach(({ request }) => resetCart(request));

  test('cart buttons are found by their aria-label', async ({ page, request }) => {
    await request.post('/api/cart', { data: { productId: 'p5', quantity: 1 } });
    await page.goto('/cart');

    await page.getByRole('button', { name: 'Increase quantity' }).click();

    await expect(page.getByTestId('item-quantity')).toHaveText('2');
  });
});
