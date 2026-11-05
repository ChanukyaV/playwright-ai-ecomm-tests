import { expect, test } from '@playwright/test';
import { loadSampleUi } from '../support/sample-ui';

/*
 * getByLabel()       - form control by its <label> text (or aria-label). Best for forms.
 * getByPlaceholder() - form control by placeholder text. Use when there is no label
 *                      (a placeholder is NOT a substitute for a label - it is an accessibility smell).
 */

test.describe('sample UI', () => {
  test.beforeEach(({ page }) => loadSampleUi(page));

  test('getByLabel - fill the login form', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('P@ss123');

    await expect(page.getByLabel('Email')).toHaveValue('test@example.com');
    await expect(page.getByLabel('Password')).toHaveValue('P@ss123');
  });

  test('getByPlaceholder - fill by hint text', async ({ page }) => {
    await page.getByPlaceholder('Enter your password').fill('P@ss123');

    await expect(page.getByPlaceholder('Enter your password')).toHaveValue('P@ss123');
  });
});

test.describe('ShopLab', () => {
  test('search box has a placeholder but no label -> getByPlaceholder', async ({ page }) => {
    await page.goto('/products');

    await page.getByPlaceholder(/search products/i).fill('lamp');

    await expect(page.getByTestId('product-card')).toHaveCount(1);
    await expect(page.getByTestId('product-name')).toHaveText('LED Desk Lamp');
  });
});
