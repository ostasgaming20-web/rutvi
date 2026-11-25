import Link from "next/link";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { ArrowUpRight, Download, Inbox, Search } from "lucide-react";
import { db } from "@/lib/db";
import { adminUsers, customers, enquiries } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { can } from "@/lib/permissions";
import {
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_LABELS,
  formatDateTime,
  formatINR,
} from "@/lib/format";
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

const PRIORITY_TONES: Record<string, "neutral" | "blue" | "amber" | "red"> = {
  low: "neutral",
  normal: "blue",
  high: "amber",
  urgent: "red",
};

const STATUS_TONES: Record<string, "blue" | "gold" | "green" | "red" | "amber" | "neutral"> = {
  new: "blue",
  contacted: "amber",
  quotation_sent: "gold",
  in_progress: "amber",
  completed: "green",
  cancelled: "red",
};

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireCapability("enquiries.view");
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const priority = typeof params.priority === "string" ? params.priority : "";
  const assignee = typeof params.assignee === "string" ? params.assignee : "";
  const q = typeof params.q === "string" ? params.q : "";
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 25;

  const conditions = [];
  if (status && ENQUIRY_STATUSES.includes(status as (typeof ENQUIRY_STATUSES)[number])) {
    conditions.push(eq(enquiries.status, status));
  }
  if (priority) conditions.push(eq(enquiries.priority, priority));
  if (assignee === "unassigned") conditions.push(sql`${enquiries.assignedTo} is null`);
  else if (assignee) conditions.push(eq(enquiries.assignedTo, assignee));
  if (q) {
    conditions.push(
      or(
        ilike(customers.name, `%${q}%`),
        ilike(customers.email, `%${q}%`),
        ilike(customers.company, `%${q}%`),
        ilike(enquiries.productName, `%${q}%`),
        ilike(sql`${enquiries.id}::text`, `%${q}%`),
      )!,
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, totals, statusCounts, team] = await Promise.all([
    db
      .select({
        id: enquiries.id,
        status: enquiries.status,
        priority: enquiries.priority,
        assignedTo: enquiries.assignedTo,
        productName: enquiries.productName,
        quantity: enquiries.quantity,
        budgetPaise: enquiries.budgetPaise,
        createdAt: enquiries.createdAt,
        customerName: customers.name,
        company: customers.company,
        email: customers.email,
        phone: customers.phone,
      })
      .from(enquiries)
      .innerJoin(customers, eq(enquiries.customerId, customers.id))
      .where(where)
      .orderBy(desc(enquiries.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({
        total: count(),
        open: sql<number>`count(*) filter (where ${enquiries.status} in ('new','contacted','in_progress'))::int`,
        quoted: sql<number>`count(*) filter (where ${enquiries.status} = 'quotation_sent')::int`,
        won: sql<number>`count(*) filter (where ${enquiries.status} = 'completed')::int`,
      })
      .from(enquiries),
    db
      .select({ status: enquiries.status, value: count() })
      .from(enquiries)
      .groupBy(enquiries.status),
    db
      .select({ email: adminUsers.email })
      .from(adminUsers)
      .where(eq(adminUsers.isActive, true))
      .orderBy(adminUsers.email),
  ]);

  const summary = totals[0];
  const filteredTotal = Number(summary.total);
  const totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize));
  const countMap = new Map(statusCounts.map((row) => [row.status, Number(row.value)]));
  const editable = can(admin.role, "enquiries.manage");

  const buildHref = (overrides: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    const merged = { status, priority, assignee, q, page: undefined, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined && value !== "" && value !== null) query.set(key, String(value));
    }
    const search = query.toString();
    return `/admin/enquiries${search ? `?${search}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Customer desk"
        title="Orders & Enquiries"
        description="Every quote request and gift customisation brief, in one pipeline. Assign owners, track stages and export reports."
        actions={
          <>
            <ButtonLink href="/api/enquiries/export" variant="ghost" target="_blank">
              <Download className="size-3.5" /> Export CSV
            </ButtonLink>
            <ButtonLink href="/admin/customers" variant="ghost">Customers</ButtonLink>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total enquiries" value={Number(summary.total)} icon={Inbox} tone="blue" href="/admin/enquiries" />
        <StatCard label="Open pipeline" value={Number(summary.open)} note="New, contacted & in progress" tone="gold" href={buildHref({ status: "new" })} />
        <StatCard label="Quotations sent" value={Number(summary.quoted)} tone="neutral" href={buildHref({ status: "quotation_sent" })} />
        <StatCard label="Converted" value={Number(summary.won)} note="Completed enquiries" tone="green" href={buildHref({ status: "completed" })} />
      </div>

      <Panel>
        <div className="flex flex-wrap items-center gap-1.5 border-b border-black/6 px-3 pt-3">
          <Link
            href={buildHref({ status: "" })}
            className={`rounded-t-md border-b-2 px-2.5 py-2 text-[0.68rem] font-medium ${
              status === "" ? "border-[#0d1f3c] text-[#0d1f3c]" : "border-transparent text-[#6b7280] hover:text-[#14161a]"
            }`}
          >
            All <span className="ml-1 text-[0.6rem] text-[#8b919d]">{filteredTotal}</span>
          </Link>
          {ENQUIRY_STATUSES.map((value) => (
            <Link
              key={value}
              href={buildHref({ status: value })}
              className={`rounded-t-md border-b-2 px-2.5 py-2 text-[0.68rem] font-medium ${
                status === value ? "border-[#0d1f3c] text-[#0d1f3c]" : "border-transparent text-[#6b7280] hover:text-[#14161a]"
              }`}
            >
              {ENQUIRY_STATUS_LABELS[value]}
              <span className="ml-1 text-[0.6rem] text-[#8b919d]">{countMap.get(value) ?? 0}</span>
            </Link>
          ))}
        </div>

        <form method="get" className="flex flex-wrap items-end gap-2 border-b border-black/6 p-3">
          {status && <input type="hidden" name="status" value={status} />}
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-black/30" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search customer, company, product or reference…"
              className="w-full rounded-lg border border-black/10 bg-white py-2 pl-8 pr-3 text-[0.75rem] outline-none focus:border-[#0d1f3c]"
            />
          </label>
          <select name="priority" defaultValue={priority} className="rounded-lg border border-black/10 bg-white px-2.5 py-2 text-[0.72rem] outline-none">
            <option value="">Any priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <select name="assignee" defaultValue={assignee} className="rounded-lg border border-black/10 bg-white px-2.5 py-2 text-[0.72rem] outline-none">
            <option value="">Anyone</option>
            <option value="unassigned">Unassigned</option>
            {team.map((member) => (
              <option key={member.email} value={member.email}>{member.email}</option>
            ))}
          </select>
          <button type="submit" className="rounded-lg bg-[#0d1f3c] px-3 py-2 text-[0.7rem] font-semibold text-white hover:bg-[#1b3358]">
            Filter
          </button>
          {(q || priority || assignee) && (
            <Link href={buildHref({ q: "", priority: "", assignee: "" })} className="text-[0.68rem] text-[#8b919d] hover:text-[#0d1f3c]">
              Reset
            </Link>
          )}
        </form>

        {rows.length === 0 ? (
          <EmptyState
            title="No enquiries match"
            description="New enquiries submitted from the website will appear here instantly."
          />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[860px]">
              <thead>
                <tr>
                  <Th>Ref</Th>
                  <Th>Customer</Th>
                  <Th>Requirement</Th>
                  <Th>Budget</Th>
                  <Th>Owner</Th>
                  <Th>Stage</Th>
                  <Th>Received</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-black/[0.015]">
                    <Td>
                      <Link href={`/admin/enquiries/${row.id}`} className="font-semibold text-[#0d1f3c] hover:underline">
                        RE-{row.id}
                      </Link>
                      <div className="mt-0.5">
                        <Tag tone={PRIORITY_TONES[row.priority] ?? "neutral"}>{row.priority}</Tag>
                      </div>
                    </Td>
                    <Td>
                      <Link href={`/admin/enquiries/${row.id}`} className="block text-[0.76rem] font-medium text-[#14161a] hover:text-[#0d1f3c]">
                        {row.customerName}
                      </Link>
                      <p className="text-[0.62rem] text-[#8b919d]">{row.company || row.email}</p>
                    </Td>
                    <Td>
                      <p className="max-w-[190px] truncate text-[0.72rem] text-[#3f4552]">{row.productName || "Custom requirement"}</p>
                      <p className="text-[0.62rem] text-[#8b919d]">{row.quantity ? `${row.quantity} pcs` : "Qty TBC"}</p>
                    </Td>
                    <Td className="text-[0.72rem]">{row.budgetPaise ? formatINR(row.budgetPaise) : "Open"}</Td>
                    <Td className="text-[0.68rem] text-[#6b7280]">{row.assignedTo || "Unassigned"}</Td>
                    <Td><Tag tone={STATUS_TONES[row.status] ?? "neutral"}>{ENQUIRY_STATUS_LABELS[row.status] ?? row.status}</Tag></Td>
                    <Td className="whitespace-nowrap text-[0.66rem] text-[#8b919d]">{formatDateTime(row.createdAt)}</Td>
                    <Td>
                      <Link href={`/admin/enquiries/${row.id}`} className="inline-flex items-center gap-1 text-[0.66rem] font-semibold text-[#0d1f3c] hover:underline">
                        Open <ArrowUpRight className="size-3" />
                      </Link>
                    </Td>
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

        {!editable && (
          <p className="border-t border-black/6 px-3 py-2 text-[0.64rem] text-[#8b919d]">
            Your role has read-only access to enquiries.
          </p>
        )}
      </Panel>
    </div>
  );
}
