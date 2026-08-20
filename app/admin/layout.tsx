import { auth } from "@/auth";
import { hasAdminAccess } from "@/lib/authz";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  if (!hasAdminAccess(session.user.roles)) {
    redirect("/unauthorized");
  }

  return children;
}
