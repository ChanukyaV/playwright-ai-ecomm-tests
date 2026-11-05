import { expect, test } from '@playwright/test';
import { loadSampleUi, resetCart } from '../support/sample-ui';

/*
 * getByText() - finds an element by the text a user SEES.
 *   - default: case-insensitive, substring match   -> { exact: false }
 *   - { exact: true }: case-sensitive, whole string
 *   - also accepts a RegExp
 * Best for non-interactive content (headings, paragraphs, labels).
 * For buttons and links prefer getByRole - it also checks the role.
 *
 * getByRole vs getByText (interview favourite):
 *   getByRole('button', { name: 'Login' })  -> "a BUTTON called Login"   (role + name)
 *   getByText('Login')                      -> "anything that shows the text Login" (heading, button, paragraph...)
 */

test.describe('sample UI', () => {
  test.beforeEach(({ page }) => loadSampleUi(page));

  test('partial match (default) - "iPhone" finds "iPhone 16"', async ({ page }) => {
    await page.getByText('iPhone', { exact: false }).click();

    await expect(page.getByText('iPhone 16')).toBeVisible();
  });

  test('exact match is case-sensitive and matches the whole text', async ({ page }) => {
    await expect(page.getByText('headphones', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Headphones', { exact: true })).toHaveCount(1);
  });

  test('regular expression - every price', async ({ page }) => {
    await expect(page.getByText(/^\$\d+$/)).toHaveText(['$999', '$199']);
  });

  test('same text, different roles: getByText is broader than getByRole', async ({ page }) => {
    // "Login" is both a heading and a button
    await expect(page.getByText('Login', { exact: true })).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Login' })).toHaveCount(1);
  });
});

test.describe('ShopLab', () => {
  test.beforeEach(({ request }) => resetCart(request));
  test.afterEach(({ request }) => resetCart(request));

  test('empty-cart message by visible text', async ({ page }) => {
    await page.goto('/cart');

    await expect(page.getByText('Your cart is empty')).toBeVisible();
  });
});
