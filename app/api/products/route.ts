import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { const { searchParams } = new URL(request.url); const q = (searchParams.get("q") || "").toLowerCase(); const products = await getActiveProducts(); return NextResponse.json(products.filter((product) => !q || `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(q))); }
