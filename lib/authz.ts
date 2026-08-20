export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "CATEGORY_MANAGER",
  "SALES_ADMIN",
] as const;

export function hasAdminAccess(roles: string[] | undefined) {
  return roles?.some((role) =>
    ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]),
  ) ?? false;
}
