import { and, asc, count, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  categories,
  customizationOptions,
  productImages,
  products,
  productVariants,
  testimonials,
} from "@/lib/db/schema";

export type ProductCardData = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  pricePaise: number | null;
  minOrderQty: number;
  colors: string[];
  customizationOptions: string[];
  availability: string;
  isFeatured: boolean;
  productType: string;
  categoryName: string;
  categorySlug: string;
  image: string | null;
};

const cardSelect = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  sku: products.sku,
  shortDescription: products.shortDescription,
  pricePaise: products.pricePaise,
  minOrderQty: products.minOrderQty,
  colors: products.colors,
  customizationOptions: products.customizationOptions,
  availability: products.availability,
  isFeatured: products.isFeatured,
  productType: products.productType,
  categoryName: categories.name,
  categorySlug: categories.slug,
};

async function attachImages(rows: Omit<ProductCardData, "image">[]): Promise<ProductCardData[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id);
  const images = await db
    .select({ productId: productImages.productId, url: productImages.url, sortOrder: productImages.sortOrder })
    .from(productImages)
    .where(inArray(productImages.productId, ids))
    .orderBy(asc(productImages.sortOrder));
  const firstImage = new Map<number, string>();
  for (const image of images) {
    if (!firstImage.has(image.productId)) firstImage.set(image.productId, image.url);
  }
  return rows.map((row) => ({ ...row, image: firstImage.get(row.id) ?? null }));
}

export async function getCategories(kind?: "product" | "hamper") {
  return db
    .select()
    .from(categories)
    .where(and(eq(categories.isActive, true), kind ? eq(categories.kind, kind) : undefined))
    .orderBy(asc(categories.sortOrder));
}

export async function getCategoriesWithProducts() {
  const rows = await db
    .select({ categoryId: products.categoryId })
    .from(products)
    .where(eq(products.isActive, true))
    .groupBy(products.categoryId);
  return new Set(rows.map((row) => row.categoryId));
}

export async function getFeaturedProducts(limit = 8) {
  const rows = await db
    .select(cardSelect)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
    .orderBy(asc(products.sortOrder))
    .limit(limit);
  return attachImages(rows);
}

export async function getFeaturedHampers(limit = 4) {
  const rows = await db
    .select(cardSelect)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(eq(products.isActive, true), eq(products.productType, "hamper"), eq(products.isFeatured, true)),
    )
    .orderBy(asc(products.sortOrder))
    .limit(limit);
  return attachImages(rows);
}

export type CatalogueFilters = {
  q?: string;
  category?: string;
  price?: string;
  sort?: string;
  page?: number;
  kind?: "product" | "hamper";
  pageSize?: number;
};

export async function getCatalogue(filters: CatalogueFilters) {
  const pageSize = filters.pageSize ?? 12;
  const page = Math.max(1, filters.page ?? 1);
  const conditions = [eq(products.isActive, true)];

  if (filters.kind) conditions.push(eq(products.productType, filters.kind));
  if (filters.category) conditions.push(eq(categories.slug, filters.category));
  if (filters.q) {
    const term = `%${filters.q.trim()}%`;
    conditions.push(
      or(
        ilike(products.name, term),
        ilike(products.shortDescription, term),
        ilike(products.description, term),
        ilike(products.sku, term),
      )!,
    );
  }
  if (filters.price) {
    if (filters.price === "under-1000") conditions.push(lte(products.pricePaise, 100000));
    if (filters.price === "1000-2500")
      conditions.push(and(gte(products.pricePaise, 100000), lte(products.pricePaise, 250000))!);
    if (filters.price === "2500-5000")
      conditions.push(and(gte(products.pricePaise, 250000), lte(products.pricePaise, 500000))!);
    if (filters.price === "above-5000") conditions.push(gte(products.pricePaise, 500000));
  }

  const where = and(...conditions);
  const orderBy =
    filters.sort === "price-asc"
      ? [asc(sql`${products.pricePaise} NULLS LAST`)]
      : filters.sort === "price-desc"
        ? [desc(sql`${products.pricePaise} NULLS LAST`)]
        : filters.sort === "newest"
          ? [desc(products.createdAt)]
          : [asc(products.sortOrder), asc(products.id)];

  const rows = await db
    .select(cardSelect)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(where)
    .orderBy(...orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [{ total }] = await db
    .select({ total: count() })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(where);

  return {
    products: await attachImages(rows),
    total: Number(total),
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(Number(total) / pageSize)),
  };
}

export async function getProductBySlug(slug: string) {
  const [row] = await db
    .select({
      product: products,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);

  if (!row) return null;

  const [images, variants] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, row.product.id))
      .orderBy(asc(productImages.sortOrder)),
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, row.product.id))
      .orderBy(asc(productVariants.id)),
  ]);

  return { ...row.product, categoryName: row.categoryName, categorySlug: row.categorySlug, images, variants };
}

export async function getRelatedProducts(categoryId: number, excludeId: number, limit = 4) {
  const rows = await db
    .select(cardSelect)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.isActive, true), eq(products.categoryId, categoryId), sql`${products.id} <> ${excludeId}`))
    .limit(limit);
  return attachImages(rows);
}

export async function getProductsForSelect() {
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      pricePaise: products.pricePaise,
      colors: products.colors,
      minOrderQty: products.minOrderQty,
      customizationOptions: products.customizationOptions,
      productType: products.productType,
    })
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.name));
}

export async function getPublishedTestimonials() {
  return db
    .select()
    .from(testimonials)
    .where(eq(testimonials.isPublished, true))
    .orderBy(asc(testimonials.sortOrder));
}

export async function getCategoryBySlug(slug: string) {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return row ?? null;
}

export async function getCustomizationOptions() {
  return db
    .select({
      id: customizationOptions.id,
      name: customizationOptions.name,
      slug: customizationOptions.slug,
      description: customizationOptions.description,
      priceNote: customizationOptions.priceNote,
    })
    .from(customizationOptions)
    .where(eq(customizationOptions.isActive, true))
    .orderBy(asc(customizationOptions.sortOrder));
}
