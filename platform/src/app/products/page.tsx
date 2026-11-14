import { PRODUCTS } from "@/lib/products";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  parsePositiveInt,
} from "@/lib/catalog";
import ProductSearch from "@/components/ProductSearch";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  page?: string;
  pageSize?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const requestedSize = parsePositiveInt(sp.pageSize);
  const pageSize = (PAGE_SIZE_OPTIONS as readonly number[]).includes(requestedSize ?? -1)
    ? (requestedSize as number)
    : DEFAULT_PAGE_SIZE;

  return (
    <main
      className="max-w-7xl mx-auto px-6 py-8 w-full"
      data-testid="products-page"
    >
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-gray-900"
          data-testid="page-title"
        >
          All Products
        </h1>
        <p className="text-gray-500 mt-1" data-testid="product-count">
          {PRODUCTS.length} products available
        </p>
      </div>
      <ProductSearch
        products={PRODUCTS}
        initialQuery={sp.q ?? ""}
        initialCategory={sp.category ?? "all"}
        initialPage={parsePositiveInt(sp.page) ?? 1}
        initialPageSize={pageSize}
      />
    </main>
  );
}
