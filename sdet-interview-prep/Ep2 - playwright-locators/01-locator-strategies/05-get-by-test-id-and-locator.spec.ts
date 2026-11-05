import { expect, test } from '@playwright/test';
import { resetCart } from '../support/sample-ui';

/*
 * getByTestId() - element by data-testid (change the attribute name with `use: { testIdAttribute }`).
 *   Not user-facing, but stable: survives text changes, translations and restyling.
 *   Best when role/text/label are ambiguous or unavailable. Needs the dev team to add the attributes.
 *
 * locator() - general purpose: CSS, XPath, text=, chained selectors.
 *   Last resort. CSS classes and XPath break when the DOM structure changes.
 *
 * Order of preference:  getByRole > getByLabel > getByText > getByPlaceholder > getByAltText/Title > getByTestId > locator(css/xpath)
 */

test.beforeEach(({ request }) => resetCart(request));
test.afterEach(({ request }) => resetCart(request));

test('getByTestId', async ({ page }) => {
  await page.goto('/products');

  await expect(page.getByTestId('product-card')).toHaveCount(8);
  await expect(page.getByTestId('page-title')).toBeVisible();
});

test('locator() with CSS - same element as getByTestId', async ({ page }) => {
  await page.goto('/products');

  const byCss = page.locator('[data-testid="product-card"][data-product-id="p5"]');

  await expect(byCss).toHaveCount(1);
  await expect(byCss.getByTestId('product-name')).toHaveText('LED Desk Lamp');
});

test('locator() with XPath - works, but is the most fragile', async ({ page }) => {
  await page.goto('/products');

  const byXpath = page.locator('xpath=//h3[@data-testid="product-name"][normalize-space()="LED Desk Lamp"]');

  await expect(byXpath).toHaveCount(1);
});

test('locator() with the text= engine', async ({ page }) => {
  await page.goto('/products');

  await expect(page.locator('text=LED Desk Lamp').first()).toBeVisible();
});
