"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { and, count, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  categories,
  hamperItems,
  mediaAssets,
  productImages,
  productVariants,
  products,
} from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import {
  bool,
  csv,
  lines,
  nullable,
  num,
  optionalNum,
  parseSpecs,
  redirectPath,
  rupeesToPaise,
  slugify,
  text,
} from "@/lib/form";

function revalidateCatalogue() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/hampers");
  revalidatePath("/admin/products");
  revalidatePath("/admin/hampers");
}

async function uniqueProductSlug(base: string, id?: number) {
  const root = slugify(base) || `product-${Date.now()}`;
  let slug = root;
  let attempt = 1;
  while (true) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(id ? and(eq(products.slug, slug), ne(products.id, id)) : eq(products.slug, slug))
      .limit(1);
    if (!existing) return slug;
    attempt += 1;
    slug = `${root}-${attempt}`;
  }
}

async function uniqueSku(base: string, id?: number) {
  const root = base || `RE-${Date.now().toString().slice(-6)}`;
  let sku = root;
  let attempt = 1;
  while (true) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(id ? and(eq(products.sku, sku), ne(products.id, id)) : eq(products.sku, sku))
      .limit(1);
    if (!existing) return sku;
    attempt += 1;
    sku = `${root}-${attempt}`;
  }
}

async function productPayload(formData: FormData, id?: number) {
  const name = text(formData, "name");
  const categoryId = num(formData, "categoryId");
  const images = lines(formData, "images");
  const productType = text(formData, "productType") || "product";

  if (!name) throw new Error("Product name is required.");
  if (!categoryId) throw new Error("Choose a category.");
  if (images.length === 0) throw new Error("Add at least one image.");

  return {
    values: {
      name,
      slug: await uniqueProductSlug(text(formData, "slug") || name, id),
      sku: await uniqueSku(text(formData, "sku"), id),
      shortDescription: nullable(formData, "shortDescription"),
      description: nullable(formData, "description"),
      categoryId,
      pricePaise: rupeesToPaise(text(formData, "price")),
      discountPricePaise: rupeesToPaise(text(formData, "discountPrice")),
      material: nullable(formData, "material"),
      size: nullable(formData, "size"),
      tags: csv(formData, "tags"),
      collection: nullable(formData, "collection"),
      minOrderQty: num(formData, "minOrderQty", 10) || 10,
      colors: csv(formData, "colors"),
      specifications: parseSpecs(formData),
      customizationOptions: formData.getAll("customizationOptions").map(String).filter(Boolean),
      contents: lines(formData, "contents"),
      packaging: nullable(formData, "packaging"),
      productType,
      availability: text(formData, "availability") || "in_stock",
      isFeatured: bool(formData, "isFeatured"),
      isActive: bool(formData, "isActive"),
      isArchived: bool(formData, "isArchived"),
      updatedAt: new Date(),
    },
    images,
  };
}

async function replaceImages(productId: number, images: string[], name: string) {
  await db.delete(productImages).where(eq(productImages.productId, productId));
  await db.insert(productImages).values(
    images.map((url, index) => ({ productId, url, alt: name, sortOrder: index })),
  );
}

export async function createProduct(formData: FormData) {
  const admin = await requireCapability("products.manage");
  try {
    const payload = await productPayload(formData);
    const [row] = await db.insert(products).values(payload.values).returning({ id: products.id });
    await replaceImages(row.id, payload.images, payload.values.name);
    await logAudit({
      actorEmail: admin.session.user.email,
      action: "product.create",
      entity: "product",
      entityId: row.id,
      meta: { name: payload.values.name, sku: payload.values.sku },
    });
    revalidateCatalogue();
    redirect(redirectPath("/admin/products", { ok: `${payload.values.name} created.` }));
  } catch (error) {
    if (isRedirect(error)) throw error;
    redirect(redirectPath("/admin/products/new", { error: message(error) }));
  }
}

