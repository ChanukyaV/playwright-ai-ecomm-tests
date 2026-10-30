import { expect, test } from '@playwright/test';

/*
 * LOCALIZATION TESTING (L10n) - does the app adapt to a user's language, region, currency,
 * number and date formats? We change the browser's locale and check what the user sees.
 *
 * ShopLab is English + US dollars only. So we test two things:
 *   1. what it DOES promise (consistent English / $ formatting in any locale), and
 *   2. what a localized shop SHOULD do - written as test.fail() so the gap is documented,
 *      and the test starts passing the day someone adds localization.
 */

test.describe('German user (de-DE)', () => {
  test.use({ locale: 'de-DE', timezoneId: 'Europe/Berlin' });

  test('app stays consistent: English text, $ prices, dot decimals', async ({ page }) => {
    await page.goto('/products/p1');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByTestId('product-detail-price')).toHaveText('$79.99');
  });

  test('a localized shop would show the price as 79,99 €', async ({ page }) => {
    test.fail(true, 'gap: ShopLab has no localization - price is always $79.99');

    await page.goto('/products/p1');

    await expect(page.getByTestId('product-detail-price')).toContainText('79,99');
  });
});

test.describe('Hindi user (hi-IN)', () => {
  test.use({ locale: 'hi-IN', timezoneId: 'Asia/Kolkata' });

  test('a localized shop would show Indian rupees', async ({ page }) => {
    test.fail(true, 'gap: ShopLab has no localization - price is always in $');

    await page.goto('/products/p1');

    await expect(page.getByTestId('product-detail-price')).toContainText('₹');
  });
});

test.describe('international text input (internationalization)', () => {
  test('search copes with accents, Hindi and emoji without crashing', async ({ page }) => {
    await page.goto('/products');

    for (const text of ['café', 'कीबोर्ड', '🎧']) {
      await page.getByTestId('product-search-input').fill(text);
      await expect(page.getByTestId('product-grid')).toBeVisible();
    }
    await expect(page.getByTestId('no-search-results')).toContainText('🎧');
  });
});
