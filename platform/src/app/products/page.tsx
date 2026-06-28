import { PRODUCTS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

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
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        data-testid="product-grid"
      >
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