export async function updateProduct(formData: FormData) {
  const admin = await requireCapability("products.manage");
  const id = num(formData, "id");
  if (!id) redirect(redirectPath("/admin/products", { error: "Missing product." }));
  try {
    const payload = await productPayload(formData, id);
    await db.update(products).set(payload.values).where(eq(products.id, id));
    await replaceImages(id, payload.images, payload.values.name);
    await logAudit({
      actorEmail: admin.session.user.email,
      action: "product.update",
      entity: "product",
      entityId: id,
      meta: { name: payload.values.name },
    });
    revalidateCatalogue();
    revalidatePath(`/products/${payload.values.slug}`);
    redirect(redirectPath("/admin/products", { ok: `${payload.values.name} updated.` }));
  } catch (error) {
    if (isRedirect(error)) throw error;
    redirect(redirectPath(`/admin/products/${id}`, { error: message(error) }));
  }
}

export async function deleteProduct(formData: FormData) {
  const admin = await requireCapability("products.manage");
  const id = num(formData, "id");
  if (!id) return;
  await db.delete(products).where(eq(products.id, id));
  await logAudit({ actorEmail: admin.session.user.email, action: "product.delete", entity: "product", entityId: id });
  revalidateCatalogue();
}

export async function archiveProduct(formData: FormData) {
  const admin = await requireCapability("products.manage");
  const id = num(formData, "id");
  if (!id) return;
  await db.update(products).set({ isArchived: true, isActive: false, updatedAt: new Date() }).where(eq(products.id, id));
  await logAudit({ actorEmail: admin.session.user.email, action: "product.archive", entity: "product", entityId: id });
  revalidateCatalogue();
}

export async function restoreProduct(formData: FormData) {
  const admin = await requireCapability("products.manage");
  const id = num(formData, "id");
  if (!id) return;
  await db.update(products).set({ isArchived: false, isActive: true, updatedAt: new Date() }).where(eq(products.id, id));
  await logAudit({ actorEmail: admin.session.user.email, action: "product.restore", entity: "product", entityId: id });
  revalidateCatalogue();
}

export async function toggleProductFlag(formData: FormData) {
  const admin = await requireCapability("products.manage");
  const id = num(formData, "id");
  const field = text(formData, "field");
  if (!id || !["isActive", "isFeatured"].includes(field)) return;
  await db
    .update(products)
    .set(
      field === "isActive"
        ? { isActive: sql`not ${products.isActive}`, updatedAt: new Date() }
        : { isFeatured: sql`not ${products.isFeatured}`, updatedAt: new Date() },
    )
    .where(eq(products.id, id));
  await logAudit({ actorEmail: admin.session.user.email, action: `product.toggle.${field}`, entity: "product", entityId: id });
  revalidateCatalogue();
}

export async function bulkProductAction(formData: FormData) {
  const admin = await requireCapability("products.manage");
  const ids = formData
    .getAll("ids")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);
  const action = text(formData, "bulkAction");
  if (ids.length === 0) redirect(redirectPath("/admin/products", { error: "Select at least one product." }));

  for (const id of ids) {
    if (action === "activate") await db.update(products).set({ isActive: true, updatedAt: new Date() }).where(eq(products.id, id));
    if (action === "deactivate") await db.update(products).set({ isActive: false, updatedAt: new Date() }).where(eq(products.id, id));
    if (action === "feature") await db.update(products).set({ isFeatured: true, updatedAt: new Date() }).where(eq(products.id, id));
    if (action === "unfeature") await db.update(products).set({ isFeatured: false, updatedAt: new Date() }).where(eq(products.id, id));
    if (action === "archive") await db.update(products).set({ isArchived: true, isActive: false, updatedAt: new Date() }).where(eq(products.id, id));
    if (action === "delete") await db.delete(products).where(eq(products.id, id));
  }

  await logAudit({
    actorEmail: admin.session.user.email,
    action: `product.bulk.${action}`,
    entity: "product",
    meta: { count: ids.length, ids },
  });
  revalidateCatalogue();
  redirect(redirectPath("/admin/products", { ok: `${ids.length} product(s) updated.` }));
}

/* ------------------------------- categories ------------------------------- */

