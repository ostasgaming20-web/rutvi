import Link from "next/link";
import { count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { ArrowUpRight, Search, Users } from "lucide-react";
import { db } from "@/lib/db";
import { customers, enquiries } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { formatDate } from "@/lib/format";
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

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireCapability("customers.manage");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 25;

  const where = q
    ? or(ilike(customers.name, `%${q}%`), ilike(customers.email, `%${q}%`), ilike(customers.company, `%${q}%`), ilike(customers.phone, `%${q}%`))
    : undefined;

  const [rows, totals] = await Promise.all([
    db
      .select({
        id: customers.id,
        name: customers.name,
        company: customers.company,
        email: customers.email,
        phone: customers.phone,
        city: customers.city,
        createdAt: customers.createdAt,
        enquiryCount: sql<number>`count(${enquiries.id})::int`,
        lastEnquiry: sql<Date | null>`max(${enquiries.createdAt})`,
        pipelinePaise: sql<number>`coalesce(sum(${enquiries.budgetPaise}) filter (where ${enquiries.status} not in ('completed','cancelled')), 0)::bigint`,
      })
      .from(customers)
      .leftJoin(enquiries, eq(enquiries.customerId, customers.id))
      .where(where)
      .groupBy(customers.id)
      .orderBy(desc(sql`max(${enquiries.createdAt})`), desc(customers.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({
        total: count(),
        withEnquiries: sql<number>`count(*) filter (where exists (select 1 from ${enquiries} where ${enquiries.customerId} = ${customers.id}))::int`,
      })
      .from(customers),
  ]);

  const summary = totals[0];
  const total = Number(summary.total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Customer desk"
        title="Customer Management"
        description="A single record for every buyer, with their enquiry history, notes and pipeline value."
        actions={<ButtonLink href="/admin/enquiries" variant="ghost">Orders & enquiries</ButtonLink>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total customers" value={total} icon={Users} tone="blue" />
        <StatCard label="Active buyers" value={Number(summary.withEnquiries)} note="With at least one enquiry" tone="gold" />
        <StatCard label="Repeat-ready" value={Number(summary.withEnquiries)} note="Every customer with a quote history" tone="green" />
      </div>

      <Panel>
        <form method="get" className="flex flex-wrap items-end gap-2 border-b border-black/6 p-3">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-black/30" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name, company, email or phone…"
              className="w-full rounded-lg border border-black/10 bg-white py-2 pl-8 pr-3 text-[0.75rem] outline-none focus:border-[#0d1f3c]"
            />
          </label>
          <button type="submit" className="rounded-lg bg-[#0d1f3c] px-3 py-2 text-[0.7rem] font-semibold text-white hover:bg-[#1b3358]">
            Search
          </button>
          {q && <Link href="/admin/customers" className="text-[0.68rem] text-[#8b919d] hover:text-[#0d1f3c]">Reset</Link>}
        </form>

        {rows.length === 0 ? (
          <EmptyState
            title="No customers yet"
            description="Customers are created automatically when someone submits an enquiry or quote request."
          />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[780px]">
              <thead>
                <tr>
                  <Th>Customer</Th>
                  <Th>Contact</Th>
                  <Th>City</Th>
                  <Th>Enquiries</Th>
                  <Th>Open pipeline</Th>
                  <Th>Last activity</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-black/[0.015]">
                    <Td>
                      <Link href={`/admin/customers/${row.id}`} className="block text-[0.76rem] font-medium text-[#14161a] hover:text-[#0d1f3c]">
                        {row.name}
                      </Link>
                      <p className="text-[0.62rem] text-[#8b919d]">{row.company || "Individual buyer"}</p>
                    </Td>
                    <Td>
                      <p className="text-[0.7rem] text-[#3f4552]">{row.email}</p>
                      <p className="text-[0.62rem] text-[#8b919d]">{row.phone}</p>
                    </Td>
                    <Td className="text-[0.7rem]">{row.city || "—"}</Td>
                    <Td><Tag tone={row.enquiryCount > 0 ? "blue" : "neutral"}>{row.enquiryCount}</Tag></Td>
                    <Td className="text-[0.72rem]">
                      {Number(row.pipelinePaise) > 0 ? `₹${Math.round(Number(row.pipelinePaise) / 100).toLocaleString("en-IN")}` : "—"}
                    </Td>
                    <Td className="text-[0.66rem] text-[#8b919d]">{row.lastEnquiry ? formatDate(row.lastEnquiry) : formatDate(row.createdAt)}</Td>
                    <Td>
                      <Link href={`/admin/customers/${row.id}`} className="inline-flex items-center gap-1 text-[0.66rem] font-semibold text-[#0d1f3c] hover:underline">
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
              {page > 1 && <Link href={`/admin/customers?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="rounded-md border border-black/10 px-2.5 py-1 text-[0.65rem] hover:border-black/25">Previous</Link>}
              {page < totalPages && <Link href={`/admin/customers?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="rounded-md border border-black/10 px-2.5 py-1 text-[0.65rem] hover:border-black/25">Next</Link>}
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
