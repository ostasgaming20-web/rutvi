import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft, FileDown, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { customers, enquiries, quotationItems, quotationRequests } from "@/lib/db/schema";
import { deleteQuotation } from "@/app/admin/actions";
import { QuotationEditor } from "@/components/admin/quotation-editor";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { formatDate } from "@/lib/format";

export default async function AdminQuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quotationId = Number(id);
  if (!Number.isFinite(quotationId)) notFound();

  const [row] = await db
    .select({
      quotation: quotationRequests,
      enquiryId: enquiries.id,
      customerName: customers.name,
      company: customers.company,
      email: customers.email,
      phone: customers.phone,
    })
    .from(quotationRequests)
    .innerJoin(enquiries, eq(quotationRequests.enquiryId, enquiries.id))
    .innerJoin(customers, eq(enquiries.customerId, customers.id))
    .where(eq(quotationRequests.id, quotationId))
    .limit(1);

  if (!row) notFound();

  const items = await db
    .select()
    .from(quotationItems)
    .where(eq(quotationItems.quotationId, quotationId))
    .orderBy(asc(quotationItems.id));

  const { quotation } = row;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/admin/quotations" className="inline-flex items-center gap-1.5 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-stone hover:text-navy">
            <ArrowLeft className="size-3.5" /> All quotations
          </Link>
          <h1 className="display mt-1 text-4xl text-ink">{quotation.quoteNumber}</h1>
          <p className="mt-1 text-sm text-ink/50">
            Created {formatDate(quotation.createdAt)} ·{" "}
            <Link href={`/admin/enquiries/${row.enquiryId}`} className="text-navy hover:underline">
              Enquiry #{row.enquiryId}
            </Link>
          </p>
        </div>
        <a
          href={`/api/quotations/${quotation.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-base btn-gold !min-h-10 !px-4 !text-[0.62rem]"
        >
          <FileDown className="size-4" /> Download PDF
        </a>
      </div>

      <section className="surface rounded-xl p-5">
        <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold">Prepared for</h2>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-xs">
          <span className="text-sm font-medium text-ink">{row.customerName}</span>
          {row.company ? <span className="text-ink/60">{row.company}</span> : null}
          <span className="text-ink/60">{row.email}</span>
          <span className="text-ink/60">{row.phone}</span>
        </div>
      </section>

      <QuotationEditor
        quotation={{
          id: quotation.id,
          status: quotation.status,
          taxPaise: quotation.taxPaise,
          deliveryPaise: quotation.deliveryPaise,
          validUntil: quotation.validUntil ? new Date(quotation.validUntil).toISOString().slice(0, 10) : "",
          notes: quotation.notes ?? "",
        }}
        items={items.map((item) => ({
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPricePaise: item.unitPricePaise,
        }))}
      />

      <div className="surface flex flex-col items-start justify-between gap-3 rounded-xl p-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold text-ink">Delete this quotation</p>
          <p className="mt-0.5 text-[0.65rem] text-stone">The enquiry stays, but this quote and its line items are removed.</p>
        </div>
        <form action={deleteQuotation}>
          <input type="hidden" name="id" value={quotation.id} />
          <ConfirmSubmit
            message={`Delete quotation ${quotation.quoteNumber}? This cannot be undone.`}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-[0.65rem] font-medium text-red-700 hover:bg-red-50"
          >
            <Trash2 className="size-3.5" /> Delete quotation
          </ConfirmSubmit>
        </form>
      </div>
    </div>
  );
}
