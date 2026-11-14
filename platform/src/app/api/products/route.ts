import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/products";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  filterProducts,
  paginate,
  parsePositiveInt,
} from "@/lib/catalog";

/**
 * GET /api/products
 *
 * - No query params          → plain array of ALL products (backwards compatible).
 * - Any of page, pageSize,
 *   category, q              → paginated envelope:
 *     { items, page, pageSize, total, totalPages }
 *
 * Query params: page (default 1), pageSize (default 12, max 100),
 * category (case-insensitive exact match), q (matches name/category/description).
 * A page beyond totalPages returns 200 with an empty `items` array.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const paginated = ["page", "pageSize", "category", "q"].some((k) => params.has(k));

  if (!paginated) {
    return NextResponse.json(PRODUCTS);
  }

  const pageParam = params.get("page");
  const pageSizeParam = params.get("pageSize");

  const page = pageParam === null ? 1 : parsePositiveInt(pageParam);
  if (page === undefined) {
    return NextResponse.json(
      { error: "Invalid page: must be a positive integer" },
      { status: 400 }
    );
  }

  const pageSize =
    pageSizeParam === null ? DEFAULT_PAGE_SIZE : parsePositiveInt(pageSizeParam);
  if (pageSize === undefined || pageSize > MAX_PAGE_SIZE) {
    return NextResponse.json(
      { error: `Invalid pageSize: must be an integer between 1 and ${MAX_PAGE_SIZE}` },
      { status: 400 }
    );
  }

  const filtered = filterProducts(PRODUCTS, {
    q: params.get("q") ?? undefined,
    category: params.get("category") ?? undefined,
  });

  return NextResponse.json(paginate(filtered, page, pageSize));
}
