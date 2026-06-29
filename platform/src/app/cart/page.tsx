"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Cart } from "@/lib/types";

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchCart = useCallback(async () => {
    const res = await fetch("/api/cart");
    const data = (await res.json()) as Cart;
    setCart(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  async function handleRemove(productId: string) {
    await fetch(`/api/cart/${productId}`, { method: "DELETE" });
    await fetchCart();
  }

  async function handleQuantityChange(productId: string, quantity: number) {
    await fetch(`/api/cart/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    await fetchCart();
  }

  async function handleClearCart() {
    await fetch("/api/cart", { method: "DELETE" });
    await fetchCart();
  }

  async function handleCheckout() {
    setCheckingOut(true);
    await fetch("/api/cart", { method: "DELETE" });
    setCart({ items: [], total: 0 });
    setCheckingOut(false);
    setCheckoutDone(true);
  }

  if (loading) {
    return (
      <main
        className="max-w-4xl mx-auto px-6 py-8 w-full"
        data-testid="cart-page"
      >
        <p className="text-gray-500" data-testid="cart-loading">
          Loading cart…
        </p>
      </main>
    );
  }

  if (checkoutDone) {
    return (
      <main
        className="max-w-4xl mx-auto px-6 py-8 w-full"
        data-testid="cart-page"
      >
        <div className="text-center py-20" data-testid="order-success">
          <p className="text-7xl mb-6">🎉</p>
          <h2
            className="text-3xl font-bold text-gray-900 mb-3"
            data-testid="order-success-title"
          >
            Order Placed Successfully!
          </h2>
          <p
            className="text-gray-500 text-lg mb-8"
            data-testid="order-success-message"
          >
            Thank you for your purchase. Your order is being processed and will
            be shipped soon.
          </p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white font-semibold py-3 px-10 rounded-xl hover:bg-blue-700 transition-colors"
            data-testid="continue-shopping-btn"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="max-w-4xl mx-auto px-6 py-8 w-full"
      data-testid="cart-page"
    >
      <h1
        className="text-2xl font-bold text-gray-900 mb-6"
        data-testid="cart-title"
      >
        Shopping Cart
      </h1>

      {cart.items.length === 0 ? (
        <div className="text-center py-16" data-testid="empty-cart">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <Link
            href="/products"
            className="text-blue-600 hover:underline font-medium"
            data-testid="continue-shopping"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4" data-testid="cart-items">
            {cart.items.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
                data-testid="cart-item"
                data-product-id={item.product.id}
              >
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ backgroundColor: item.product.color }}
                  data-testid="cart-item-image"
                >
                  {item.product.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.id}`}>
                    <p
                      className="font-semibold text-gray-900 hover:text-blue-600 truncate"
                      data-testid="cart-item-name"
                    >
                      {item.product.name}
                    </p>
                  </Link>
                  <p
                    className="text-sm text-gray-500 mt-1"
                    data-testid="cart-item-price"
                  >
                    ${item.product.price.toFixed(2)} each
                  </p>
                </div>
                <div
                  className="flex items-center gap-2"
                  data-testid="quantity-controls"
                >
                  <button
                    onClick={() =>
                      handleQuantityChange(
                        item.product.id,
                        item.quantity - 1
                      )
                    }
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-colors"
                    data-testid="quantity-decrease"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span
                    className="w-8 text-center font-medium"
                    data-testid="item-quantity"
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleQuantityChange(
                        item.product.id,
                        item.quantity + 1
                      )
                    }
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-colors"
                    data-testid="quantity-increase"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <p
                  className="font-semibold text-gray-900 w-20 text-right"
                  data-testid="cart-item-subtotal"
                >
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => handleRemove(item.product.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                  data-testid="remove-item-btn"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div
            className="bg-white rounded-xl border border-gray-200 p-6"
            data-testid="cart-summary"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-semibold text-gray-900">
                Order Total
              </span>
              <span
                className="text-2xl font-bold text-gray-900"
                data-testid="cart-total"
              >
                ${cart.total.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClearCart}
                className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:border-red-500 hover:text-red-500 transition-colors"
                data-testid="clear-cart-btn"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                data-testid="checkout-btn"
              >
                {checkingOut ? "Placing Order…" : "Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
