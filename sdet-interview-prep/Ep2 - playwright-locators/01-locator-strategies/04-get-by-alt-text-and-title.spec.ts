import { expect, test } from '@playwright/test';
import { loadSampleUi } from '../support/sample-ui';

/*
 * getByAltText() - images (and area / input type=image) by their alt attribute.
 * getByTitle()   - elements by their title attribute (tooltip text).
 * Both are user-facing, but only as good as the app's markup: no alt / title = no locator.
 */

test.beforeEach(({ page }) => loadSampleUi(page));

test('getByAltText - find a product image', async ({ page }) => {
  await expect(page.getByAltText('Wireless headphones')).toHaveCount(1);
  await expect(page.getByAltText('iPhone')).toHaveAttribute('alt', 'iPhone 16 front view');
});

test('getByTitle - click the "i" info icon of one product', async ({ page }) => {
  await page.getByTitle('Shipping info for iPhone 16').click();

  await expect(page.getByTitle('Shipping info for iPhone 16')).toHaveText('i');
});

test('getByTitle is a substring match, so several icons can match', async ({ page }) => {
  await expect(page.getByTitle('Shipping info')).toHaveCount(2);
});
