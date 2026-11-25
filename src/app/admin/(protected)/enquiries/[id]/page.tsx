import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import {
  ArrowLeft,
  Download,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { db } from "@/lib/db";
import {
  adminUsers,
  customers,
  enquiryNotes,
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
} from "@/lib/format";
import { requireCapability } from "@/lib/admin";
import { can } from "@/lib/permissions";
import {
  addEnquiryNote,
  createQuotationFromEnquiry,
  deleteEnquiryNote,
  updateEnquiry,
} from "@/app/admin/enquiry-actions";
import {
  PageHeader,
  Panel,
  Tag,
  Field,
  TextArea,
  Select,
  ButtonLink,
  EmptyState,
} from "@/components/admin/ui";
import { AdminSubmit } from "@/components/admin/admin-submit";

export const dynamic = "force-dynamic";

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

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

function displayValue(value: unknown) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

const STATUS_TONES: Record<string, "blue" | "gold" | "green" | "red" | "amber" | "neutral"> = {
  new: "blue",
  contacted: "amber",
  quotation_sent: "gold",
  in_progress: "amber",
  completed: "green",
  cancelled: "red",
};

export default async function AdminEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireCapability("enquiries.view");
  const { id } = await params;
  const enquiryId = Number(id);
  if (!Number.isFinite(enquiryId)) notFound();

  const [row] = await db
    .select({ enquiry: enquiries, customer: customers })
    .from(enquiries)
    .innerJoin(customers, eq(enquiries.customerId, customers.id))
    .where(eq(enquiries.id, enquiryId))
    .limit(1);

  if (!row) notFound();

  const [files, quotations, notes, team] = await Promise.all([
    db.select().from(uploadedFiles).where(eq(uploadedFiles.enquiryId, enquiryId)),
    db
      .select()
      .from(quotationRequests)
      .where(eq(quotationRequests.enquiryId, enquiryId))
      .orderBy(desc(quotationRequests.createdAt)),
    db
      .select()
      .from(enquiryNotes)
      .where(eq(enquiryNotes.enquiryId, enquiryId))
      .orderBy(asc(enquiryNotes.createdAt)),
    db
      .select({ email: adminUsers.email })
      .from(adminUsers)
      .where(eq(adminUsers.isActive, true))
      .orderBy(asc(adminUsers.email)),
  ]);

  const { enquiry, customer } = row;
  const editable = can(admin.role, "enquiries.manage");
  const customizationEntries = Object.entries(enquiry.customization ?? {}).filter(
    ([key, value]) => key !== "hasArtwork" || Boolean(value),
  );

  const whatsappHref = `https://wa.me/${customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hello ${customer.name}, this is RUTVI ENTERPRISE regarding your gifting enquiry #${enquiry.id}.`,
  )}`;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Customer desk"
        title={`Enquiry #${enquiry.id}`}
        description={`Received ${formatDateTime(enquiry.createdAt)} · ${
          enquiry.type === "customize" ? "Gift customisation" : "Quote request"
        }`}
        actions={
          <>
            <ButtonLink href="/admin/enquiries" variant="ghost">
              <ArrowLeft className="size-3.5" /> All enquiries
            </ButtonLink>
            <Tag tone={STATUS_TONES[enquiry.status] ?? "neutral"}>
              {ENQUIRY_STATUS_LABELS[enquiry.status] ?? enquiry.status}
            </Tag>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Panel title="Customer" description={customer.company || "Individual buyer"}>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <div className="space-y-1.5 text-[0.78rem]">
                <p className="font-medium text-[#14161a]">{customer.name}</p>
                <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-[#3f4552] hover:text-[#0d1f3c]">
                  <Mail className="size-3.5 text-[#8b919d]" /> {customer.email}
                </a>
                <a href={`tel:${customer.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-[#3f4552] hover:text-[#0d1f3c]">
                  <Phone className="size-3.5 text-[#8b919d]" /> {customer.phone}
                </a>
                {customer.city ? <p className="text-[0.7rem] text-[#8b919d]">{customer.city}</p> : null}
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0d1f3c] px-3 py-2 text-[0.68rem] font-semibold text-white hover:bg-[#1b3358]">
                  <MessageCircle className="size-3.5" /> WhatsApp
                </a>
                <a
                  href={`mailto:${customer.email}?subject=${encodeURIComponent(`RUTVI ENTERPRISE quotation for enquiry #${enquiry.id}`)}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-black/12 px-3 py-2 text-[0.68rem] font-semibold text-[#14161a] hover:border-black/25"
                >
                  <Mail className="size-3.5" /> Email
                </a>
                <Link href={`/admin/customers/${customer.id}`} className="text-[0.66rem] font-medium text-[#0d1f3c] hover:underline">
                  View customer profile →
                </Link>
              </div>
            </div>
          </Panel>

          <Panel title="Requirement">
            <dl className="grid gap-4 p-4 sm:grid-cols-2">
              <div>
                <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-[#8b919d]">Product</dt>
                <dd className="mt-0.5 text-[0.8rem] text-[#14161a]">{enquiry.productName || "Not specified"}</dd>
              </div>
              <div>
                <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-[#8b919d]">Quantity</dt>
                <dd className="mt-0.5 text-[0.8rem] text-[#14161a]">{enquiry.quantity ? `${enquiry.quantity} pcs` : "To be confirmed"}</dd>
              </div>
              <div>
                <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-[#8b919d]">Budget</dt>
                <dd className="mt-0.5 text-[0.8rem] text-[#14161a]">{enquiry.budgetPaise ? formatINR(enquiry.budgetPaise) : "Open"}</dd>
              </div>
              <div>
                <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-[#8b919d]">Source page</dt>
                <dd className="mt-0.5 break-all text-[0.8rem] text-[#3f4552]">{enquiry.sourcePage || "—"}</dd>
              </div>
            </dl>
            {enquiry.message ? (
              <div className="mx-4 mb-4 rounded-lg border border-black/8 bg-black/[0.02] p-3">
                <p className="text-[0.56rem] uppercase tracking-[0.12em] text-[#8b919d]">Message</p>
                <p className="mt-1 whitespace-pre-wrap text-[0.8rem] leading-relaxed text-[#3f4552]">{enquiry.message}</p>
              </div>
            ) : null}
          </Panel>

          {customizationEntries.length > 0 ? (
            <Panel title="Customisation">
              <dl className="grid gap-4 p-4 sm:grid-cols-2">
                {customizationEntries.map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-[#8b919d]">{CUSTOMIZATION_LABELS[key] ?? key}</dt>
                    <dd className="mt-0.5 text-[0.8rem] text-[#14161a]">{displayValue(value)}</dd>
                  </div>
                ))}
              </dl>
              {files.length > 0 ? (
                <div className="space-y-2 border-t border-black/6 p-4">
                  <p className="text-[0.56rem] uppercase tracking-[0.12em] text-[#8b919d]">Uploaded artwork</p>
                  {files.map((file) => (
                    <a
                      key={file.id}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-black/8 px-3 py-2 text-[0.72rem] text-[#14161a] hover:border-[#0d1f3c]/30"
                    >
                      <span className="inline-flex min-w-0 items-center gap-2">
                        <FileText className="size-4 shrink-0 text-[#8b919d]" />
                        <span className="truncate">{file.fileName}</span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-[0.6rem] text-[#8b919d]">
                        <Download className="size-3.5" /> {(file.sizeBytes / 1024).toFixed(0)} KB
                      </span>
                    </a>
                  ))}
                </div>
              ) : null}
            </Panel>
          ) : null}

          <Panel
            title="Activity timeline"
            description="Internal notes, calls and follow-ups"
          >
            <div className="space-y-3 p-4">
              {notes.length === 0 ? (
                <p className="text-[0.72rem] text-[#8b919d]">No notes yet. Log your first call or follow-up below.</p>
              ) : (
                <ol className="space-y-3">
                  {notes.map((note) => (
                    <li key={note.id} className="rounded-lg border border-black/8 bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Tag tone="blue">{note.kind}</Tag>
                            <span className="text-[0.62rem] text-[#8b919d]">{note.authorEmail}</span>
                            <span className="text-[0.62rem] text-[#8b919d]">· {formatDateTime(note.createdAt)}</span>
                          </div>
                          <p className="mt-1.5 whitespace-pre-wrap text-[0.78rem] leading-relaxed text-[#3f4552]">{note.body}</p>
                        </div>
                        {editable ? (
                          <form action={deleteEnquiryNote}>
                            <input type="hidden" name="id" value={note.id} />
                            <input type="hidden" name="enquiryId" value={enquiry.id} />
                            <button type="submit" aria-label="Delete note" className="grid size-7 place-items-center rounded-md text-black/30 hover:bg-red-50 hover:text-red-600">
                              <Trash2 className="size-3.5" />
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              {editable ? (
                <form action={addEnquiryNote} className="space-y-2 rounded-lg border border-black/8 bg-black/[0.015] p-3">
                  <input type="hidden" name="enquiryId" value={enquiry.id} />
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                    <TextArea label="Add note" name="body" rows={3} placeholder="Call summary, decisions, next steps…" />
                    <Select label="Type" name="kind" defaultValue="note" options={[
                      { value: "note", label: "Note" },
                      { value: "call", label: "Call" },
                      { value: "email", label: "Email" },
                      { value: "meeting", label: "Meeting" },
                      { value: "whatsapp", label: "WhatsApp" },
                    ]} />
                  </div>
                  <AdminSubmit size="sm"><Plus className="size-3.5" /> Add note</AdminSubmit>
                </form>
              ) : null}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Pipeline">
            {editable ? (
              <form action={updateEnquiry} className="space-y-3 p-4">
                <input type="hidden" name="id" value={enquiry.id} />
                <Select
                  label="Stage"
                  name="status"
                  defaultValue={enquiry.status}
                  options={ENQUIRY_STATUSES.map((status) => ({ value: status, label: ENQUIRY_STATUS_LABELS[status] }))}
                />
                <Select label="Priority" name="priority" defaultValue={enquiry.priority} options={PRIORITIES} />
                <Select
                  label="Assigned to"
                  name="assignedTo"
                  defaultValue={enquiry.assignedTo ?? ""}
                  options={[{ value: "", label: "Unassigned" }, ...team.map((member) => ({ value: member.email, label: member.email }))]}
                />
                <TextArea label="Internal notes" name="adminNotes" rows={4} defaultValue={enquiry.adminNotes ?? ""} placeholder="Summary visible to the team…" />
                <AdminSubmit className="w-full">Save enquiry</AdminSubmit>
              </form>
            ) : (
              <dl className="space-y-3 p-4 text-[0.78rem]">
                <div><dt className="text-[0.56rem] uppercase tracking-[0.12em] text-[#8b919d]">Stage</dt><dd className="mt-0.5">{ENQUIRY_STATUS_LABELS[enquiry.status] ?? enquiry.status}</dd></div>
                <div><dt className="text-[0.56rem] uppercase tracking-[0.12em] text-[#8b919d]">Priority</dt><dd className="mt-0.5 capitalize">{enquiry.priority}</dd></div>
                <div><dt className="text-[0.56rem] uppercase tracking-[0.12em] text-[#8b919d]">Assigned to</dt><dd className="mt-0.5">{enquiry.assignedTo || "Unassigned"}</dd></div>
                {enquiry.adminNotes ? <div><dt className="text-[0.56rem] uppercase tracking-[0.12em] text-[#8b919d]">Notes</dt><dd className="mt-0.5 whitespace-pre-wrap">{enquiry.adminNotes}</dd></div> : null}
              </dl>
            )}
          </Panel>

          <Panel title="Quotations" actions={
            editable ? (
              <form action={createQuotationFromEnquiry}>
                <input type="hidden" name="enquiryId" value={enquiry.id} />
                <AdminSubmit size="sm" variant="ghost"><Plus className="size-3" /> New</AdminSubmit>
              </form>
            ) : null
          }>
            {quotations.length === 0 ? (
              <EmptyState
                title="No quotation yet"
                description="Create a line-item quotation from this enquiry and send a branded PDF."
                icon={FileText}
                action={editable ? (
                  <form action={createQuotationFromEnquiry}>
                    <input type="hidden" name="enquiryId" value={enquiry.id} />
                    <AdminSubmit size="sm">Create quotation</AdminSubmit>
                  </form>
                ) : undefined}
              />
            ) : (
              <ul className="divide-y divide-black/5">
                {quotations.map((quote) => (
                  <li key={quote.id}>
                    <Link href={`/admin/quotations/${quote.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[0.72rem] hover:bg-black/[0.015]">
                      <span>
                        <span className="font-medium text-[#14161a]">{quote.quoteNumber}</span>
                        <span className="ml-2 text-[0.64rem] text-[#8b919d]">{QUOTATION_STATUS_LABELS[quote.status] ?? quote.status}</span>
                      </span>
                      <span className="font-medium text-[#3f4552]">{formatINR(quote.totalPaise)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
