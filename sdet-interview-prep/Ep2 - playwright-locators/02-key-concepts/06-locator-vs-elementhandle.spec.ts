import { expect, test } from '@playwright/test';
import { loadSampleUi } from '../support/sample-ui';

/*
 * LOCATOR vs ELEMENTHANDLE
 *   Locator       - a RECIPE for finding an element. Re-resolved on every action, auto-waits, strict. Recommended.
 *   ElementHandle - a POINTER to one specific DOM node, found once. If the page re-renders the node,
 *                   the handle goes STALE (detached) and actions on it fail. Discouraged by the Playwright docs.
 */

test.beforeEach(({ page }) => loadSampleUi(page));

test('after a re-render the ElementHandle is stale, the Locator still works', async ({ page }) => {
  const handle = await page.$('.product-card'); // ElementHandle: found once, now
  const locator = page.locator('.product-card').first(); // Locator: just a recipe

  await page.getByRole('button', { name: 'Refresh products' }).click(); // replaces every product node

  expect(await handle!.evaluate((node) => node.isConnected)).toBe(false);
  await expect(handle!.click({ timeout: 1000 })).rejects.toThrow(/not attached to the DOM/);

  await locator.getByRole('button', { name: 'Add to Cart' }).click();
  await expect(page.getByText('iPhone 16 added to cart')).toBeVisible();
});

test('a handle has no auto-waiting search: page.$ returns null if nothing is there yet', async ({ page }) => {
  const handle = await page.$('#does-not-exist');

  expect(handle).toBeNull();
});
