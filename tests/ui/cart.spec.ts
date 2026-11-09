import { expect, test } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { CartPage } from '../../pages/cart.page';

test.describe('ShopLab UI - Cart', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => {
    const response = await request.delete('/api/cart');
    expect(response.status()).toBe(200);
  });

  test.afterEach(async ({ request }) => {
    const response = await request.delete('/api/cart');
    expect(response.status()).toBe(200);
  });

  test('UI-11: Increase Quantity Updates Subtotal And Total', async ({ page }) => {
    const homePage = new HomePage(page);
    const cartPage = new CartPage(page);

    // Open /products
    await homePage.navigate();

    // Add Mechanical Keyboard to cart
    const keyboardCard = await homePage.getProductByName('Mechanical Keyboard');
    await keyboardCard.clickAddToCart();
    await expect(keyboardCard.goToCartLink).toBeVisible();

    // Open /cart
    await cartPage.navigate();
    await expect(cartPage.cartItems).toHaveCount(1);
    const cartItem = await cartPage.getCartItemByIndex(0);
    await expect(cartItem.productName).toHaveText('Mechanical Keyboard');
    await expect(cartItem.quantity).toHaveText('1');

    // Click Increase quantity (+)
    await cartItem.clickIncrease();

    // Verify quantity, subtotal and cart total are updated
    await expect(cartItem.quantity).toHaveText('2');
    await expect(cartItem.subtotal).toHaveText('$259.98');
    await expect(cartPage.cartTotal).toHaveText('$259.98');
  });
});
