import AdminToolbar from "@/components/admin-toolbar";
import { hasPermission, PERMISSIONS, requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { updateRolePermissions } from "./actions";

type AdminRole = { id: string; code: string; name: string };
type Permission = { id: string; code: string; name: string; module: string; action: string };
type Grant = { roleId: string; permissionId: string };

export default async function PermissionManagementPage() {
  const session = await requirePermission(PERMISSIONS.PERMISSION_VIEW, "/admin/permissions");
  const canManage = await hasPermission(session.user.id, session.user.roles, PERMISSIONS.PERMISSION_MANAGE);

  const [roles, permissions, grants] = await Promise.all([
    prisma.$queryRaw<AdminRole[]>`
      SELECT "id", "code"::text AS "code", "name" FROM "Role"
      WHERE "code"::text IN ('SUPER_ADMIN', 'CATEGORY_MANAGER', 'SALES_ADMIN')
      ORDER BY CASE "code"::text WHEN 'SUPER_ADMIN' THEN 1 WHEN 'SALES_ADMIN' THEN 2 ELSE 3 END
    `,
    prisma.$queryRaw<Permission[]>`
      SELECT "id", "code", "name", "module", "action" FROM "Permission"
      ORDER BY "module", "action", "name"
    `,
    prisma.$queryRaw<Grant[]>`SELECT "roleId", "permissionId" FROM "RolePermission"`,
  ]);

  const granted = new Set(grants.map((grant) => `${grant.roleId}:${grant.permissionId}`));

  return (
    <main className="admin-page">
      <div className="container">
        <AdminToolbar />
        <header className="admin-page-head">
          <div><span className="eyebrow">ROLE-BASED ACCESS CONTROL</span><h1>จัดการสิทธิ์การใช้งาน</h1><p>กำหนดสิทธิ์การมองเห็นและจัดการข้อมูลให้แต่ละ Admin Role</p></div>
        </header>

        {roles.map((role) => {
          const locked = role.code === "SUPER_ADMIN" || !canManage;
          return (
            <form className="panel permission-role" action={updateRolePermissions} key={role.id}>
              <input type="hidden" name="roleId" value={role.id} />
              <div className="permission-role-head">
                <div><h2>{role.name}</h2><small>{role.code}</small></div>
                {role.code === "SUPER_ADMIN" ? <span className="status">สิทธิ์ทั้งหมด</span> : <button className="btn" disabled={locked}>บันทึกสิทธิ์</button>}
              </div>
              <div className="permission-grid">
                {permissions.map((permission) => (
                  <label className="permission-option" key={permission.id}>
                    <input type="checkbox" name="permissions" value={permission.code} defaultChecked={role.code === "SUPER_ADMIN" || granted.has(`${role.id}:${permission.id}`)} disabled={locked} />
                    <span>{permission.name}<small>{permission.module} · {permission.action}</small></span>
                  </label>
                ))}
              </div>
            </form>
          );
        })}
      </div>
    </main>
  );
}
