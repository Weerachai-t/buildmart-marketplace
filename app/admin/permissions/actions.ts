"use server";

import { PERMISSIONS, requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateRolePermissions(formData: FormData) {
  await requirePermission(PERMISSIONS.PERMISSION_MANAGE, "/admin/permissions");

  const roleId = String(formData.get("roleId") || "");
  const requestedCodes = formData.getAll("permissions").map(String);

  const roles = await prisma.$queryRaw<Array<{ id: string; code: string }>>`
    SELECT "id", "code"::text AS "code" FROM "Role" WHERE "id" = ${roleId} LIMIT 1
  `;

  if (!roles[0] || roles[0].code === "SUPER_ADMIN") return;

  const allPermissions = await prisma.$queryRaw<Array<{ id: string; code: string }>>`
    SELECT "id", "code" FROM "Permission"
  `;
  const requested = new Set(requestedCodes);
  const validPermissions = allPermissions.filter((permission) => requested.has(permission.code));

  await prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`DELETE FROM "RolePermission" WHERE "roleId" = ${roleId}`;
    for (const permission of validPermissions) {
      await transaction.$executeRaw`
        INSERT INTO "RolePermission" ("roleId", "permissionId")
        VALUES (${roleId}, ${permission.id})
        ON CONFLICT ("roleId", "permissionId") DO NOTHING
      `;
    }
  });

  revalidatePath("/admin/permissions");
}
