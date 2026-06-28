import { NextRequest, NextResponse } from "next/server";
import { removeFromCart, updateCartItem } from "@/lib/cart-store";
import { UpdateCartRequest } from "@/lib/types";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const removed = removeFromCart(productId);

  if (!removed) {
    return NextResponse.json(
      { error: "Item not found in cart" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Item removed" });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const body = (await request.json()) as UpdateCartRequest;
  const item = updateCartItem(productId, body.quantity);

  if (item === null && body.quantity > 0) {
    return NextResponse.json(
      { error: "Item not found in cart" },
      { status: 404 }
    );
  }

  return NextResponse.json(item ?? { message: "Item removed" });
}
