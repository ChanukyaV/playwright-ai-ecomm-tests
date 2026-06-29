"use client";

import Link from "next/link";
import { useState } from "react";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAddToCart() {
    setAdding(true);
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
      data-testid="product-card"
      data-product-id={product.id}
    >
      <div
        className="h-44 flex items-center justify-center text-6xl"
        style={{ backgroundColor: product.color }}
        data-testid="product-image"
      >
        {product.emoji}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span
          className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit"
          data-testid="product-category"
        >
          {product.category}
        </span>
        <Link href={`/products/${product.id}`}>
          <h3
            className="mt-2 font-semibold text-gray-900 hover:text-blue-600 leading-snug"
            data-testid="product-name"
          >
            {product.name}
          </h3>
        </Link>
        <p
          className="mt-1 text-sm text-gray-500 line-clamp-2 flex-1"
          data-testid="product-description"
        >
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span
            className="text-lg font-bold text-gray-900"
            data-testid="product-price"
          >
            ${product.price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500" data-testid="product-rating">
            ⭐ {product.rating}
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          {added ? (
            <Link
              href="/cart"
              className="flex-1 text-center bg-green-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-green-700 transition-colors"
              data-testid="go-to-cart-btn"
            >
              🛒 Go to Cart
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              data-testid="add-to-cart-btn"
            >
              {adding ? "Adding…" : "Add to Cart"}
            </button>
          )}
          <Link
            href={`/products/${product.id}`}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-colors"
            data-testid="view-details-btn"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
