import { CartItem, Product } from "./types";

// Use a global singleton so the cart survives hot-module reloads in development.
declare global {
  // eslint-disable-next-line no-var
  var __cartStore: Map<string, CartItem> | undefined;
}

const cartItems: Map<string, CartItem> =
  global.__cartStore ?? new Map<string, CartItem>();
global.__cartStore = cartItems;

export function getCart(): CartItem[] {
  return Array.from(cartItems.values());
}

export function addToCart(product: Product, quantity = 1): CartItem {
  const existing = cartItems.get(product.id);
  if (existing) {
    existing.quantity += quantity;
    return existing;
  }
  const item: CartItem = { product, quantity };
  cartItems.set(product.id, item);
  return item;
}

export function updateCartItem(
  productId: string,
  quantity: number
): CartItem | null {
  const item = cartItems.get(productId);
  if (!item) return null;
  if (quantity <= 0) {
    cartItems.delete(productId);
    return null;
  }
  item.quantity = quantity;
  return item;
}

export function removeFromCart(productId: string): boolean {
  return cartItems.delete(productId);
}

export function clearCart(): void {
  cartItems.clear();
}

export function getCartTotal(): number {
  let total = 0;
  for (const item of cartItems.values()) {
    total += item.product.price * item.quantity;
  }
  return Math.round(total * 100) / 100;
}
