import Link from "next/link";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { ArrowUpRight, BadgeHelp, FileText, Package, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { customers, enquiries, products, quotationRequests } from "@/lib/db/schema";
import { formatDate, formatINR, statusTone, ENQUIRY_STATUS_LABELS } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [
    productCount,
    activeProductCount,
    enquiryCount,
    newEnquiryCount,
    completedCount,
    quotationCount,
    pendingQuotationCount,
    recentEnquiries,
    recentQuotations,
  ] = await Promise.all([
    db.select({ value: count() }).from(products),
    db.select({ value: count() }).from(products).where(eq(products.isActive, true)),
    db.select({ value: count() }).from(enquiries),
    db.select({ value: count() }).from(enquiries).where(eq(enquiries.status, "new")),
    db.select({ value: count() }).from(enquiries).where(eq(enquiries.status, "completed")),
    db.select({ value: count() }).from(quotationRequests),
    db
      .select({ value: count() })
      .from(quotationRequests)
      .where(inArray(quotationRequests.status, ["draft", "sent"])),
    db
      .select({
        id: enquiries.id,
        status: enquiries.status,
        type: enquiries.type,
        productName: enquiries.productName,
        quantity: enquiries.quantity,
        budgetPaise: enquiries.budgetPaise,
        createdAt: enquiries.createdAt,
        name: customers.name,
        company: customers.company,
      })
      .from(enquiries)
      .innerJoin(customers, eq(enquiries.customerId, customers.id))
      .orderBy(desc(enquiries.createdAt))
      .limit(6),
    db
      .select({
        id: quotationRequests.id,
        quoteNumber: quotationRequests.quoteNumber,
        status: quotationRequests.status,
        totalPaise: quotationRequests.totalPaise,
        createdAt: quotationRequests.createdAt,
        name: customers.name,
      })
      .from(quotationRequests)
      .innerJoin(enquiries, eq(quotationRequests.enquiryId, enquiries.id))
      .innerJoin(customers, eq(enquiries.customerId, customers.id))
      .orderBy(desc(quotationRequests.createdAt))
      .limit(5),
  ]);

  const stats = [
    { label: "Total products", value: Number(productCount[0].value), note: `${Number(activeProductCount[0].value)} published`, icon: Package, href: "/admin/products" },
    { label: "Total enquiries", value: Number(enquiryCount[0].value), note: `${Number(newEnquiryCount[0].value)} new`, icon: BadgeHelp, href: "/admin/enquiries" },
    { label: "Quotations", value: Number(quotationCount[0].value), note: `${Number(pendingQuotationCount[0].value)} pending`, icon: FileText, href: "/admin/quotations" },
    { label: "Completed", value: Number(completedCount[0].value), note: "closed requests", icon: Sparkles, href: "/admin/enquiries?status=completed" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold">Overview</p>
        <h1 className="display mt-1 text-4xl text-ink">Good to see you.</h1>
        <p className="mt-1 text-sm text-ink/50">A snapshot of the gifting desk today.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="surface group rounded-xl p-4 transition-shadow hover:shadow-lg">
            <div className="flex items-start justify-between">
              <span className="grid size-9 place-items-center rounded-lg bg-cream text-navy">
                <stat.icon className="size-4" />
              </span>
              <ArrowUpRight className="size-4 text-ink/20 transition-colors group-hover:text-navy" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-ink">{stat.value}</p>
            <p className="text-[0.62rem] uppercase tracking-[0.12em] text-stone">{stat.label}</p>
            <p className="mt-2 text-[0.65rem] text-ink/40">{stat.note}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="surface rounded-xl">
          <div className="flex items-center justify-between border-b border-ink/8 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Recent enquiries</h2>
              <p className="text-[0.65rem] text-stone">Latest requests from the website</p>
            </div>
            <Link href="/admin/enquiries" className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-navy hover:text-gold">
              View all
            </Link>
          </div>
          {recentEnquiries.length === 0 ? (
            <p className="px-5 py-10 text-center text-xs text-stone">No enquiries yet. New requests will appear here.</p>
          ) : (
            <div className="divide-y divide-ink/7">
              {recentEnquiries.map((enquiry) => (
                <Link key={enquiry.id} href={`/admin/enquiries/${enquiry.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-cream/40">
                  <div className="min-w-0">
                    <p className="truncate text-[0.8rem] font-medium text-ink">
                      {enquiry.name}
                      {enquiry.company && <span className="font-normal text-stone"> · {enquiry.company}</span>}
                    </p>
                    <p className="mt-0.5 truncate text-[0.65rem] text-stone">
                      {enquiry.productName || enquiry.type} {enquiry.quantity ? `· ${enquiry.quantity} pcs` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-[0.6rem] text-stone sm:block">{formatDate(enquiry.createdAt)}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[0.55rem] font-medium ${statusTone(enquiry.status)}`}>
                      {ENQUIRY_STATUS_LABELS[enquiry.status] ?? enquiry.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-5">
          <section className="surface rounded-xl">
            <div className="border-b border-ink/8 px-5 py-4">
              <h2 className="text-sm font-semibold text-ink">Quotations</h2>
              <p className="text-[0.65rem] text-stone">Drafts and recently sent</p>
            </div>
            {recentQuotations.length === 0 ? (
              <p className="px-5 py-8 text-center text-xs text-stone">No quotations yet.</p>
            ) : (
              <div className="divide-y divide-ink/7">
                {recentQuotations.map((quote) => (
                  <Link key={quote.id} href={`/admin/quotations/${quote.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-cream/40">
                    <div>
                      <p className="text-[0.75rem] font-medium text-ink">{quote.quoteNumber}</p>
                      <p className="text-[0.62rem] text-stone">{quote.name}</p>
                    </div>
                    <p className="text-[0.7rem] font-medium text-navy">{formatINR(quote.totalPaise)}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl bg-navy p-5 text-ivory">
            <p className="text-[0.6rem] uppercase tracking-[0.18em] text-gold">Quick actions</p>
            <div className="mt-3 grid gap-2">
              <Link href="/admin/products/new" className="rounded-lg border border-ivory/12 px-3 py-2 text-xs text-ivory/75 hover:border-ivory/30 hover:text-ivory">
                + Add a product
              </Link>
              <Link href="/admin/enquiries?status=new" className="rounded-lg border border-ivory/12 px-3 py-2 text-xs text-ivory/75 hover:border-ivory/30 hover:text-ivory">
                Review new enquiries
              </Link>
              <Link href="/admin/settings" className="rounded-lg border border-ivory/12 px-3 py-2 text-xs text-ivory/75 hover:border-ivory/30 hover:text-ivory">
                Update contact details
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
