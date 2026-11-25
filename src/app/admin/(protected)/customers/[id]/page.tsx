import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, ArrowUpRight, Mail, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { customers, enquiries } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { updateCustomer } from "@/app/admin/enquiry-actions";
import {
  ENQUIRY_STATUS_LABELS,
  formatDate,
  formatDateTime,
  formatINR,
} from "@/lib/format";
import {
  PageHeader,
  Panel,
  Tag,
  Field,
  TextArea,
  ButtonLink,
  EmptyState,
  Th,
  Td,
  TableWrap,
} from "@/components/admin/ui";
import { AdminSubmit } from "@/components/admin/admin-submit";

export const dynamic = "force-dynamic";

const STATUS_TONES: Record<string, "blue" | "gold" | "green" | "red" | "amber" | "neutral"> = {
  new: "blue",
  contacted: "amber",
  quotation_sent: "gold",
  in_progress: "amber",
  completed: "green",
  cancelled: "red",
};

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCapability("customers.manage");
  const { id } = await params;
  const customerId = Number(id);
  if (!Number.isFinite(customerId)) notFound();

  const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  if (!customer) notFound();

  const history = await db
    .select()
    .from(enquiries)
    .where(eq(enquiries.customerId, customerId))
    .orderBy(desc(enquiries.createdAt));

  const open = history.filter((row) => !["completed", "cancelled"].includes(row.status));
  const won = history.filter((row) => row.status === "completed");
  const pipeline = open.reduce((sum, row) => sum + Number(row.budgetPaise ?? 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Customer profile"
        title={customer.name}
        description={`${customer.company || "Individual buyer"} · Customer since ${formatDate(customer.createdAt)}`}
        actions={
          <ButtonLink href="/admin/customers" variant="ghost">
            <ArrowLeft className="size-3.5" /> All customers
          </ButtonLink>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-black/7 bg-white p-4">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#8b919d]">Enquiries</p>
          <p className="mt-1 text-[1.4rem] font-semibold text-[#14161a]">{history.length}</p>
          <p className="text-[0.64rem] text-[#8b919d]">{open.length} open · {won.length} converted</p>
        </div>
        <div className="rounded-xl border border-black/7 bg-white p-4">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#8b919d]">Open pipeline</p>
          <p className="mt-1 text-[1.4rem] font-semibold text-[#14161a]">{pipeline ? formatINR(pipeline) : "—"}</p>
          <p className="text-[0.64rem] text-[#8b919d]">Indicative budgets in play</p>
        </div>
        <div className="rounded-xl border border-black/7 bg-white p-4">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#8b919d]">Contact</p>
          <a href={`mailto:${customer.email}`} className="mt-1 flex items-center gap-1.5 text-[0.72rem] text-[#3f4552] hover:text-[#0d1f3c]">
            <Mail className="size-3.5 text-[#8b919d]" /> {customer.email}
          </a>
          <a href={`tel:${customer.phone.replace(/\s/g, "")}`} className="mt-1 flex items-center gap-1.5 text-[0.72rem] text-[#3f4552] hover:text-[#0d1f3c]">
            <Phone className="size-3.5 text-[#8b919d]" /> {customer.phone}
          </a>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Panel title="Customer details" description="Editable record used across quotations" padded>
          <form action={updateCustomer} className="space-y-3">
            <input type="hidden" name="id" value={customer.id} />
            <Field label="Full name" name="name" defaultValue={customer.name} required />
            <Field label="Company" name="company" defaultValue={customer.company ?? ""} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Phone" name="phone" defaultValue={customer.phone} required />
              <Field label="City" name="city" defaultValue={customer.city ?? ""} />
            </div>
            <div className="rounded-lg border border-black/8 bg-black/[0.015] px-3 py-2">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-[#8b919d]">Email</p>
              <p className="mt-0.5 text-[0.78rem] text-[#14161a]">{customer.email}</p>
              <p className="text-[0.6rem] text-[#8b919d]">Email is the unique key for this customer and cannot be changed.</p>
            </div>
            <TextArea label="Internal notes" name="notes" rows={5} defaultValue={customer.notes ?? ""} placeholder="Preferences, gifting calendar, decision makers…" />
            <AdminSubmit className="w-full">Save customer</AdminSubmit>
          </form>
        </Panel>

        <Panel title="Enquiry history" description="Every request from this customer">
          {history.length === 0 ? (
            <EmptyState title="No enquiries yet" description="This customer has not submitted a quote request." />
          ) : (
            <TableWrap>
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr>
                    <Th>Ref</Th>
                    <Th>Requirement</Th>
                    <Th>Budget</Th>
                    <Th>Stage</Th>
                    <Th>Date</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id} className="hover:bg-black/[0.015]">
                      <Td>
                        <Link href={`/admin/enquiries/${row.id}`} className="font-semibold text-[#0d1f3c] hover:underline">
                          RE-{row.id}
                        </Link>
                      </Td>
                      <Td>
                        <p className="max-w-[160px] truncate text-[0.72rem]">{row.productName || "Custom requirement"}</p>
                        <p className="text-[0.6rem] text-[#8b919d]">{row.quantity ? `${row.quantity} pcs` : "Qty TBC"}</p>
                      </Td>
                      <Td className="text-[0.7rem]">{row.budgetPaise ? formatINR(row.budgetPaise) : "Open"}</Td>
                      <Td><Tag tone={STATUS_TONES[row.status] ?? "neutral"}>{ENQUIRY_STATUS_LABELS[row.status] ?? row.status}</Tag></Td>
                      <Td className="whitespace-nowrap text-[0.64rem] text-[#8b919d]">{formatDateTime(row.createdAt)}</Td>
                      <Td>
                        <Link href={`/admin/enquiries/${row.id}`} aria-label="Open enquiry" className="text-[#0d1f3c]">
                          <ArrowUpRight className="size-3.5" />
                        </Link>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Panel>
      </div>
    </div>
  );
}
