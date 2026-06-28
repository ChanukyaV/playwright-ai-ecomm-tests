import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById } from "@/lib/products";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main
      className="max-w-4xl mx-auto px-6 py-8 w-full"
      data-testid="product-detail-page"
    >
      <Link
        href="/products"
        className="text-blue-600 hover:underline text-sm mb-6 inline-block"
        data-testid="back-to-products"
      >
        ← Back to Products
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <div
          className="rounded-2xl h-80 flex items-center justify-center text-8xl"
          style={{ backgroundColor: product.color }}
          data-testid="product-detail-image"
        >
          {product.emoji}
        </div>
        <div className="flex flex-col gap-4">
          <span
            className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit"
            data-testid="product-detail-category"
          >
            {product.category}
          </span>
          <h1
            className="text-3xl font-bold text-gray-900"
            data-testid="product-detail-name"
          >
            {product.name}
          </h1>
          <p
            className="text-gray-600 leading-relaxed"
            data-testid="product-detail-description"
          >
            {product.description}
          </p>
          <div className="flex items-center gap-4">
            <span
              className="text-3xl font-bold text-gray-900"
              data-testid="product-detail-price"
            >
              ${product.price.toFixed(2)}
            </span>
            <span
              className="text-gray-500"
              data-testid="product-detail-rating"
            >
              ⭐ {product.rating} / 5
            </span>
          </div>
          <p
            className={`text-sm font-medium ${
              product.stock > 0 ? "text-green-600" : "text-red-600"
            }`}
            data-testid="product-detail-stock"
          >
            {product.stock > 0
              ? `In Stock — ${product.stock} available`
              : "Out of Stock"}
          </p>
          <AddToCartButton productId={product.id} />
        </div>
      </div>
    </main>
  );
}
