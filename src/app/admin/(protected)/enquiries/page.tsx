import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { Search } from "lucide-react";
import { db } from "@/lib/db";
import { customers, enquiries } from "@/lib/db/schema";
import { formatDate, formatINR, statusTone, ENQUIRY_STATUS_LABELS, ENQUIRY_STATUSES } from "@/lib/format";

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const q = typeof params.q === "string" ? params.q : "";

  const conditions = [];
  if (status) conditions.push(eq(enquiries.status, status));
  if (q) {
    conditions.push(
      or(
        ilike(customers.name, `%${q}%`),
        ilike(customers.company, `%${q}%`),
        ilike(customers.email, `%${q}%`),
        ilike(customers.phone, `%${q}%`),
      )!,
    );
  }

  const rows = await db
    .select({
      id: enquiries.id,
      type: enquiries.type,
      status: enquiries.status,
      productName: enquiries.productName,
      quantity: enquiries.quantity,
      budgetPaise: enquiries.budgetPaise,
      createdAt: enquiries.createdAt,
      name: customers.name,
      company: customers.company,
      email: customers.email,
      phone: customers.phone,
    })
    .from(enquiries)
    .innerJoin(customers, eq(enquiries.customerId, customers.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(enquiries.createdAt))
    .limit(200);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold">Leads</p>
          <h1 className="display mt-1 text-4xl text-ink">Enquiries</h1>
          <p className="mt-1 text-sm text-ink/50">{rows.length} requests in this view.</p>
        </div>
      </div>

      <div className="surface rounded-xl p-3">
        <form className="flex flex-wrap items-center gap-2" action="/admin/enquiries">
          <div className="relative min-w-48 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" />
            <input name="q" defaultValue={q} placeholder="Search name, company, email or phone…" className="field !min-h-10 pl-9 text-xs" aria-label="Search enquiries" />
          </div>
          <button type="submit" className="btn-base btn-navy !min-h-10 !px-4 !text-[0.62rem]">Search</button>
        </form>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Link href={`/admin/enquiries${q ? `?q=${encodeURIComponent(q)}` : ""}`} className={`rounded-full border px-3 py-1.5 text-[0.6rem] ${!status ? "border-navy bg-navy text-ivory" : "border-ink/10 text-ink/55 hover:border-navy/30"}`}>
            All
          </Link>
          {ENQUIRY_STATUSES.map((item) => (
            <Link
              key={item}
              href={`/admin/enquiries?status=${item}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-full border px-3 py-1.5 text-[0.6rem] ${status === item ? "border-navy bg-navy text-ivory" : "border-ink/10 text-ink/55 hover:border-navy/30"}`}
            >
              {ENQUIRY_STATUS_LABELS[item]}
            </Link>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="surface rounded-xl p-12 text-center">
          <p className="text-sm font-medium text-ink">No enquiries in this view.</p>
          <p className="mt-1 text-xs text-stone">New website requests will appear here automatically.</p>
        </div>
      ) : (
        <div className="surface overflow-hidden rounded-xl">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink/8 text-[0.58rem] uppercase tracking-[0.12em] text-stone">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Requirement</th>
                  <th className="px-4 py-3 font-medium">Budget</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/7">
                {rows.map((row) => (
                  <tr key={row.id} className="text-xs hover:bg-cream/30">
                    <td className="px-4 py-3">
                      <Link href={`/admin/enquiries/${row.id}`} className="font-medium text-ink hover:text-navy">{row.name}</Link>
                      <p className="text-[0.62rem] text-stone">{row.company || row.email}</p>
                    </td>
                    <td className="max-w-52 px-4 py-3">
                      <p className="truncate text-ink/70">{row.productName || row.type}</p>
                      <p className="text-[0.6rem] text-stone">{row.quantity ? `${row.quantity} pcs` : "Quantity TBC"}</p>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{row.budgetPaise ? formatINR(row.budgetPaise) : "—"}</td>
                    <td className="px-4 py-3 text-ink/60">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[0.55rem] font-medium ${statusTone(row.status)}`}>
                        {ENQUIRY_STATUS_LABELS[row.status] ?? row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/enquiries/${row.id}`} className="rounded-md px-2 py-1 text-[0.6rem] font-medium text-navy hover:bg-cream">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-ink/7 md:hidden">
            {rows.map((row) => (
              <Link key={row.id} href={`/admin/enquiries/${row.id}`} className="block p-4 hover:bg-cream/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{row.name}</p>
                    <p className="text-[0.62rem] text-stone">{row.company || row.email}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.55rem] ${statusTone(row.status)}`}>
                    {ENQUIRY_STATUS_LABELS[row.status]}
                  </span>
                </div>
                <p className="mt-2 truncate text-[0.7rem] text-ink/60">{row.productName || row.type} · {row.quantity || "—"} pcs</p>
                <p className="mt-1 text-[0.6rem] text-stone">{formatDate(row.createdAt)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
