import { expect, test } from '@playwright/test';
import { loadSampleUi, resetCart } from '../support/sample-ui';

/*
 * Chaining - a locator can be used as the starting point for another one,
 * so the second search only looks INSIDE the first (parent -> child).
 *   page.locator('#iphone').getByRole('button', { name: 'Add to Cart' })
 * It makes locators short, readable and unambiguous: the same button exists once per product / cart row.
 */

test('sample UI: parent -> child', async ({ page }) => {
  await loadSampleUi(page);

  await page.locator('#headphones').getByRole('button', { name: 'Add to Cart' }).click();

  await expect(page.getByText('Headphones added to cart')).toBeVisible();
});

test.describe('ShopLab cart', () => {
  test.beforeEach(({ request }) => resetCart(request));
  test.afterEach(({ request }) => resetCart(request));

  test('change quantity of ONE row, leave the other row alone', async ({ page, request }) => {
    await request.post('/api/cart', { data: { productId: 'p5', quantity: 1 } });
    await request.post('/api/cart', { data: { productId: 'p7', quantity: 1 } });
    await page.goto('/cart');
    const lamp = page.getByTestId('cart-item').filter({ hasText: 'LED Desk Lamp' });
    const powerBank = page.getByTestId('cart-item').filter({ hasText: 'Portable Power Bank' });

    await lamp.getByRole('button', { name: 'Increase quantity' }).click();

    await expect(lamp.getByTestId('item-quantity')).toHaveText('2');
    await expect(powerBank.getByTestId('item-quantity')).toHaveText('1');
  });
});
