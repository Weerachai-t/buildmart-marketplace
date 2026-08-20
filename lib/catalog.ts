import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/types";

const productInclude = {
  category: { select: { name: true } },
  brand: { select: { name: true } },
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  inventory: { select: { quantity: true } },
};

type CatalogRecord = Awaited<ReturnType<typeof prisma.product.findFirst>> & {
  category: { name: string };
  brand: { name: string } | null;
  images: Array<{ url: string }>;
  inventory: Array<{ quantity: { toNumber(): number } }>;
};

function toCatalogProduct(record: CatalogRecord): Product {
  const price = Number(record.basePrice);
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    category: record.category.name,
    brand: record.brand?.name ?? "BuildMart",
    unit: record.unit,
    price,
    oldPrice: price,
    stock: record.inventory.reduce((sum, item) => sum + Number(item.quantity), 0),
    rating: 4.8,
    image: record.images[0]?.url ?? "▦",
    badges: ["พร้อมจำหน่าย"],
    description: record.description ?? "",
    specs: {
      SKU: record.sku,
      "จำนวนสั่งขั้นต่ำ": `${Number(record.minOrderQty)} ${record.unit}`,
      หมวดหมู่: record.category.name,
    },
  };
}

export async function getActiveProducts(limit?: number) {
  const records = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: productInclude,
    orderBy: { updatedAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });

  return records.map((record) => toCatalogProduct(record as CatalogRecord));
}

export async function getActiveProductBySlug(slug: string) {
  const record = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: productInclude,
  });

  return record ? toCatalogProduct(record as CatalogRecord) : null;
}

export async function getActiveCategories() {
  const categories = await prisma.category.findMany({
    where: { products: { some: { status: "ACTIVE" } } },
    orderBy: { name: "asc" },
    select: { name: true },
  });
  return categories.map((category) => category.name);
}
