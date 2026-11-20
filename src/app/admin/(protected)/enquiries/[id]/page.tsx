import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, Download, FileText, Mail, MessageCircle, Phone } from "lucide-react";
import { db } from "@/lib/db";
import {
  customers,
  enquiries,
  quotationRequests,
  uploadedFiles,
} from "@/lib/db/schema";
import {
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_LABELS,
  QUOTATION_STATUS_LABELS,
  formatDateTime,
  formatINR,
  statusTone,
} from "@/lib/format";
import { createQuotationFromEnquiry, updateEnquiry } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/submit-button";

const CUSTOMIZATION_LABELS: Record<string, string> = {
  product: "Product",
  productColour: "Product colour",
  branding: "Branding techniques",
  boxColour: "Box colour",
  ribbonColour: "Ribbon colour",
  packaging: "Packaging",
  budget: "Indicative budget",
  hasArtwork: "Artwork supplied",
};

function displayValue(value: unknown) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export default async function AdminEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const enquiryId = Number(id);
  if (!Number.isFinite(enquiryId)) notFound();

  const [row] = await db
    .select({
      enquiry: enquiries,
      customer: customers,
    })
    .from(enquiries)
    .innerJoin(customers, eq(enquiries.customerId, customers.id))
    .where(eq(enquiries.id, enquiryId))
    .limit(1);

  if (!row) notFound();

  const [files, quotations] = await Promise.all([
    db.select().from(uploadedFiles).where(eq(uploadedFiles.enquiryId, enquiryId)),
    db
      .select()
      .from(quotationRequests)
      .where(eq(quotationRequests.enquiryId, enquiryId))
      .orderBy(desc(quotationRequests.createdAt)),
  ]);

  const { enquiry, customer } = row;
  const customizationEntries = Object.entries(enquiry.customization ?? {}).filter(
    ([key]) => key !== "hasArtwork" || enquiry.customization.hasArtwork,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/enquiries" className="inline-flex items-center gap-1.5 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-stone hover:text-navy">
            <ArrowLeft className="size-3.5" /> All enquiries
          </Link>
          <h1 className="display mt-1 text-4xl text-ink">Enquiry #{enquiry.id}</h1>
          <p className="mt-1 text-sm text-ink/50">
            Received {formatDateTime(enquiry.createdAt)} · {enquiry.type === "customize" ? "Gift customisation" : "Quote request"}
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[0.62rem] font-medium ${statusTone(enquiry.status)}`}>
          {ENQUIRY_STATUS_LABELS[enquiry.status] ?? enquiry.status}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <section className="surface rounded-xl p-5">
            <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold">Customer</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-ink">{customer.name}</p>
                <p className="text-xs text-stone">{customer.company || "Individual buyer"}</p>
              </div>
              <div className="space-y-1.5 text-xs">
                <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-ink/70 hover:text-navy">
                  <Mail className="size-3.5 text-stone" /> {customer.email}
                </a>
                <a href={`tel:${customer.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-ink/70 hover:text-navy">
                  <Phone className="size-3.5 text-stone" /> {customer.phone}
                </a>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`https://wa.me/${customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Hello ${customer.name}, this is RUTVI ENTERPRISE regarding your gifting enquiry #${enquiry.id}.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-base btn-navy !min-h-9 !px-3 !text-[0.58rem]"
              >
                <MessageCircle className="size-3.5" /> WhatsApp customer
              </a>
              <a href={`mailto:${customer.email}?subject=${encodeURIComponent(`RUTVI ENTERPRISE quotation for enquiry #${enquiry.id}`)}`} className="btn-base !min-h-9 border border-ink/12 !px-3 !text-[0.58rem] text-ink hover:border-navy/30">
                <Mail className="size-3.5" /> Email customer
              </a>
            </div>
          </section>

          <section className="surface rounded-xl p-5">
            <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold">Requirement</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[0.58rem] uppercase tracking-[0.12em] text-stone">Product</dt>
                <dd className="mt-0.5 text-sm text-ink">{enquiry.productName || "Not specified"}</dd>
              </div>
              <div>
                <dt className="text-[0.58rem] uppercase tracking-[0.12em] text-stone">Quantity</dt>
                <dd className="mt-0.5 text-sm text-ink">{enquiry.quantity ? `${enquiry.quantity} pcs` : "To be confirmed"}</dd>
              </div>
              <div>
                <dt className="text-[0.58rem] uppercase tracking-[0.12em] text-stone">Budget</dt>
                <dd className="mt-0.5 text-sm text-ink">{enquiry.budgetPaise ? formatINR(enquiry.budgetPaise) : "Open"}</dd>
              </div>
              <div>
                <dt className="text-[0.58rem] uppercase tracking-[0.12em] text-stone">Source page</dt>
                <dd className="mt-0.5 break-all text-sm text-ink/70">{enquiry.sourcePage || "—"}</dd>
              </div>
            </dl>
            {enquiry.message ? (
              <div className="mt-4 rounded-lg border border-ink/8 bg-cream/40 p-3">
                <p className="text-[0.58rem] uppercase tracking-[0.12em] text-stone">Message</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink/75">{enquiry.message}</p>
              </div>
            ) : null}
          </section>

          {customizationEntries.length > 0 ? (
            <section className="surface rounded-xl p-5">
              <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold">Customisation</h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {customizationEntries.map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-[0.58rem] uppercase tracking-[0.12em] text-stone">
                      {CUSTOMIZATION_LABELS[key] ?? key}
                    </dt>
                    <dd className="mt-0.5 text-sm text-ink">{displayValue(value)}</dd>
                  </div>
                ))}
              </dl>
              {files.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <p className="text-[0.58rem] uppercase tracking-[0.12em] text-stone">Uploaded artwork</p>
                  {files.map((file) => (
                    <a
                      key={file.id}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-ink/8 px-3 py-2 text-xs text-ink hover:border-navy/30"
                    >
                      <span className="inline-flex min-w-0 items-center gap-2">
                        <FileText className="size-4 shrink-0 text-stone" />
                        <span className="truncate">{file.fileName}</span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-[0.6rem] text-stone">
                        <Download className="size-3.5" /> {(file.sizeBytes / 1024).toFixed(0)} KB
                      </span>
                    </a>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="surface rounded-xl p-5">
            <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold">Quotations</h2>
            {quotations.length === 0 ? (
              <p className="mt-3 text-xs text-stone">No quotation created for this enquiry yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {quotations.map((quote) => (
                  <li key={quote.id}>
                    <Link
                      href={`/admin/quotations/${quote.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-ink/8 px-3 py-2.5 text-xs hover:border-navy/30"
                    >
                      <span>
                        <span className="font-medium text-ink">{quote.quoteNumber}</span>
                        <span className="ml-2 text-stone">{QUOTATION_STATUS_LABELS[quote.status] ?? quote.status}</span>
                      </span>
                      <span className="font-medium text-ink/70">{formatINR(quote.totalPaise)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="surface rounded-xl p-5">
            <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold">Update status</h2>
            <form action={updateEnquiry} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={enquiry.id} />
              <div>
                <label htmlFor="status" className="mb-1 block text-[0.58rem] uppercase tracking-[0.12em] text-stone">
                  Pipeline stage
                </label>
                <select id="status" name="status" defaultValue={enquiry.status} className="field !min-h-10 text-xs">
                  {ENQUIRY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {ENQUIRY_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="adminNotes" className="mb-1 block text-[0.58rem] uppercase tracking-[0.12em] text-stone">
                  Internal notes
                </label>
                <textarea
                  id="adminNotes"
                  name="adminNotes"
                  rows={4}
                  defaultValue={enquiry.adminNotes ?? ""}
                  placeholder="Call summary, decisions, next steps…"
                  className="field text-xs"
                />
              </div>
              <SubmitButton className="btn-base btn-navy w-full" pendingLabel="Saving…">Save enquiry</SubmitButton>
            </form>
          </section>

          <section className="surface rounded-xl p-5">
            <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold">Next step</h2>
            <p className="mt-2 text-xs text-ink/55">
              Build a line-item quotation and download a branded PDF to send to the customer.
            </p>
            <form action={createQuotationFromEnquiry} className="mt-3">
              <input type="hidden" name="enquiryId" value={enquiry.id} />
              <SubmitButton className="btn-base btn-ghost w-full" pendingLabel="Creating…">
                {quotations.length > 0 ? "Create another quotation" : "Create quotation"}
              </SubmitButton>
            </form>
            {quotations.length > 0 ? (
              <Link href={`/admin/quotations/${quotations[0].id}`} className="mt-3 inline-block text-[0.62rem] font-medium text-navy underline-offset-4 hover:underline">
                Open latest quotation →
              </Link>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
