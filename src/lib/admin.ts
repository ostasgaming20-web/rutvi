import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

export async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, session.user.email))
    .limit(1);

  if (!admin) return null;
  return { session, admin };
}

export async function requireAdmin() {
  const result = await getAdminSession();
  if (!result) redirect("/admin/login");
  return result;
}

export async function requireAdminApi() {
  const result = await getAdminSession();
  return result;
}
