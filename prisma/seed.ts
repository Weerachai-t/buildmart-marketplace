import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
