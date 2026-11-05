import { expect, test } from '@playwright/test';
import { loadSampleUi, resetCart } from '../support/sample-ui';

/*
 * first() / last() / nth(i) - pick one element when a locator matches several.
 * nth() is ZERO-BASED: nth(0) = first, nth(1) = second.
 * Tip: index-based locators break when the order changes - prefer filter() when you can.
 */

test.describe('sample UI', () => {
  test.beforeEach(({ page }) => loadSampleUi(page));

  test('nth(1) is the SECOND "Add to Cart" button', async ({ page }) => {
    await page.getByRole('button', { name: 'Add to Cart' }).nth(1).click();

    await expect(page.getByText('Headphones added to cart')).toBeVisible();
  });

  test('count() and all() to work with every match', async ({ page }) => {
    const cards = page.getByTestId('product-card');

    expect(await cards.count()).toBe(2);
    const names = await Promise.all((await cards.all()).map((card) => card.getByRole('heading').textContent()));
    expect(names).toEqual(['iPhone 16', 'Headphones']);
  });
});

test.describe('ShopLab', () => {
  test.beforeEach(({ request }) => resetCart(request));
  test.afterEach(({ request }) => resetCart(request));

  test('first, nth and last product names', async ({ page }) => {
    await page.goto('/products');
    const names = page.getByTestId('product-name');

    await expect(names).toHaveCount(8);
    await expect(names.first()).toHaveText('Wireless Bluetooth Headphones');
    await expect(names.nth(1)).toHaveText('Mechanical Keyboard');
    await expect(names.last()).toHaveText('USB-C Hub 7-in-1');
  });
});
