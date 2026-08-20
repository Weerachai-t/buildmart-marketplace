"use server";

import { PERMISSIONS, requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  id: z.string().optional(),
  supplierId: z.string().min(1),
  categoryId: z.string().min(1),
  brandId: z.string().optional(),
  sku: z.string().trim().min(1).max(80),
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(3000).optional(),
  unit: z.string().trim().min(1).max(40),
  basePrice: z.coerce.number().min(0),
  minOrderQty: z.coerce.number().positive(),
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "ACTIVE", "INACTIVE", "REJECTED"]),
  imageUrl: z.string().trim().max(1000).optional(),
});

function parseProduct(formData: FormData) {
  return productSchema.safeParse(Object.fromEntries(formData.entries()));
}

async function syncPrimaryImage(productId: string, imageUrl?: string) {
  await prisma.productImage.deleteMany({ where: { productId } });
  if (imageUrl) {
    await prisma.productImage.create({
      data: { productId, url: imageUrl, altText: "รูปสินค้า", sortOrder: 0 },
    });
  }
}

function refreshCatalog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/cart");
  revalidatePath("/api/products");
  revalidatePath("/admin/dashboard");
  if (slug) revalidatePath(`/products/${slug}`);
}

export async function createProduct(formData: FormData) {
  await requirePermission(PERMISSIONS.PRODUCT_MANAGE, "/admin/dashboard#products");
  const parsed = parseProduct(formData);
  if (!parsed.success) return;
  const { imageUrl, brandId, description, ...data } = parsed.data;
  const product = await prisma.product.create({
    data: {
      ...data,
      brandId: brandId || null,
      description: description || null,
    },
  });
  await syncPrimaryImage(product.id, imageUrl);
  refreshCatalog(product.slug);
}

export async function updateProduct(formData: FormData) {
  await requirePermission(PERMISSIONS.PRODUCT_MANAGE, "/admin/dashboard#products");
  const parsed = parseProduct(formData);
  if (!parsed.success || !parsed.data.id) return;
  const { id, imageUrl, brandId, description, ...data } = parsed.data;
  const previous = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      brandId: brandId || null,
      description: description || null,
    },
  });
  await syncPrimaryImage(product.id, imageUrl);
  refreshCatalog(previous?.slug);
  refreshCatalog(product.slug);
}

export async function setProductVisibility(formData: FormData) {
  await requirePermission(PERMISSIONS.PRODUCT_MANAGE, "/admin/dashboard#products");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !["ACTIVE", "INACTIVE"].includes(status)) return;
  const product = await prisma.product.update({
    where: { id },
    data: { status: status as "ACTIVE" | "INACTIVE" },
    select: { slug: true },
  });
  refreshCatalog(product.slug);
}
