import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, enquiries } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";

export default async function AdminCustomersPage() {
  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      company: customers.company,
      email: customers.email,
      phone: customers.phone,
      city: customers.city,
      createdAt: customers.createdAt,
      enquiryCount: sql<number>`count(${enquiries.id})::int`,
      lastEnquiryAt: sql<Date | null>`max(${enquiries.createdAt})`,
    })
    .from(customers)
    .leftJoin(enquiries, sql`${enquiries.customerId} = ${customers.id}`)
    .groupBy(customers.id)
    .orderBy(desc(sql`max(${enquiries.createdAt})`), desc(customers.createdAt))
    .limit(200);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold">Relationships</p>
        <h1 className="display mt-1 text-4xl text-ink">Customers</h1>
        <p className="mt-1 text-sm text-ink/50">{rows.length} contacts from website enquiries.</p>
      </div>

      {rows.length === 0 ? (
        <div className="surface rounded-xl p-12 text-center">
          <p className="text-sm font-medium text-ink">No customers yet.</p>
          <p className="mt-1 text-xs text-stone">Contacts are created automatically when someone submits an enquiry.</p>
        </div>
      ) : (
        <div className="surface overflow-hidden rounded-xl">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink/8 text-[0.58rem] uppercase tracking-[0.12em] text-stone">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Enquiries</th>
                  <th className="px-4 py-3 font-medium">Last activity</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/7">
                {rows.map((row) => (
                  <tr key={row.id} className="text-xs hover:bg-cream/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{row.name}</p>
                      <p className="text-[0.62rem] text-stone">{row.company || "Individual buyer"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${row.email}`} className="block text-ink/70 hover:text-navy">{row.email}</a>
                      <p className="text-[0.62rem] text-stone">{row.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{row.city || "—"}</td>
                    <td className="px-4 py-3 text-ink/70">{row.enquiryCount}</td>
                    <td className="px-4 py-3 text-ink/60">{formatDate(row.lastEnquiryAt ?? row.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/enquiries?q=${encodeURIComponent(row.email)}`} className="rounded-md px-2 py-1 text-[0.6rem] font-medium text-navy hover:bg-cream">
                        View enquiries
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-ink/7 md:hidden">
            {rows.map((row) => (
              <Link key={row.id} href={`/admin/enquiries?q=${encodeURIComponent(row.email)}`} className="block p-4 hover:bg-cream/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{row.name}</p>
                    <p className="truncate text-[0.62rem] text-stone">{row.company || row.email}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-ink/10 px-2 py-0.5 text-[0.55rem] text-ink/60">
                    {row.enquiryCount} {row.enquiryCount === 1 ? "enquiry" : "enquiries"}
                  </span>
                </div>
                <p className="mt-2 text-[0.62rem] text-stone">{row.phone} · {formatDate(row.lastEnquiryAt ?? row.createdAt)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
