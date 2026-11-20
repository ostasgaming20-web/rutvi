import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { websiteSettings } from "@/lib/db/schema";

export type ContactSettings = {
  phone: string;
  phoneHref: string;
  whatsapp: string;
  email: string;
  address: string;
  mapQuery: string;
  hours: string;
  instagram: string;
  linkedin: string;
};

export type HeroSettings = {
  eyebrow: string;
  headline: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  badge: string;
};

export type FooterSettings = {
  tagline: string;
  note: string;
};

export type StatsSettings = {
  products: string;
  categories: string;
  hampers: string;
  delivery: string;
};

export const defaultContact: ContactSettings = {
  phone: "+91 98699 94699",
  phoneHref: "+919869994699",
  whatsapp: "919869994699",
  email: "sales.rutvi@gmail.com",
  address:
    "Kondivita Road, Opposite Aqua Metro Station, MIDC, Andheri East, Mumbai, Maharashtra, India",
  mapQuery: "Kondivita Road, Andheri East, Mumbai, Maharashtra",
  hours: "Monday – Saturday, 10:00 – 19:00",
  instagram: "https://instagram.com",
  linkedin: "https://linkedin.com",
};

export const defaultHero: HeroSettings = {
  eyebrow: "Corporate gifting, considered",
  headline: "Make Every Gift a Lasting Impression.",
  description:
    "Discover premium corporate gifting, customized merchandise and thoughtfully curated hampers designed to strengthen business relationships.",
  primaryCta: "Explore Our Collection",
  secondaryCta: "Request a Quote",
  badge: "Trusted by teams across Mumbai",
};

export const defaultFooter: FooterSettings = {
  tagline: "Corporate gift suppliers helping Mumbai businesses make every gift count.",
  note: "Corporate gifting, customized merchandise and curated hampers, delivered across India.",
};

export const defaultStats: StatsSettings = {
  products: "35",
  categories: "15",
  hampers: "7",
  delivery: "Pan-India",
};

export async function getSettings() {
  let rows: { key: string; value: Record<string, unknown> }[] = [];
  try {
    rows = await db
      .select({ key: websiteSettings.key, value: websiteSettings.value })
      .from(websiteSettings);
  } catch {
    rows = [];
  }
  const map = new Map(rows.map((row) => [row.key, row.value]));

  return {
    contact: { ...defaultContact, ...(map.get("contact") ?? {}) } as ContactSettings,
    hero: { ...defaultHero, ...(map.get("hero") ?? {}) } as HeroSettings,
    footer: { ...defaultFooter, ...(map.get("footer") ?? {}) } as FooterSettings,
    stats: { ...defaultStats, ...(map.get("stats") ?? {}) } as StatsSettings,
  };
}

export async function getSetting<T extends Record<string, unknown>>(key: string, fallback: T) {
  const [row] = await db
    .select()
    .from(websiteSettings)
    .where(eq(websiteSettings.key, key))
    .limit(1);
  return (row?.value ?? fallback) as T;
}

export async function getSettingsByKeys(keys: string[]) {
  if (keys.length === 0) return [];
  return db.select().from(websiteSettings).where(inArray(websiteSettings.key, keys));
}
