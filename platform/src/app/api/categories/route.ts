import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/products";
import { getCategories } from "@/lib/catalog";

// GET /api/categories → [{ name, count }]
export async function GET() {
  return NextResponse.json(getCategories(PRODUCTS));
}
