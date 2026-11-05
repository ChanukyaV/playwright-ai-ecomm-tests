import { expect, test } from '@playwright/test';
import { loadSampleUi, resetCart } from '../support/sample-ui';

/*
 * filter() - narrow an existing locator down.
 *   hasText    : the element's text contains this (string or RegExp)
 *   hasNotText : the opposite
 *   has        : the element contains a child matching ANOTHER locator
 *   hasNot     : the opposite
 *
 * hasText = filter by text.   has = filter by another locator.
 */

test.describe('sample UI', () => {
  test.beforeEach(({ page }) => loadSampleUi(page));

  test('hasText - the Add to Cart button of ONE specific product', async ({ page }) => {
    await page
      .locator('.product-card')
      .filter({ hasText: 'iPhone 16' })
      .getByRole('button', { name: 'Add to Cart' })
      .click();

    await expect(page.getByText('iPhone 16 added to cart')).toBeVisible();
  });

  test('hasNotText - every product except one', async ({ page }) => {
    const others = page.locator('.product-card').filter({ hasNotText: 'iPhone' });

    await expect(others).toHaveCount(1);
    await expect(others).toContainText('Headphones');
  });

  test('has - the card that contains a given child locator', async ({ page }) => {
    const card = page.locator('.product-card').filter({ has: page.getByAltText('Wireless headphones') });

    await card.getByRole('button', { name: 'Add to Cart' }).click();

    await expect(page.getByText('Headphones added to cart')).toBeVisible();
  });

  test('has + hasText can be combined', async ({ page }) => {
    const card = page.locator('.product-card').filter({ hasText: '$999', has: page.getByRole('button') });

    await expect(card.getByRole('heading')).toHaveText('iPhone 16');
  });
});

test.describe('ShopLab', () => {
  test.beforeEach(({ request }) => resetCart(request));
  test.afterEach(({ request }) => resetCart(request));

  test('filter by price with a regular expression', async ({ page }) => {
    await page.goto('/products');

    const under40 = page.getByTestId('product-card').filter({ hasText: /\$3\d\.\d\d/ });

    await expect(under40.getByTestId('product-name')).toHaveText(['LED Desk Lamp', 'Portable Power Bank 20000mAh']);
  });
});
