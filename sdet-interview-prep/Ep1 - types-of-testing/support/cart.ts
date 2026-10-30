import { APIRequestContext, expect } from '@playwright/test';

// Small helpers so every example starts from a known state (empty cart).
export async function resetCart(request: APIRequestContext) {
  const res = await request.delete('/api/cart');
  expect(res.status()).toBe(200);
}

export async function addToCartViaApi(request: APIRequestContext, productId: string, quantity = 1) {
  const res = await request.post('/api/cart', { data: { productId, quantity } });
  expect(res.status()).toBe(201);
  return res.json();
}
