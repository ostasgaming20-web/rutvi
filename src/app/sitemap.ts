import type { MetadataRoute } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { getSettings } from "@/lib/settings";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rutvienterprise.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const settings = await getSettings();
    if (!settings.seo.sitemapEnabled || !settings.seo.indexSite) return [];
  } catch {
    /* fall through to default sitemap */
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/products`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/hampers`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/customize`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/services`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/quote`, changeFrequency: "monthly", priority: 0.7 },
  ];

  try {
    const [productRows, categoryRows] = await Promise.all([
      db
        .select({ slug: products.slug, updatedAt: products.updatedAt })
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(desc(products.updatedAt)),
      db.select({ slug: categories.slug }).from(categories).where(eq(categories.isActive, true)),
    ]);

    return [
      ...staticRoutes,
      ...categoryRows.map((category) => ({
        url: `${BASE_URL}/products?category=${category.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...productRows.map((product) => ({
        url: `${BASE_URL}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.75,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
