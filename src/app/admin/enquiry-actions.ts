"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  customers,
  enquiryNotes,
  enquiries,
  quotationItems,
  quotationRequests,
} from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { nullable, num, redirectPath, text } from "@/lib/form";

const VALID_STATUSES = [
  "new",
  "contacted",
  "quotation_sent",
  "negotiation",
  "converted",
  "closed",
  "in_progress",
  "completed",
  "cancelled",
];

export async function updateEnquiry(formData: FormData) {
  const admin = await requireCapability("enquiries.manage");
  const id = num(formData, "id");
  if (!id) return;
  const status = text(formData, "status");
  const priority = text(formData, "priority") || "normal";
  const assignedTo = nullable(formData, "assignedTo");

  await db
    .update(enquiries)
    .set({
      status: VALID_STATUSES.includes(status) ? status : "new",
      priority,
      assignedTo,
      adminNotes: nullable(formData, "adminNotes"),
      updatedAt: new Date(),
    })
    .where(eq(enquiries.id, id));

  await logAudit({
    actorEmail: admin.session.user.email,
    action: "enquiry.update",
    entity: "enquiry",
    entityId: id,
    meta: { status, priority, assignedTo },
  });
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath("/admin");
  redirect(redirectPath(`/admin/enquiries/${id}`, { ok: "Enquiry updated." }));
}

export async function addEnquiryNote(formData: FormData) {
  const admin = await requireCapability("enquiries.manage");
  const enquiryId = num(formData, "enquiryId");
  const body = text(formData, "body");
  const kind = text(formData, "kind") || "note";
  if (!enquiryId || !body) return;

  await db.insert(enquiryNotes).values({
    enquiryId,
    authorEmail: admin.session.user.email,
    body: body.slice(0, 2000),
    kind,
  });
  await db.update(enquiries).set({ updatedAt: new Date() }).where(eq(enquiries.id, enquiryId));
  await logAudit({
    actorEmail: admin.session.user.email,
    action: "enquiry.note",
    entity: "enquiry",
    entityId: enquiryId,
    meta: { kind },
  });
  revalidatePath(`/admin/enquiries/${enquiryId}`);
}

export async function deleteEnquiryNote(formData: FormData) {
  const admin = await requireCapability("enquiries.manage");
  const id = num(formData, "id");
  const enquiryId = num(formData, "enquiryId");
  if (!id) return;
  await db.delete(enquiryNotes).where(eq(enquiryNotes.id, id));
  revalidatePath(`/admin/enquiries/${enquiryId}`);
}

export async function updateCustomer(formData: FormData) {
  const admin = await requireCapability("customers.manage");
  const id = num(formData, "id");
  if (!id) return;
  await db
    .update(customers)
    .set({
      name: text(formData, "name"),
      company: nullable(formData, "company"),
      phone: text(formData, "phone"),
      city: nullable(formData, "city"),
      notes: nullable(formData, "notes"),
    })
    .where(eq(customers.id, id));
  await logAudit({ actorEmail: admin.session.user.email, action: "customer.update", entity: "customer", entityId: id });
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  redirect(redirectPath(`/admin/customers/${id}`, { ok: "Customer updated." }));
}

export async function createQuotationFromEnquiry(formData: FormData) {
  const admin = await requireCapability("enquiries.manage");
  const enquiryId = num(formData, "enquiryId");
  if (!enquiryId) return;

  const [enquiry] = await db.select().from(enquiries).where(eq(enquiries.id, enquiryId)).limit(1);
  if (!enquiry) return;

  const [latest] = await db
    .select({ id: quotationRequests.id })
    .from(quotationRequests)
    .orderBy(desc(quotationRequests.id))
    .limit(1);
  const quoteNumber = `Q-${new Date().getFullYear()}-${String((latest?.id ?? 0) + 1).padStart(4, "0")}`;
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 15);

  const [quotation] = await db
    .insert(quotationRequests)
    .values({
      enquiryId,
      quoteNumber,
      status: "draft",
      notes: "Prices exclude GST unless stated. Lead time confirmed on approval.",
      validUntil,
    })
    .returning({ id: quotationRequests.id });

  await db.insert(quotationItems).values({
    quotationId: quotation.id,
    productId: enquiry.productId,
    description: enquiry.productName || "Corporate gifting requirement",
    quantity: enquiry.quantity ?? 1,
    unitPricePaise: 0,
    totalPaise: 0,
  });

  await db
    .update(enquiries)
    .set({ status: "quotation_sent", updatedAt: new Date() })
    .where(eq(enquiries.id, enquiryId));

  await logAudit({
    actorEmail: admin.session.user.email,
    action: "quotation.create",
    entity: "quotation",
    entityId: quotation.id,
    meta: { enquiryId, quoteNumber },
  });

  revalidatePath("/admin/quotations");
  revalidatePath("/admin/enquiries");
  redirect(`/admin/quotations/${quotation.id}`);
}

export async function exportEnquiriesCsv() {
  await requireCapability("enquiries.view");
  const rows = await db
    .select({
      id: enquiries.id,
      status: enquiries.status,
      priority: enquiries.priority,
      productName: enquiries.productName,
      quantity: enquiries.quantity,
      budgetPaise: enquiries.budgetPaise,
      message: enquiries.message,
      sourcePage: enquiries.sourcePage,
      createdAt: enquiries.createdAt,
      name: customers.name,
      company: customers.company,
      email: customers.email,
      phone: customers.phone,
      city: customers.city,
    })
    .from(enquiries)
    .innerJoin(customers, eq(enquiries.customerId, customers.id))
    .orderBy(desc(enquiries.createdAt));

  const header = [
    "Reference",
    "Date",
    "Status",
    "Priority",
    "Customer",
    "Company",
    "Email",
    "Phone",
    "City",
    "Product",
    "Quantity",
    "Budget (INR)",
    "Message",
    "Source page",
  ];

  const escape = (value: unknown) => {
    const string = value === null || value === undefined ? "" : String(value);
    return `"${string.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
  };

  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        `RE-${row.id}`,
        row.createdAt?.toISOString() ?? "",
        row.status,
        row.priority,
        row.name,
        row.company,
        row.email,
        row.phone,
        row.city,
        row.productName,
        row.quantity,
        row.budgetPaise ? (row.budgetPaise / 100).toFixed(0) : "",
        row.message,
        row.sourcePage,
      ]
        .map(escape)
        .join(","),
    ),
  ];

  return { filename: `rutvi-enquiries-${new Date().toISOString().slice(0, 10)}.csv`, csv: lines.join("\n") };
}