export async function saveCategory(formData: FormData) {
  const admin = await requireCapability("categories.manage");
  const id = num(formData, "id");
  const name = text(formData, "name");
  if (!name) redirect(redirectPath("/admin/categories", { error: "Category name is required." }));

  const parentId = optionalNum(formData, "parentId");
  const values = {
    name,
    slug: slugify(text(formData, "slug") || name),
    description: nullable(formData, "description"),
    imageUrl: nullable(formData, "imageUrl"),
    kind: text(formData, "kind") || "product",
    parentId: parentId && parentId !== id ? parentId : null,
    metaTitle: nullable(formData, "metaTitle"),
    metaDescription: nullable(formData, "metaDescription"),
    sortOrder: num(formData, "sortOrder"),
    isActive: bool(formData, "isActive"),
  };

  try {
    if (id) {
      await db.update(categories).set(values).where(eq(categories.id, id));
    } else {
      await db.insert(categories).values(values);
    }
    await logAudit({ actorEmail: admin.session.user.email, action: id ? "category.update" : "category.create", entity: "category", entityId: id || null, meta: { name } });
    revalidateCatalogue();
    revalidatePath("/admin/categories");
    redirect(redirectPath("/admin/categories", { ok: `${name} saved.` }));
  } catch (error) {
    if (isRedirect(error)) throw error;
    redirect(redirectPath("/admin/categories", { error: "A category with that slug already exists." }));
  }
}

export async function deleteCategory(formData: FormData) {
  const admin = await requireCapability("categories.manage");
  const id = num(formData, "id");
  if (!id) return;
  const [{ value }] = await db.select({ value: count() }).from(products).where(eq(products.categoryId, id));
  if (Number(value) > 0) {
    redirect(redirectPath("/admin/categories", { error: "Move or delete products in this category first." }));
  }
  await db.delete(categories).where(eq(categories.id, id));
  await logAudit({ actorEmail: admin.session.user.email, action: "category.delete", entity: "category", entityId: id });
  revalidateCatalogue();
  revalidatePath("/admin/categories");
}

/* --------------------------------- hampers -------------------------------- */

export async function saveHamperItems(formData: FormData) {
  const admin = await requireCapability("hampers.manage");
  const hamperId = num(formData, "hamperId");
  if (!hamperId) return;

  let rows: { name: string; description?: string; quantity?: number; imageUrl?: string }[] = [];
  try {
    rows = JSON.parse(text(formData, "items") || "[]");
  } catch {
    rows = [];
  }

  const cleaned = rows
    .filter((row) => row.name?.trim())
    .map((row, index) => ({
      hamperId,
      name: row.name.trim().slice(0, 160),
      description: row.description?.trim().slice(0, 300) || null,
      quantity: Math.max(1, Math.round(Number(row.quantity) || 1)),
      imageUrl: row.imageUrl?.trim() || null,
      sortOrder: index,
    }));

  await db.delete(hamperItems).where(eq(hamperItems.hamperId, hamperId));
  if (cleaned.length > 0) await db.insert(hamperItems).values(cleaned);
  await logAudit({ actorEmail: admin.session.user.email, action: "hamper.items.update", entity: "product", entityId: hamperId, meta: { count: cleaned.length } });
  revalidatePath(`/admin/hampers/${hamperId}`);
  revalidatePath("/hampers");
  redirect(redirectPath(`/admin/hampers/${hamperId}`, { ok: "Hamper contents saved." }));
}

/* ---------------------------------- media --------------------------------- */

export async function renameMedia(formData: FormData) {
  const admin = await requireCapability("media.manage");
  const id = num(formData, "id");
  const originalName = text(formData, "originalName");
  const folder = text(formData, "folder") || "general";
  const alt = nullable(formData, "alt");
  if (!id || !originalName) return;
  await db.update(mediaAssets).set({ originalName, folder, alt }).where(eq(mediaAssets.id, id));
  await logAudit({ actorEmail: admin.session.user.email, action: "media.rename", entity: "media_asset", entityId: id });
  revalidatePath("/admin/media");
}

export async function deleteMedia(formData: FormData) {
  const admin = await requireCapability("media.manage");
  const id = num(formData, "id");
  if (!id) return;
  const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  if (!asset) return;

  try {
    const filePath = path.join(process.cwd(), "public", asset.url.replace(/^\//, ""));
    await unlink(filePath);
  } catch {
    /* file may already be gone */
  }

  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  await logAudit({ actorEmail: admin.session.user.email, action: "media.delete", entity: "media_asset", entityId: id, meta: { url: asset.url } });
  revalidatePath("/admin/media");
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function isRedirect(error: unknown) {
  return typeof error === "object" && error !== null && "digest" in error && String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT");
}

export async function getVariantCount(productId: number) {
  const [row] = await db.select({ value: count() }).from(productVariants).where(eq(productVariants.productId, productId));
  return Number(row.value);
}
