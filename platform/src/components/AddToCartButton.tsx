"use client";

import { useState } from "react";

interface AddToCartButtonProps {
  productId: string;
}

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddToCart() {
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      setError("Could not add to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div data-testid="add-to-cart-section">
      <button
        onClick={handleAddToCart}
        disabled={adding}
        className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        data-testid="add-to-cart-btn"
      >
        {adding ? "Adding…" : added ? "✓ Added to Cart!" : "Add to Cart"}
      </button>
      {error && (
        <p
          className="mt-2 text-sm text-red-600"
          data-testid="add-to-cart-error"
        >
          {error}
        </p>
      )}
    </div>
  );
}
