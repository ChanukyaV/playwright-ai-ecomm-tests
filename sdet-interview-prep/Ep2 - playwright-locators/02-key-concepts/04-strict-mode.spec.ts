import { expect, test } from '@playwright/test';
import { loadSampleUi } from '../support/sample-ui';

/*
 * STRICT MODE - a locator used for an ACTION (click, fill, textContent ...) must match exactly ONE element.
 * If it matches 2+, Playwright throws "strict mode violation" instead of silently clicking the wrong one.
 * Assertions like toHaveCount() / toHaveText([...]) are meant for many elements and are not strict.
 *
 * Fix a violation by making the locator MORE SPECIFIC (best: see 02-filter-has-hastext and 03-chaining),
 * or by choosing explicitly: first() / nth() / last() (see 01-first-last-nth).
 */

test.beforeEach(({ page }) => loadSampleUi(page));

test('two matches + an action = strict mode violation', async ({ page }) => {
  const addButtons = page.getByRole('button', { name: 'Add to Cart' });
  await expect(addButtons).toHaveCount(2);

  await expect(addButtons.click()).rejects.toThrow(/strict mode violation/);
});

test('assertions on many elements are NOT strict', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 3 })).toHaveText(['iPhone 16', 'Headphones']);
});
