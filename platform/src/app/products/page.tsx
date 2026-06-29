import { PRODUCTS } from "@/lib/products";
import ProductSearch from "@/components/ProductSearch";

export default function ProductsPage() {
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
      <ProductSearch products={PRODUCTS} />
    </main>
  );
}
