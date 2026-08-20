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

  console.log("Super Admin account is ready.");
}

main()
  .catch((error) => {
    console.error("Unable to seed the administrator account.", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
