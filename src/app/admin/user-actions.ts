"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, count, eq, ne } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { account, user } from "@/lib/db/auth-schema";
import { requireSuperAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { ROLES, ROLE_LABELS } from "@/lib/permissions";
import { bool, redirectPath, text } from "@/lib/form";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeRole(role: string) {
  return ROLES.includes(role as (typeof ROLES)[number]) ? role : "viewer";
}

async function superAdminCount(excludeId?: number) {
  const [row] = await db
    .select({ value: count() })
    .from(adminUsers)
    .where(
      excludeId
        ? and(eq(adminUsers.role, "super_admin"), ne(adminUsers.id, excludeId))
        : eq(adminUsers.role, "super_admin"),
    );
  return Number(row.value);
}

export async function createAdminUser(formData: FormData) {
  const actor = await requireSuperAdmin();
  const email = text(formData, "email").toLowerCase();
  const name = text(formData, "name");
  const password = text(formData, "password");
  const role = normalizeRole(text(formData, "role"));

  if (!EMAIL_PATTERN.test(email)) redirect(redirectPath("/admin/users", { error: "Enter a valid email address." }));
  if (name.length < 2) redirect(redirectPath("/admin/users", { error: "Enter the team member's name." }));
  if (password.length < 8) redirect(redirectPath("/admin/users", { error: "Passwords must be at least 8 characters." }));

  const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  if (existing) redirect(redirectPath("/admin/users", { error: "An account with that email already exists." }));

  const userId = randomUUID();
  const hashed = await hashPassword(password);

  await db.insert(user).values({ id: userId, name, email, emailVerified: true });
  await db.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashed,
  });
  await db.insert(adminUsers).values({
    userId,
    email,
    role,
    isActive: true,
    createdBy: actor.session.user.email,
  });

  await logAudit({
    actorEmail: actor.session.user.email,
    action: "user.create",
    entity: "admin_user",
    entityId: email,
    meta: { role, name },
  });
  revalidatePath("/admin/users");
  redirect(redirectPath("/admin/users", { ok: `${name} added as ${ROLE_LABELS[role as keyof typeof ROLE_LABELS]}.` }));
}

export async function updateAdminUser(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = Number(text(formData, "id"));
  if (!id) return;

  const [target] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  if (!target) redirect(redirectPath("/admin/users", { error: "User not found." }));

  const role = normalizeRole(text(formData, "role"));
  const isActive = bool(formData, "isActive");
  const isSelf = target.email === actor.session.user.email;

  if (isSelf && role !== "super_admin") {
    redirect(redirectPath("/admin/users", { error: "You cannot remove your own super admin role." }));
  }
  if (isSelf && !isActive) {
    redirect(redirectPath("/admin/users", { error: "You cannot deactivate your own account." }));
  }
  if (target.role === "super_admin" && (role !== "super_admin" || !isActive)) {
    const remaining = await superAdminCount(id);
    if (remaining === 0) redirect(redirectPath("/admin/users", { error: "At least one active super admin is required." }));
  }

  await db.update(adminUsers).set({ role, isActive }).where(eq(adminUsers.id, id));
  await db.update(user).set({ name: text(formData, "name") || undefined }).where(eq(user.id, target.userId));

  const password = text(formData, "password");
  if (password.length >= 8) {
    const hashed = await hashPassword(password);
    await db
      .update(account)
      .set({ password: hashed, updatedAt: new Date() })
      .where(and(eq(account.userId, target.userId), eq(account.providerId, "credential")));
  }

  await logAudit({
    actorEmail: actor.session.user.email,
    action: "user.update",
    entity: "admin_user",
    entityId: target.email,
    meta: { role, isActive, passwordChanged: password.length >= 8 },
  });
  revalidatePath("/admin/users");
  redirect(redirectPath("/admin/users", { ok: `${target.email} updated.` }));
}

export async function deleteAdminUser(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = Number(text(formData, "id"));
  if (!id) return;

  const [target] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  if (!target) return;
  if (target.email === actor.session.user.email) {
    redirect(redirectPath("/admin/users", { error: "You cannot delete your own account." }));
  }
  if (target.role === "super_admin") {
    const remaining = await superAdminCount(id);
    if (remaining === 0) redirect(redirectPath("/admin/users", { error: "At least one super admin is required." }));
  }

  await db.delete(adminUsers).where(eq(adminUsers.id, id));
  await db.delete(user).where(eq(user.id, target.userId));

  await logAudit({
    actorEmail: actor.session.user.email,
    action: "user.delete",
    entity: "admin_user",
    entityId: target.email,
  });
  revalidatePath("/admin/users");
  redirect(redirectPath("/admin/users", { ok: `${target.email} removed.` }));
}
