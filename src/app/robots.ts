import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rutvienterprise.in";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let indexSite = true;
  let sitemapEnabled = true;
  try {
    const settings = await getSettings();
    indexSite = settings.seo.indexSite;
    sitemapEnabled = settings.seo.sitemapEnabled;
  } catch {
    indexSite = true;
  }

  if (!indexSite) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    ...(sitemapEnabled ? { sitemap: `${BASE_URL}/sitemap.xml`, host: BASE_URL } : {}),
  };
}
