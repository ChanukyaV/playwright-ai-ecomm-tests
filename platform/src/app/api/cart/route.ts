import { NextRequest, NextResponse } from "next/server";
import {
  getCart,
  addToCart,
  clearCart,
  getCartTotal,
} from "@/lib/cart-store";
import { getProductById } from "@/lib/products";
import { AddToCartRequest } from "@/lib/types";

export async function GET() {
  const items = getCart();
  const total = getCartTotal();
  return NextResponse.json({ items, total });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as AddToCartRequest;
  const { productId, quantity = 1 } = body;

  const product = getProductById(productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const item = addToCart(product, quantity);
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE() {
  clearCart();
  return NextResponse.json({ message: "Cart cleared" });
}
