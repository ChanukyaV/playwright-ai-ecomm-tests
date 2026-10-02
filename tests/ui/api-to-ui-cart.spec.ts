import { expect, test } from '@playwright/test';
import { CartPage } from '../../pages/cart.page';

test('API-to-UI: cart quantity and totals stay in sync', async ({ page, request }) => {
  const clearResponse = await request.delete('/api/cart');
  expect(clearResponse.status()).toBe(200);

  try {
    const addResponse = await request.post('/api/cart', {
      data: { productId: 'p2', quantity: 2 },
    });

    expect(addResponse.status()).toBe(201);
    await expect(addResponse.json()).resolves.toMatchObject({
      product: { id: 'p2', name: 'Mechanical Keyboard', price: 129.99 },
      quantity: 2,
    });

    const cartPage = new CartPage(page);
    await cartPage.navigate();

    const cartItem = await cartPage.getCartItemByIndex(0);
    await expect(cartItem.productName).toHaveText('Mechanical Keyboard');
    await expect(cartItem.quantity).toHaveText('2');
    await expect(cartItem.subtotal).toHaveText('$259.98');
    await expect(page.getByTestId('cart-total')).toHaveText('$259.98');

    await cartItem.clickIncrease();

    await expect(cartItem.quantity).toHaveText('3');
    await expect(cartItem.subtotal).toHaveText('$389.97');
    await expect(page.getByTestId('cart-total')).toHaveText('$389.97');

    const getCartResponse = await request.get('/api/cart');
    expect(getCartResponse.status()).toBe(200);
    await expect(getCartResponse.json()).resolves.toMatchObject({
      items: [{ product: { id: 'p2' }, quantity: 3 }],
      total: 389.97,
    });
  } finally {
    const cleanupResponse = await request.delete('/api/cart');
    expect(cleanupResponse.status()).toBe(200);
  }
});