import { PERMISSIONS, requirePermission } from "@/lib/authz";
import "./admin.css";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requirePermission(PERMISSIONS.ADMIN_DASHBOARD_VIEW, "/admin/dashboard");

  return children;
}
