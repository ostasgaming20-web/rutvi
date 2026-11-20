import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, enquiries, quotationRequests } from "@/lib/db/schema";
import { QUOTATION_STATUS_LABELS, formatDate, formatINR, statusTone } from "@/lib/format";

export default async function AdminQuotationsPage() {
  const rows = await db
    .select({
      id: quotationRequests.id,
      quoteNumber: quotationRequests.quoteNumber,
      status: quotationRequests.status,
      totalPaise: quotationRequests.totalPaise,
      validUntil: quotationRequests.validUntil,
      createdAt: quotationRequests.createdAt,
      enquiryId: quotationRequests.enquiryId,
      customerName: customers.name,
      company: customers.company,
      productName: enquiries.productName,
    })
    .from(quotationRequests)
    .innerJoin(enquiries, eq(quotationRequests.enquiryId, enquiries.id))
    .innerJoin(customers, eq(enquiries.customerId, customers.id))
    .orderBy(desc(quotationRequests.createdAt))
    .limit(200);

  const open = rows.filter((row) => row.status === "draft" || row.status === "sent").length;
  const accepted = rows.filter((row) => row.status === "accepted").length;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold">Sales</p>
        <h1 className="display mt-1 text-4xl text-ink">Quotations</h1>
        <p className="mt-1 text-sm text-ink/50">
          {rows.length} total · {open} awaiting response · {accepted} accepted
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="surface rounded-xl p-12 text-center">
          <p className="text-sm font-medium text-ink">No quotations yet.</p>
          <p className="mt-1 text-xs text-stone">
            Open an enquiry and choose “Create quotation” to build your first one.
          </p>
          <Link href="/admin/enquiries" className="btn-base btn-navy mt-4 !min-h-10 !px-4 !text-[0.62rem]">
            View enquiries
          </Link>
        </div>
      ) : (
        <div className="surface overflow-hidden rounded-xl">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink/8 text-[0.58rem] uppercase tracking-[0.12em] text-stone">
                  <th className="px-4 py-3 font-medium">Quote</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Valid until</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/7">
                {rows.map((row) => (
                  <tr key={row.id} className="text-xs hover:bg-cream/30">
                    <td className="px-4 py-3">
                      <Link href={`/admin/quotations/${row.id}`} className="font-medium text-ink hover:text-navy">
                        {row.quoteNumber}
                      </Link>
                      <p className="text-[0.62rem] text-stone">{formatDate(row.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink/75">{row.customerName}</p>
                      <p className="text-[0.62rem] text-stone">{row.company || row.productName || "—"}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink/70">{formatINR(row.totalPaise)}</td>
                    <td className="px-4 py-3 text-ink/60">{row.validUntil ? formatDate(row.validUntil) : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[0.55rem] font-medium ${statusTone(row.status)}`}>
                        {QUOTATION_STATUS_LABELS[row.status] ?? row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/quotations/${row.id}`} className="rounded-md px-2 py-1 text-[0.6rem] font-medium text-navy hover:bg-cream">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-ink/7 md:hidden">
            {rows.map((row) => (
              <Link key={row.id} href={`/admin/quotations/${row.id}`} className="block p-4 hover:bg-cream/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{row.quoteNumber}</p>
                    <p className="truncate text-[0.62rem] text-stone">{row.customerName}{row.company ? ` · ${row.company}` : ""}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.55rem] ${statusTone(row.status)}`}>
                    {QUOTATION_STATUS_LABELS[row.status]}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[0.65rem]">
                  <span className="text-ink/60">{formatDate(row.createdAt)}</span>
                  <span className="font-medium text-ink/80">{formatINR(row.totalPaise)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
