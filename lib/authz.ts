import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "CATEGORY_MANAGER",
  "SALES_ADMIN",
] as const;

export const PERMISSIONS = {
  ADMIN_DASHBOARD_VIEW: "ADMIN_DASHBOARD_VIEW",
  USER_VIEW: "USER_VIEW",
  USER_MANAGE: "USER_MANAGE",
  PERMISSION_VIEW: "PERMISSION_VIEW",
  PERMISSION_MANAGE: "PERMISSION_MANAGE",
  RFQ_VIEW: "RFQ_VIEW",
  RFQ_APPROVE: "RFQ_APPROVE",
  PRODUCT_VIEW: "PRODUCT_VIEW",
  PRODUCT_MANAGE: "PRODUCT_MANAGE",
  ORDER_VIEW: "ORDER_VIEW",
  ORDER_MANAGE: "ORDER_MANAGE",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function hasAdminAccess(roles: string[] | undefined) {
  return roles?.some((role) =>
    ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]),
  ) ?? false;
}

export async function hasPermission(
  userId: string,
  roles: string[] | undefined,
  permission: PermissionCode,
) {
  if (roles?.includes("SUPER_ADMIN")) return true;

  const matches = await prisma.$queryRaw<Array<{ allowed: number }>>`
    SELECT 1 AS "allowed"
    FROM "UserRole" ur
    INNER JOIN "RolePermission" rp ON rp."roleId" = ur."roleId"
    INNER JOIN "Permission" p ON p."id" = rp."permissionId"
    WHERE ur."userId" = ${userId} AND p."code" = ${permission}
    LIMIT 1
  `;

  return matches.length > 0;
}

export async function requirePermission(
  permission: PermissionCode,
  callbackUrl: string,
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (!(await hasPermission(session.user.id, session.user.roles, permission))) {
    redirect("/unauthorized");
  }

  return session;
}
