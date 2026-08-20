import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 12) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters) before seeding.",
    );
  }

  const role = await prisma.role.upsert({
    where: { code: "SUPER_ADMIN" },
    update: { name: "Super Admin" },
    create: { code: "SUPER_ADMIN", name: "Super Admin" },
  });

  const adminRoles = [
    { code: "CATEGORY_MANAGER" as const, name: "Category Manager" },
    { code: "SALES_ADMIN" as const, name: "Sales Admin" },
  ];

  for (const adminRole of adminRoles) {
    await prisma.role.upsert({
      where: { code: adminRole.code },
      update: { name: adminRole.name },
      create: adminRole,
    });
  }

  const permissions = [
    ["ADMIN_DASHBOARD_VIEW", "ดูหน้า Admin Dashboard", "ADMIN", "VIEW"],
    ["USER_VIEW", "ดูข้อมูลผู้ใช้งาน", "USER", "VIEW"],
    ["USER_MANAGE", "จัดการผู้ใช้งาน", "USER", "MANAGE"],
    ["PERMISSION_VIEW", "ดูการกำหนดสิทธิ์", "PERMISSION", "VIEW"],
    ["PERMISSION_MANAGE", "จัดการสิทธิ์", "PERMISSION", "MANAGE"],
    ["RFQ_VIEW", "ดูคำขอใบเสนอราคา", "RFQ", "VIEW"],
    ["RFQ_APPROVE", "อนุมัติคำขอใบเสนอราคา", "RFQ", "MANAGE"],
    ["PRODUCT_VIEW", "ดูข้อมูลสินค้า", "PRODUCT", "VIEW"],
    ["PRODUCT_MANAGE", "จัดการสินค้า", "PRODUCT", "MANAGE"],
    ["ORDER_VIEW", "ดูคำสั่งซื้อ", "ORDER", "VIEW"],
    ["ORDER_MANAGE", "จัดการคำสั่งซื้อ", "ORDER", "MANAGE"],
  ] as const;

  for (const [code, name, module, action] of permissions) {
    await prisma.$executeRaw`
      INSERT INTO "Permission" ("id", "code", "name", "module", "action", "createdAt", "updatedAt")
      VALUES (${randomUUID()}, ${code}, ${name}, ${module}, ${action}, NOW(), NOW())
      ON CONFLICT ("code") DO UPDATE
      SET "name" = EXCLUDED."name", "module" = EXCLUDED."module", "action" = EXCLUDED."action", "updatedAt" = NOW()
    `;
  }

  const defaultGrants = [
    ["CATEGORY_MANAGER", "ADMIN_DASHBOARD_VIEW"],
    ["CATEGORY_MANAGER", "PRODUCT_VIEW"],
    ["CATEGORY_MANAGER", "PRODUCT_MANAGE"],
    ["SALES_ADMIN", "ADMIN_DASHBOARD_VIEW"],
    ["SALES_ADMIN", "RFQ_VIEW"],
    ["SALES_ADMIN", "RFQ_APPROVE"],
    ["SALES_ADMIN", "ORDER_VIEW"],
    ["SALES_ADMIN", "ORDER_MANAGE"],
  ] as const;

  for (const [roleCode, permissionCode] of defaultGrants) {
    await prisma.$executeRaw`
      INSERT INTO "RolePermission" ("roleId", "permissionId")
      SELECT r."id", p."id"
      FROM "Role" r, "Permission" p
      WHERE r."code"::text = ${roleCode} AND p."code" = ${permissionCode}
      ON CONFLICT ("roleId", "permissionId") DO NOTHING
    `;
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "BuildMart Administrator",
      passwordHash: await bcrypt.hash(password, 12),
      status: "ACTIVE",
    },
    create: {
      email,
      name: "BuildMart Administrator",
      passwordHash: await bcrypt.hash(password, 12),
      status: "ACTIVE",
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });

  const supplier = await prisma.supplier.upsert({
    where: { ownerId: user.id },
    update: { status: "APPROVED" },
    create: { ownerId: user.id, companyName: "BuildMart Direct", slug: "buildmart-direct", province: "กรุงเทพมหานคร", status: "APPROVED" },
  });

  const categoryNames = ["ปูนซีเมนต์", "คอนกรีตผสมเสร็จ", "เหล็ก", "หลังคา", "สี", "กระเบื้อง", "อุปกรณ์ไฟฟ้า", "ประปา"];
  const categoryMap = new Map<string, string>();
  for (const [index, name] of categoryNames.entries()) {
    const category = await prisma.category.upsert({ where: { slug: `category-${index + 1}` }, update: { name }, create: { name, slug: `category-${index + 1}` } });
    categoryMap.set(name, category.id);
  }

  const brandNames = ["SCG", "BUILD MIX", "TATA", "Diamond", "TOA", "COTTO"];
  const brandMap = new Map<string, string>();
  for (const name of brandNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const brand = await prisma.brand.upsert({ where: { slug }, update: { name }, create: { name, slug } });
    brandMap.set(name, brand.id);
  }

  const starterProducts = [
    { slug: "portland-cement-50kg", sku: "BM-CEMENT-001", name: "ปูนซีเมนต์ปอร์ตแลนด์ 50 กก.", category: "ปูนซีเมนต์", brand: "SCG", unit: "ถุง", price: 145, image: "▰", description: "ปูนซีเมนต์ปอร์ตแลนด์ประเภท 1 มาตรฐาน มอก. 15" },
    { slug: "ready-mix-280ksc", sku: "BM-CONCRETE-001", name: "คอนกรีตผสมเสร็จ 280 KSC", category: "คอนกรีตผสมเสร็จ", brand: "BUILD MIX", unit: "คิว", price: 2150, image: "▦", description: "คอนกรีตผสมเสร็จกำลังอัด 280 KSC สำหรับงานโครงสร้าง" },
    { slug: "deformed-bar-12mm", sku: "BM-STEEL-001", name: "เหล็กข้ออ้อย SD40 DB12", category: "เหล็ก", brand: "TATA", unit: "เส้น", price: 192, image: "═", description: "เหล็กข้ออ้อยเกรด SD40 ขนาด 12 มม. ความยาว 10 เมตร" },
    { slug: "roof-tile-prestige", sku: "BM-ROOF-001", name: "กระเบื้องหลังคา Prestige", category: "หลังคา", brand: "Diamond", unit: "แผ่น", price: 68, image: "⌂", description: "กระเบื้องหลังคาสีเทาโมเดิร์น สำหรับบ้านพักอาศัย" },
    { slug: "interior-paint-9l", sku: "BM-PAINT-001", name: "สีน้ำอะคริลิกภายใน 9 ลิตร", category: "สี", brand: "TOA", unit: "ถัง", price: 1290, image: "◉", description: "สีน้ำอะคริลิกสำหรับงานภายใน ขนาด 9 ลิตร" },
    { slug: "porcelain-tile-60", sku: "BM-TILE-001", name: "กระเบื้องพอร์ซเลน 60×60 ซม.", category: "กระเบื้อง", brand: "COTTO", unit: "กล่อง", price: 699, image: "▦", description: "กระเบื้องพอร์ซเลนผิวด้าน ขนาด 60 × 60 ซม." },
  ];

  for (const item of starterProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: item.slug } });
    if (existing) continue;
    await prisma.product.create({ data: { supplierId: supplier.id, categoryId: categoryMap.get(item.category)!, brandId: brandMap.get(item.brand), sku: item.sku, name: item.name, slug: item.slug, description: item.description, unit: item.unit, basePrice: item.price, minOrderQty: 1, status: "ACTIVE", images: { create: { url: item.image, altText: item.name } } } });
  }

  console.log("Super Admin account is ready.");
}

main()
  .catch((error) => {
    console.error("Unable to seed the administrator account.", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
