import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { can, normalizeRole, PermissionError, type Capability, type Role } from "@/lib/permissions";

export type AdminSession = {
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
  admin: typeof adminUsers.$inferSelect;
  role: Role;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, session.user.email))
    .limit(1);

  if (!admin || !admin.isActive) return null;
  return { session, admin, role: normalizeRole(admin.role) };
}

export async function requireAdmin() {
  const result = await getAdminSession();
  if (!result) redirect("/admin/login");
  return result;
}

export async function requireAdminApi() {
  return getAdminSession();
}

export function assertCapability(result: AdminSession, capability: Capability) {
  if (!can(result.role, capability)) {
    throw new PermissionError();
  }
}

export async function requireCapability(capability: Capability) {
  const result = await requireAdmin();
  if (!can(result.role, capability)) {
    redirect(`/admin?denied=${encodeURIComponent(capability)}`);
  }
  return result;
}

export async function requireSuperAdmin() {
  const result = await requireAdmin();
  if (result.role !== "super_admin") redirect("/admin?denied=super_admin");
  return result;
}
