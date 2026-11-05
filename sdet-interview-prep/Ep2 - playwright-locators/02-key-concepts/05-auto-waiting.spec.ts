import { expect, test } from '@playwright/test';
import { loadSampleUi, resetCart } from '../support/sample-ui';

/*
 * AUTO-WAITING - before an action Playwright automatically waits until the element is:
 *   attached, visible, stable (not animating), able to receive events (not covered), and enabled.
 * No sleep() / waitForTimeout() needed. Web-first assertions (expect(locator)...) also retry until they pass or time out.
 *
 * Interview answer: "Locators are lazy and re-evaluated on every action; each action runs actionability checks
 * and retries until the timeout (30 s for tests by default), so flaky timing problems mostly disappear."
 */

test('click waits for a disabled button to become enabled (1 s in the sample UI)', async ({ page }) => {
  await loadSampleUi(page);

  await page.getByRole('button', { name: 'Pay now' }).click(); // no explicit wait

  await expect(page.getByText('Payment complete')).toBeVisible();
});

test('the wait is not infinite - a short timeout shows what Playwright was waiting for', async ({ page }) => {
  await loadSampleUi(page);

  const click = page.getByRole('button', { name: 'Pay now' }).click({ timeout: 200 });

  await expect(click).rejects.toThrow(/element is not enabled/);
});

test('web-first assertion retries until the text appears', async ({ page }) => {
  await loadSampleUi(page);
  await page.evaluate(() => setTimeout(() => (document.getElementById('login-status')!.textContent = 'Late message'), 700));

  await expect(page.locator('#login-status')).toHaveText('Late message');
});

test.describe('ShopLab', () => {
  test.beforeEach(({ request }) => resetCart(request));
  test.afterEach(({ request }) => resetCart(request));

  test('cart page loads its data asynchronously - no sleep needed', async ({ page, request }) => {
    await request.post('/api/cart', { data: { productId: 'p1', quantity: 1 } });
    await page.goto('/cart');

    await expect(page.getByTestId('cart-item-name')).toHaveText('Wireless Bluetooth Headphones');
  });

  test('"Go to Cart" only appears after the add-to-cart call returns', async ({ page }) => {
    await page.goto('/products');

    await page.getByTestId('add-to-cart-btn').first().click();

    await expect(page.getByTestId('go-to-cart-btn')).toBeVisible();
  });
});
