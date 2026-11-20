"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  categories,
  enquiries,
  productImages,
  products,
  quotationItems,
  quotationRequests,
  testimonials,
  websiteSettings,
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullable(formData: FormData, key: string) {
  const value = text(formData, key);
  return value.length > 0 ? value : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function lines(formData: FormData, key: string) {
  return text(formData, key)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSpecs(formData: FormData) {
  return lines(formData, "specifications").map((line) => {
    const [label, ...rest] = line.split(":");
    return { label: label.trim(), value: rest.join(":").trim() };
  });
}

async function uniqueSlug(base: string, id?: number) {
  let slug = slugify(base) || `product-${Date.now()}`;
  let attempt = 1;
  while (true) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(id ? and(eq(products.slug, slug), ne(products.id, id)) : eq(products.slug, slug))
      .limit(1);
    if (!existing) return slug;
    attempt += 1;
    slug = `${slugify(base)}-${attempt}`;
  }
}

async function productPayload(formData: FormData, id?: number) {
  const name = text(formData, "name");
  const price = text(formData, "price");
  const images = lines(formData, "images");
  const categoryId = Number(text(formData, "categoryId"));

  if (!name) throw new Error("Product name is required.");
  if (!categoryId) throw new Error("Choose a category.");
  if (images.length === 0) throw new Error("Add at least one image URL.");

  const slug = await uniqueSlug(text(formData, "slug") || name, id);

  return {
    values: {
      name,
      slug,
      sku: text(formData, "sku") || `RE-${Date.now().toString().slice(-6)}`,
      shortDescription: nullable(formData, "shortDescription"),
      description: nullable(formData, "description"),
      categoryId,
      pricePaise: price ? Math.round(Number(price) * 100) : null,
      minOrderQty: Number(text(formData, "minOrderQty")) || 10,
      colors: text(formData, "colors").split(",").map((color) => color.trim()).filter(Boolean),
      specifications: parseSpecs(formData),
      customizationOptions: formData.getAll("customizationOptions").map(String).filter(Boolean),
      contents: lines(formData, "contents"),
      packaging: nullable(formData, "packaging"),
      productType: text(formData, "productType") || "product",
      availability: text(formData, "availability") || "in_stock",
      isFeatured: formData.get("isFeatured") === "on",
      isActive: formData.get("isActive") === "on",
      updatedAt: new Date(),
    },
    images,
  };
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const payload = await productPayload(formData);
  const [row] = await db.insert(products).values(payload.values).returning({ id: products.id });
  await db.insert(productImages).values(
    payload.images.map((url, index) => ({ productId: row.id, url, alt: payload.values.name, sortOrder: index })),
  );
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(text(formData, "id"));
  if (!id) throw new Error("Missing product id.");
  const payload = await productPayload(formData, id);
  await db.update(products).set(payload.values).where(eq(products.id, id));
  await db.delete(productImages).where(eq(productImages.productId, id));
  await db.insert(productImages).values(
    payload.images.map((url, index) => ({ productId: id, url, alt: payload.values.name, sortOrder: index })),
  );
  revalidatePath("/products");
  revalidatePath(`/products/${payload.values.slug}`);
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(text(formData, "id"));
  if (!id) return;
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function toggleProductFlag(formData: FormData) {
  await requireAdmin();
  const id = Number(text(formData, "id"));
  const field = text(formData, "field");
  if (!id || !["isActive", "isFeatured"].includes(field)) return;
  await db
    .update(products)
    .set(field === "isActive" ? { isActive: sql`not ${products.isActive}` } : { isFeatured: sql`not ${products.isFeatured}` })
    .where(eq(products.id, id));
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function updateEnquiry(formData: FormData) {
  await requireAdmin();
  const id = Number(text(formData, "id"));
  if (!id) return;
  await db
    .update(enquiries)
    .set({
      status: text(formData, "status") || "new",
      adminNotes: nullable(formData, "adminNotes"),
      updatedAt: new Date(),
    })
    .where(eq(enquiries.id, id));
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath("/admin");
}

export async function createQuotationFromEnquiry(formData: FormData) {
  await requireAdmin();
  const enquiryId = Number(text(formData, "enquiryId"));
  if (!enquiryId) return;

  const [enquiry] = await db.select().from(enquiries).where(eq(enquiries.id, enquiryId)).limit(1);
  if (!enquiry) return;

  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(quotationRequests);
  const quoteNumber = `Q-${new Date().getFullYear()}-${String(Number(total) + 1).padStart(4, "0")}`;
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

  await db.update(enquiries).set({ status: "quotation_sent", updatedAt: new Date() }).where(eq(enquiries.id, enquiryId));
  revalidatePath("/admin/quotations");
  revalidatePath("/admin/enquiries");
  redirect(`/admin/quotations/${quotation.id}`);
}

export async function saveQuotation(formData: FormData) {
  await requireAdmin();
  const id = Number(text(formData, "id"));
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

  revalidatePath("/admin/quotations");
  revalidatePath(`/admin/quotations/${id}`);
  revalidatePath("/admin");
}

export async function updateQuotationStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(text(formData, "id"));
  const status = text(formData, "status");
  if (!id || !status) return;
  await db.update(quotationRequests).set({ status, updatedAt: new Date() }).where(eq(quotationRequests.id, id));
  revalidatePath("/admin/quotations");
  revalidatePath(`/admin/quotations/${id}`);
}

export async function deleteQuotation(formData: FormData) {
  await requireAdmin();
  const id = Number(text(formData, "id"));
  if (!id) return;
  await db.delete(quotationRequests).where(eq(quotationRequests.id, id));
  revalidatePath("/admin/quotations");
  redirect("/admin/quotations");
}

export async function saveWebsiteSettings(formData: FormData) {
  await requireAdmin();
  const groups: Record<string, Record<string, string>> = {
    contact: {
      phone: text(formData, "contact.phone"),
      phoneHref: text(formData, "contact.phoneHref"),
      whatsapp: text(formData, "contact.whatsapp"),
      email: text(formData, "contact.email"),
      address: text(formData, "contact.address"),
      mapQuery: text(formData, "contact.mapQuery"),
      hours: text(formData, "contact.hours"),
      instagram: text(formData, "contact.instagram"),
      linkedin: text(formData, "contact.linkedin"),
    },
    hero: {
      eyebrow: text(formData, "hero.eyebrow"),
      headline: text(formData, "hero.headline"),
      description: text(formData, "hero.description"),
      primaryCta: text(formData, "hero.primaryCta"),
      secondaryCta: text(formData, "hero.secondaryCta"),
      badge: text(formData, "hero.badge"),
    },
    footer: {
      tagline: text(formData, "footer.tagline"),
      note: text(formData, "footer.note"),
    },
    stats: {
      products: text(formData, "stats.products"),
      categories: text(formData, "stats.categories"),
      hampers: text(formData, "stats.hampers"),
      delivery: text(formData, "stats.delivery"),
    },
  };

  for (const [key, value] of Object.entries(groups)) {
    await db
      .insert(websiteSettings)
      .values({ key, value })
      .onConflictDoUpdate({ target: websiteSettings.key, set: { value, updatedAt: new Date() } });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export async function saveTestimonial(formData: FormData) {
  await requireAdmin();
  const id = Number(text(formData, "id"));
  const values = {
    customerName: text(formData, "customerName"),
    company: nullable(formData, "company"),
    quote: text(formData, "quote"),
    rating: Math.min(5, Math.max(1, Number(text(formData, "rating")) || 5)),
    isPublished: formData.get("isPublished") === "on",
    sortOrder: Number(text(formData, "sortOrder")) || 0,
  };
  if (!values.customerName || !values.quote) return;

  if (id) {
    await db.update(testimonials).set(values).where(eq(testimonials.id, id));
  } else {
    await db.insert(testimonials).values(values);
  }
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function deleteTestimonial(formData: FormData) {
  await requireAdmin();
  const id = Number(text(formData, "id"));
  if (!id) return;
  await db.delete(testimonials).where(eq(testimonials.id, id));
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function getCategoryOptions() {
  return db.select().from(categories).orderBy(categories.sortOrder);
}
