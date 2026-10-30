import { expect, test } from '@playwright/test';
import { addToCartViaApi, resetCart } from '../support/cart';

/*
 * SANITY TESTING - narrow and deep. After a SMALL change or bug fix, quickly confirm
 * that one area now works and its direct neighbours are not obviously broken.
 *
 * Scenario: "Bug: changing quantity in the cart does not update the subtotal" was just fixed.
 * Sanity = check ONLY the cart quantity feature (not login, search, products ...).
 *
 * Run only these:   npx playwright test -c "sdet-interview-prep/Ep1 - types-of-testing" --grep @sanity
 */

test.describe('sanity: cart quantity fix', { tag: '@sanity' }, () => {
  test.beforeEach(({ request }) => resetCart(request));
  test.afterEach(({ request }) => resetCart(request));

  test('increase and decrease update quantity, subtotal and total', async ({ page, request }) => {
    await addToCartViaApi(request, 'p5', 2); // Desk Lamp 39.99
    await page.goto('/cart');
    const item = page.getByTestId('cart-item').first();

    await item.getByTestId('quantity-increase').click();
    await expect(item.getByTestId('item-quantity')).toHaveText('3');
    await expect(item.getByTestId('cart-item-subtotal')).toHaveText('$119.97');

    await item.getByTestId('quantity-decrease').click();
    await expect(item.getByTestId('item-quantity')).toHaveText('2');
    await expect(page.getByTestId('cart-total')).toHaveText('$79.98');
  });
});
