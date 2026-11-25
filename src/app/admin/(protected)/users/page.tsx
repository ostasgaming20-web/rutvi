import { asc, eq } from "drizzle-orm";
import { ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { user } from "@/lib/db/auth-schema";
import { requireSuperAdmin } from "@/lib/admin";
import { createAdminUser, updateAdminUser, deleteAdminUser } from "@/app/admin/user-actions";
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, capabilitiesFor } from "@/lib/permissions";
import { formatDateTime } from "@/lib/format";
import {
  PageHeader,
  Panel,
  Field,
  Toggle,
  Tag,
  ButtonLink,
  Th,
  Td,
  TableWrap,
} from "@/components/admin/ui";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { ConfirmAction } from "@/components/admin/confirm-action";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const actor = await requireSuperAdmin();
  const rows = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      createdBy: adminUsers.createdBy,
      lastLoginAt: adminUsers.lastLoginAt,
      createdAt: adminUsers.createdAt,
      name: user.name,
    })
    .from(adminUsers)
    .leftJoin(user, eq(user.id, adminUsers.userId))
    .orderBy(asc(adminUsers.createdAt));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Users & Roles"
        description="Control who can access the control centre. Permissions are enforced on the server for every action."
        actions={<ButtonLink href="/admin/security" variant="ghost">Activity log</ButtonLink>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {ROLES.map((role) => {
          const count = rows.filter((row) => row.role === role).length;
          return (
            <div key={role} className="rounded-xl border border-black/7 bg-white p-3.5">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#8b919d]">{ROLE_LABELS[role]}</p>
              <p className="mt-1 text-[1.3rem] font-semibold text-[#14161a]">{count}</p>
              <p className="mt-1 text-[0.58rem] leading-relaxed text-[#8b919d]">{ROLE_DESCRIPTIONS[role]}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Panel title="Team accounts" description={`${rows.length} account${rows.length === 1 ? "" : "s"}`}>
          <TableWrap>
            <table className="w-full min-w-[760px]">
              <thead>
                <tr>
                  <Th>Member</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Last login</Th>
                  <Th className="text-right">Manage</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="align-top hover:bg-black/[0.015]">
                    <Td>
                      <p className="text-[0.76rem] font-medium text-[#14161a]">
                        {row.name || row.email}
                        {row.email === actor.session.user.email ? <span className="ml-1.5 text-[0.58rem] font-normal text-[#8b919d]">(you)</span> : null}
                      </p>
                      <p className="text-[0.62rem] text-[#8b919d]">{row.email}</p>
                      <p className="mt-0.5 text-[0.58rem] text-[#a0a6b1]">Added {formatDateTime(row.createdAt)}</p>
                    </Td>
                    <Td><Tag tone={row.role === "super_admin" ? "gold" : "blue"}>{ROLE_LABELS[row.role as keyof typeof ROLE_LABELS] ?? row.role}</Tag></Td>
                    <Td>{row.isActive ? <Tag tone="green">Active</Tag> : <Tag tone="red">Disabled</Tag>}</Td>
                    <Td className="whitespace-nowrap text-[0.64rem] text-[#8b919d]">{row.lastLoginAt ? formatDateTime(row.lastLoginAt) : "Never"}</Td>
                    <Td>
                      <details>
                        <summary className="cursor-pointer text-right text-[0.64rem] font-semibold text-[#0d1f3c]">Edit</summary>
                        <form action={updateAdminUser} className="mt-2 space-y-2 rounded-lg border border-black/8 bg-black/[0.015] p-2.5 text-left">
                          <input type="hidden" name="id" value={row.id} />
                          <Field label="Display name" name="name" defaultValue={row.name ?? ""} />
                          <label className="block">
                            <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Role</span>
                            <select name="role" defaultValue={row.role} className="w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[0.74rem]">
                              {ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
                            </select>
                          </label>
                          <Field label="Reset password" name="password" type="password" placeholder="Leave blank to keep current" hint="Minimum 8 characters." />
                          <Toggle label="Account active" name="isActive" defaultChecked={row.isActive} />
                          <div className="flex items-center gap-2">
                            <AdminSubmit size="sm">Save</AdminSubmit>
                            <ConfirmAction
                              action={deleteAdminUser}
                              fields={{ id: row.id }}
                              message={`Remove ${row.email} from the control centre? This deletes their login permanently.`}
                              confirmLabel="Delete account"
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[0.64rem] font-semibold text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="size-3" /> Delete
                            </ConfirmAction>
                          </div>
                        </form>
                      </details>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </Panel>

        <Panel title="Invite a team member" description="Creates a login immediately" padded>
          <form action={createAdminUser} className="space-y-3">
            <Field label="Full name" name="name" placeholder="e.g. Ananya Rao" required />
            <Field label="Email address" name="email" type="email" placeholder="name@rutvienterprise.com" required />
            <Field label="Temporary password" name="password" type="password" hint="At least 8 characters. Share securely." required />
            <label className="block">
              <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Role</span>
              <select name="role" defaultValue="editor" className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem]">
                {ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
              </select>
            </label>
            <div className="rounded-lg border border-black/8 bg-black/[0.015] p-2.5">
              <p className="flex items-center gap-1 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">
                <ShieldCheck className="size-3" /> Role permissions
              </p>
              <p className="mt-1 text-[0.62rem] leading-relaxed text-[#8b919d]">{ROLE_DESCRIPTIONS.editor}</p>
            </div>
            <AdminSubmit className="w-full"><UserPlus className="size-3.5" /> Create account</AdminSubmit>
          </form>
        </Panel>
      </div>

      <Panel title="Role matrix" description="Capabilities enforced server-side">
        <TableWrap>
          <table className="w-full min-w-[640px]">
            <thead>
              <tr>
                <Th>Capability</Th>
                {ROLES.map((role) => <Th key={role} className="text-center">{ROLE_LABELS[role]}</Th>)}
              </tr>
            </thead>
            <tbody>
              {capabilitiesFor("super_admin").map((capability) => (
                <tr key={capability} className="hover:bg-black/[0.015]">
                  <Td><span className="font-mono text-[0.64rem]">{capability}</span></Td>
                  {ROLES.map((role) => (
                    <Td key={role} className="text-center">
                      {capabilitiesFor(role).includes(capability) ? (
                        <span className="text-emerald-600">✓</span>
                      ) : (
                        <span className="text-black/15">—</span>
                      )}
                    </Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      </Panel>
    </div>
  );
}
