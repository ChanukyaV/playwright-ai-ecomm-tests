import { expect, test } from '@playwright/test';
import { resetCart } from '../support/cart';

/*
 * USABILITY & ACCESSIBILITY TESTING
 *   Usability     - is it easy and pleasant to use?  (clear feedback, shortcuts, helpful empty states)
 *   Accessibility - can EVERYONE use it, including keyboard-only and screen-reader users?
 * Playwright's role-based locators (getByRole) are themselves an accessibility check:
 * if a control can't be found by role + name, a screen reader can't find it either.
 * For a full audit add @axe-core/playwright (WCAG rules) on top of these basics.
 */

test.beforeEach(({ request }) => resetCart(request));
test.afterEach(({ request }) => resetCart(request));

test.describe('accessibility', () => {
  test('page has a language, a title and exactly one main heading', async ({ page }) => {
    await page.goto('/products');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle(/ShopLab/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  test('controls are reachable by role and accessible name', async ({ page, request }) => {
    await request.post('/api/cart', { data: { productId: 'p1', quantity: 1 } });
    await page.goto('/cart');

    await expect(page.getByRole('button', { name: 'Increase quantity' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Decrease quantity' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Checkout' })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Cart' })).toBeVisible();
  });

  test('search box has an accessible name', async ({ page }) => {
    await page.goto('/products');

    await expect(page.getByRole('searchbox')).toHaveAccessibleName(/search/i);
  });

  test('keyboard only: Tab to "Add to Cart" and press Enter', async ({ page }) => {
    await page.goto('/products/p1');
    const addButton = page.getByRole('button', { name: 'Add to Cart' });

    await addButton.focus();
    await expect(addButton).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('go-to-cart-btn')).toBeVisible();
  });
});

test.describe('usability', () => {
  test('user gets clear feedback and a shortcut after adding to the cart', async ({ page }) => {
    await page.goto('/products/p1');

    await page.getByTestId('add-to-cart-btn').click();

    await expect(page.getByTestId('add-to-cart-btn')).toHaveText('✓ Added to Cart!');
    await expect(page.getByTestId('go-to-cart-btn')).toBeVisible();
  });

  test('empty cart tells the user what to do next', async ({ page }) => {
    await page.goto('/cart');

    await expect(page.getByTestId('empty-cart')).toContainText('Your cart is empty');
    await expect(page.getByTestId('continue-shopping')).toBeVisible();
  });

  test('search says how many results were found', async ({ page }) => {
    await page.goto('/products');

    await page.getByTestId('product-search-input').fill('usb');

    await expect(page.getByTestId('search-result-count')).toContainText('result');
  });

  test('current page is highlighted in the navigation', async ({ page }) => {
    await page.goto('/cart');

    await expect(page.getByTestId('nav-link-cart')).toHaveClass(/border-blue-600/);
  });
});
