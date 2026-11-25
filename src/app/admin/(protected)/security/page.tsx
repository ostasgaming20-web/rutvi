import Link from "next/link";
import { and, count, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { Database, Download, Filter, Lock, Search } from "lucide-react";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { can } from "@/lib/permissions";
import { formatDateTime } from "@/lib/format";
import {
  PageHeader,
  Panel,
  Tag,
  StatCard,
  EmptyState,
  Th,
  Td,
  TableWrap,
  ButtonLink,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminSecurityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireCapability("security.view");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const action = typeof params.action === "string" ? params.action : "";
  const entity = typeof params.entity === "string" ? params.entity : "";
  const window = typeof params.window === "string" ? params.window : "30";
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 50;

  const since = new Date();
  since.setDate(since.getDate() - (Number(window) || 30));

  const conditions = [gte(auditLogs.createdAt, since)];
  if (action) conditions.push(ilike(auditLogs.action, `${action}%`));
  if (entity) conditions.push(eq(auditLogs.entity, entity));
  if (q) {
    conditions.push(
      or(
        ilike(auditLogs.actorEmail, `%${q}%`),
        ilike(auditLogs.action, `%${q}%`),
        ilike(auditLogs.entity, `%${q}%`),
        ilike(auditLogs.entityId, `%${q}%`),
      )!,
    );
  }
  const where = and(...conditions);

  const [rows, totals, actionCounts, entityCounts] = await Promise.all([
    db.select().from(auditLogs).where(where).orderBy(desc(auditLogs.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ value: count() }).from(auditLogs).where(where),
    db
      .select({ action: sql<string>`split_part(${auditLogs.action}, '.', 1)`, value: count() })
      .from(auditLogs)
      .where(gte(auditLogs.createdAt, since))
      .groupBy(sql`split_part(${auditLogs.action}, '.', 1)`)
      .orderBy(desc(count())),
    db
      .select({ entity: auditLogs.entity, value: count() })
      .from(auditLogs)
      .where(gte(auditLogs.createdAt, since))
      .groupBy(auditLogs.entity)
      .orderBy(desc(count())),
  ]);

  const total = Number(totals[0].value);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const backupAllowed = can(admin.role, "backup.manage");
  const windows = [
    { value: "7", label: "7 days" },
    { value: "30", label: "30 days" },
    { value: "90", label: "90 days" },
    { value: "365", label: "1 year" },
  ];

  const buildHref = (overrides: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    const merged = { q, action, entity, window, page: undefined, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined && value !== "") query.set(key, String(value));
    }
    const search = query.toString();
    return `/admin/security${search ? `?${search}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Security & Activity"
        description="An immutable audit trail of every administrative action, with filters and a full data backup export."
        actions={
          backupAllowed ? (
            <ButtonLink href="/api/backup" variant="ghost" target="_blank">
              <Database className="size-3.5" /> Export backup
            </ButtonLink>
          ) : null
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Logged actions" value={total} icon={Lock} tone="blue" />
        <StatCard label="Publishes" value={actionCounts.find((row) => row.action === "publish")?.value ?? 0} tone="gold" note={`In the last ${window} days`} />
        <StatCard label="Content edits" value={actionCounts.find((row) => row.action === "content" || row.action === "branding")?.value ?? 0} tone="neutral" />
        <StatCard label="Security events" value={actionCounts.find((row) => row.action === "user")?.value ?? 0} tone="green" />
      </div>

      <Panel>
        <form method="get" className="flex flex-wrap items-end gap-2 border-b border-black/6 p-3">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-black/30" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search actor, action, entity or id…"
              className="w-full rounded-lg border border-black/10 bg-white py-2 pl-8 pr-3 text-[0.75rem] outline-none focus:border-[#0d1f3c]"
            />
          </label>
          <select name="action" defaultValue={action} className="rounded-lg border border-black/10 bg-white px-2.5 py-2 text-[0.72rem] outline-none">
            <option value="">All actions</option>
            {actionCounts.map((row) => <option key={row.action} value={row.action}>{row.action}</option>)}
          </select>
          <select name="entity" defaultValue={entity} className="rounded-lg border border-black/10 bg-white px-2.5 py-2 text-[0.72rem] outline-none">
            <option value="">All entities</option>
            {entityCounts.filter((row) => row.entity).map((row) => <option key={row.entity} value={row.entity!}>{row.entity}</option>)}
          </select>
          <select name="window" defaultValue={window} className="rounded-lg border border-black/10 bg-white px-2.5 py-2 text-[0.72rem] outline-none">
            {windows.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <button type="submit" className="inline-flex items-center gap-1 rounded-lg bg-[#0d1f3c] px-3 py-2 text-[0.7rem] font-semibold text-white hover:bg-[#1b3358]">
            <Filter className="size-3" /> Filter
          </button>
          {(q || action || entity) && (
            <Link href={buildHref({ q: "", action: "", entity: "" })} className="text-[0.68rem] text-[#8b919d] hover:text-[#0d1f3c]">Reset</Link>
          )}
        </form>

        {rows.length === 0 ? (
          <EmptyState title="No activity found" description="Actions taken in the control centre will be recorded here." icon={Lock} />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[820px]">
              <thead>
                <tr>
                  <Th>When</Th>
                  <Th>Actor</Th>
                  <Th>Action</Th>
                  <Th>Entity</Th>
                  <Th>Details</Th>
                  <Th>IP</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="align-top hover:bg-black/[0.015]">
                    <Td className="whitespace-nowrap text-[0.64rem] text-[#8b919d]">{formatDateTime(row.createdAt)}</Td>
                    <Td className="text-[0.68rem]">{row.actorEmail || "system"}</Td>
                    <Td><Tag tone={row.action.startsWith("publish") ? "gold" : row.action.startsWith("user") ? "red" : "blue"}>{row.action}</Tag></Td>
                    <Td className="text-[0.66rem] text-[#6b7280]">
                      {row.entity || "—"}
                      {row.entityId ? <span className="ml-1 text-[#a0a6b1]">#{row.entityId}</span> : null}
                    </Td>
                    <Td>
                      <code className="block max-w-[280px] truncate text-[0.6rem] text-[#8b919d]" title={JSON.stringify(row.meta)}>
                        {Object.keys(row.meta ?? {}).length ? JSON.stringify(row.meta) : "—"}
                      </code>
                    </Td>
                    <Td className="text-[0.62rem] text-[#8b919d]">{row.ip || "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-black/6 px-3 py-2.5">
            <p className="text-[0.65rem] text-[#8b919d]">Page {page} of {totalPages}</p>
            <div className="flex gap-1.5">
              {page > 1 && <Link href={buildHref({ page: page - 1 })} className="rounded-md border border-black/10 px-2.5 py-1 text-[0.65rem] hover:border-black/25">Previous</Link>}
              {page < totalPages && <Link href={buildHref({ page: page + 1 })} className="rounded-md border border-black/10 px-2.5 py-1 text-[0.65rem] hover:border-black/25">Next</Link>}
            </div>
          </div>
        )}
      </Panel>

      {backupAllowed ? (
        <Panel title="Data backup" description="Super admin only">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-[0.74rem] font-medium text-[#14161a]">Download a full JSON export</p>
              <p className="text-[0.66rem] text-[#8b919d]">Products, categories, enquiries, customers, settings and content — excluding credentials.</p>
            </div>
            <ButtonLink href="/api/backup" target="_blank">
              <Download className="size-3.5" /> Export backup
            </ButtonLink>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
