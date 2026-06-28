import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/products";

export async function GET() {
  return NextResponse.json(PRODUCTS);
}
