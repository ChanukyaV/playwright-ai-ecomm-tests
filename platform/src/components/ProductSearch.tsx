"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface ProductSearchProps {
  products: Product[];
}

export default function ProductSearch({ products }: ProductSearchProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  return (
    <>
      <div className="mb-6">
        <input
          type="search"
          placeholder="Search products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          data-testid="product-search-input"
        />
        {query.trim() && (
          <p className="text-sm text-gray-500 mt-2" data-testid="search-result-count">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        data-testid="product-grid"
      >
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p
            className="col-span-full text-center text-gray-500 py-12"
            data-testid="no-search-results"
          >
            No products found for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </>
  );
}
