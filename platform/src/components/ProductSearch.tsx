"use client";

import { useEffect, useMemo, useState } from "react";
import { Product } from "@/lib/types";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  filterProducts,
  getCategories,
  paginate,
} from "@/lib/catalog";
import ProductCard from "./ProductCard";

interface ProductSearchProps {
  products: Product[];
  initialQuery?: string;
  initialCategory?: string;
  initialPage?: number;
  initialPageSize?: number;
}

/** 1 … 4 5 [6] 7 8 … 20 — always includes first, last and a window around current. */
function getPageItems(current: number, total: number): (number | "…")[] {
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const items: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push("…");
    items.push(p);
  });
  return items;
}

export default function ProductSearch({
  products,
  initialQuery = "",
  initialCategory = "all",
  initialPage = 1,
  initialPageSize = DEFAULT_PAGE_SIZE,
}: ProductSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const categories = useMemo(() => getCategories(products), [products]);
  const filtered = useMemo(
    () => filterProducts(products, { q: query, category }),
    [products, query, category]
  );

  const result = paginate(filtered, 1, pageSize);
  // Clamp so a stale / hand-edited ?page=999 still lands on a real page.
  const currentPage = Math.min(Math.max(1, page), result.totalPages);
  const { items, total, totalPages } = paginate(filtered, currentPage, pageSize);
  const firstShown = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastShown = Math.min(currentPage * pageSize, total);

  // Keep the URL shareable / reload-safe without triggering a navigation.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query);
    if (category !== "all") params.set("category", category);
    if (currentPage > 1) params.set("page", String(currentPage));
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set("pageSize", String(pageSize));
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [query, category, currentPage, pageSize]);

  function changeQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function changeCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  function changePageSize(value: number) {
    setPageSize(value);
    setPage(1);
  }

  function goToPage(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search products…"
          value={query}
          onChange={(e) => changeQuery(e.target.value)}
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
        className="flex flex-wrap gap-2 mb-6"
        role="group"
        aria-label="Filter by category"
        data-testid="category-filter"
      >
        {[{ name: "all", label: "All", count: products.length }, ...categories.map((c) => ({ name: c.name, label: c.name, count: c.count }))].map(
          (c) => {
            const active = category.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => changeCategory(c.name)}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-600"
                }`}
                data-testid={`category-chip-${c.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {c.label} ({c.count})
              </button>
            );
          }
        )}
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        data-testid="product-grid"
      >
        {items.length > 0 ? (
          items.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <p
            className="col-span-full text-center text-gray-500 py-12"
            data-testid="no-search-results"
          >
            No products found{query.trim() ? <> for &ldquo;{query}&rdquo;</> : null}
          </p>
        )}
      </div>

      {total > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600" data-testid="pagination-summary">
            Showing {firstShown}–{lastShown} of {total} products
          </p>

          {totalPages > 1 && (
            <nav
              className="flex items-center gap-1"
              aria-label="Pagination"
              data-testid="pagination"
            >
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-40"
                data-testid="pagination-prev"
              >
                Previous
              </button>
              {getPageItems(currentPage, totalPages).map((item, i) =>
                item === "…" ? (
                  <span key={`gap-${i}`} className="px-2 text-gray-400" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => goToPage(item)}
                    aria-current={item === currentPage ? "page" : undefined}
                    aria-label={`Page ${item}`}
                    className={`min-w-9 px-3 py-1.5 rounded-lg border text-sm ${
                      item === currentPage
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:border-blue-600"
                    }`}
                    data-testid={`pagination-page-${item}`}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-40"
                data-testid="pagination-next"
              >
                Next
              </button>
            </nav>
          )}

          <label className="text-sm text-gray-600 flex items-center gap-2">
            Per page
            <select
              value={pageSize}
              onChange={(e) => changePageSize(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
              data-testid="page-size-select"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </>
  );
}
