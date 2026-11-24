"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { quotationItems, quotationRequests, testimonials } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { bool, nullable, num, redirectPath, text } from "@/lib/form";

export async function saveQuotation(formData: FormData) {
  const admin = await requireCapability("enquiries.manage");
  const id = num(formData, "id");
  if (!id) return;

  type Row = { description: string; quantity: number; unitPrice: number };
  let rows: Row[] = [];
  try {
    rows = JSON.parse(text(formData, "items") || "[]") as Row[];
  } catch {
    rows = [];
  }

  const normalized = rows
    .filter((row) => row.description?.trim() && Number(row.quantity) > 0)
    .map((row) => {
      const quantity = Math.max(1, Math.round(Number(row.quantity) || 1));
      const unitPricePaise = Math.round((Number(row.unitPrice) || 0) * 100);
      return {
        description: row.description.trim().slice(0, 300),
        quantity,
        unitPricePaise,
        totalPaise: quantity * unitPricePaise,
      };
    });

  const subtotal = normalized.reduce((sum, row) => sum + row.totalPaise, 0);
  const tax = Math.round((Number(text(formData, "tax")) || 0) * 100);
  const delivery = Math.round((Number(text(formData, "delivery")) || 0) * 100);
  const validUntilRaw = text(formData, "validUntil");

  await db
    .update(quotationRequests)
    .set({
      status: text(formData, "status") || "draft",
      subtotalPaise: subtotal,
      taxPaise: tax,
      deliveryPaise: delivery,
      totalPaise: subtotal + tax + delivery,
      validUntil: validUntilRaw ? new Date(validUntilRaw) : null,
      notes: nullable(formData, "notes"),
      updatedAt: new Date(),
    })
    .where(eq(quotationRequests.id, id));

  await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));
  if (normalized.length > 0) {
    await db.insert(quotationItems).values(normalized.map((row) => ({ ...row, quotationId: id })));
  }

  await logAudit({
    actorEmail: admin.session.user.email,
    action: "quotation.update",
    entity: "quotation",
    entityId: id,
    meta: { total: subtotal + tax + delivery },
  });

  revalidatePath("/admin/quotations");
  revalidatePath(`/admin/quotations/${id}`);
  revalidatePath("/admin");
}

export async function updateQuotationStatus(formData: FormData) {
  const admin = await requireCapability("enquiries.manage");
  const id = num(formData, "id");
  const status = text(formData, "status");
  if (!id || !status) return;
  await db.update(quotationRequests).set({ status, updatedAt: new Date() }).where(eq(quotationRequests.id, id));
  await logAudit({ actorEmail: admin.session.user.email, action: "quotation.status", entity: "quotation", entityId: id, meta: { status } });
  revalidatePath("/admin/quotations");
  revalidatePath(`/admin/quotations/${id}`);
}

export async function deleteQuotation(formData: FormData) {
  const admin = await requireCapability("enquiries.manage");
  const id = num(formData, "id");
  if (!id) return;
  await db.delete(quotationRequests).where(eq(quotationRequests.id, id));
  await logAudit({ actorEmail: admin.session.user.email, action: "quotation.delete", entity: "quotation", entityId: id });
  revalidatePath("/admin/quotations");
  redirect("/admin/quotations");
}

/* ------------------------------ testimonials ------------------------------ */

export async function saveTestimonial(formData: FormData) {
  const admin = await requireCapability("content.edit");
  const id = num(formData, "id");
  const values = {
    customerName: text(formData, "customerName"),
    company: nullable(formData, "company"),
    quote: text(formData, "quote"),
    rating: Math.min(5, Math.max(1, Number(text(formData, "rating")) || 5)),
    isPublished: bool(formData, "isPublished"),
    sortOrder: Number(text(formData, "sortOrder")) || 0,
  };
  if (!values.customerName || !values.quote) redirect(redirectPath("/admin/settings", { error: "Add a name and quote." }));

  if (id) {
    await db.update(testimonials).set(values).where(eq(testimonials.id, id));
  } else {
    await db.insert(testimonials).values(values);
  }
  await logAudit({ actorEmail: admin.session.user.email, action: id ? "testimonial.update" : "testimonial.create", entity: "testimonial", entityId: id || null });
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function deleteTestimonial(formData: FormData) {
  const admin = await requireCapability("content.edit");
  const id = num(formData, "id");
  if (!id) return;
  await db.delete(testimonials).where(eq(testimonials.id, id));
  await logAudit({ actorEmail: admin.session.user.email, action: "testimonial.delete", entity: "testimonial", entityId: id });
  revalidatePath("/");
  revalidatePath("/admin/settings");
}
