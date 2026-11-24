import { eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
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
  facebook: string;
  youtube: string;
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

export type BrandingSettings = {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  buttonStyle: "rounded" | "pill" | "square";
  headingFont: string;
  bodyFont: string;
  backgroundColor: string;
  surfaceColor: string;
  radius: string;
  announcement: string;
  announcementHref: string;
};

export type BusinessSettings = {
  businessName: string;
  legalName: string;
  gstin: string;
  copyright: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  siteVisible: boolean;
  contactHeading: string;
  contactIntro: string;
};

export type SeoSettings = {
  titleTemplate: string;
  defaultOgImage: string;
  twitterHandle: string;
  sitemapEnabled: boolean;
  robotsTxt: string;
  indexSite: boolean;
};

export type ThreeSettings = {
  modelUrl: string;
  boxColor: string;
  lidColor: string;
  ribbonColor: string;
  bowColor: string;
  scale: number;
  positionY: number;
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  cameraFov: number;
  lightIntensity: number;
  ambientIntensity: number;
  background: string;
  autoRotate: boolean;
  rotateSpeed: number;
  enableZoom: boolean;
  showProducts: boolean;
  openingAnimation: "unwrap" | "fade" | "none";
  unwrapLabel: string;
  animationAssetUrl: string;
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
  facebook: "",
  youtube: "",
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

export const defaultBranding: BrandingSettings = {
  siteName: "RUTVI ENTERPRISE",
  tagline: "Corporate gifting, considered",
  logoUrl: "/brand/rutvi-logo.jpg",
  faviconUrl: "/favicon.ico",
  primaryColor: "#0d1f3c",
  accentColor: "#c3a068",
  buttonStyle: "rounded",
  headingFont: "Cormorant Garamond",
  bodyFont: "Manrope",
  backgroundColor: "#f8f5ef",
  surfaceColor: "#fffdf9",
  radius: "0.75rem",
  announcement: "",
  announcementHref: "",
};

export const defaultBusiness: BusinessSettings = {
  businessName: "RUTVI ENTERPRISE",
  legalName: "RUTVI ENTERPRISE",
  gstin: "",
  copyright: "© RUTVI ENTERPRISE. All rights reserved.",
  maintenanceMode: false,
  maintenanceMessage: "We are polishing the collection and will be back shortly.",
  siteVisible: true,
  contactHeading: "Let's talk gifting",
  contactIntro: "Share your brief and our team will respond within one business day.",
};

export const defaultSeo: SeoSettings = {
  titleTemplate: "%s | RUTVI ENTERPRISE",
  defaultOgImage: "/uploads/products/re003d-gift-set.jpg",
  twitterHandle: "",
  sitemapEnabled: true,
  robotsTxt: "",
  indexSite: true,
};

export const defaultThree: ThreeSettings = {
  modelUrl: "",
  boxColor: "#f2ebe0",
  lidColor: "#f7f1e7",
  ribbonColor: "#101014",
  bowColor: "#c9a468",
  scale: 1,
  positionY: 0,
  cameraX: 0,
  cameraY: 1.75,
  cameraZ: 6.6,
  cameraFov: 32,
  lightIntensity: 1,
  ambientIntensity: 1,
  background: "",
  autoRotate: false,
  rotateSpeed: 0.9,
  enableZoom: true,
  showProducts: true,
  openingAnimation: "unwrap",
  unwrapLabel: "UNWRAP YOUR GIFT",
  animationAssetUrl: "",
};

type SettingsMap = Map<string, Record<string, unknown>>;

export type SiteContent = {
  contact: ContactSettings;
  hero: HeroSettings;
  footer: FooterSettings;
  stats: StatsSettings;
  branding: BrandingSettings;
  business: BusinessSettings;
  seo: SeoSettings;
  three: ThreeSettings;
};

function merge<T>(defaults: T, value: Record<string, unknown> | undefined): T {
  return { ...defaults, ...(value ?? {}) } as T;
}

export function buildContent(map: SettingsMap): SiteContent {
  return {
    contact: merge(defaultContact, map.get("contact")),
    hero: merge(defaultHero, map.get("hero")),
    footer: merge(defaultFooter, map.get("footer")),
    stats: merge(defaultStats, map.get("stats")),
    branding: merge(defaultBranding, map.get("branding")),
    business: merge(defaultBusiness, map.get("business")),
    seo: merge(defaultSeo, map.get("seo")),
    three: merge(defaultThree, map.get("three")),
  };
}

async function loadSettings(preview: boolean): Promise<SettingsMap> {
  let rows: { key: string; value: Record<string, unknown>; draftValue: Record<string, unknown> | null }[] = [];
  try {
    rows = await db
      .select({
        key: websiteSettings.key,
        value: websiteSettings.value,
        draftValue: websiteSettings.draftValue,
      })
      .from(websiteSettings);
  } catch {
    rows = [];
  }
  return new Map(
    rows.map((row) => [row.key, preview && row.draftValue ? row.draftValue : row.value]),
  );
}

async function isPreviewRequest() {
  try {
    const store = await cookies();
    if (store.get("rutvi_preview")?.value !== "1") return false;
    const { getAdminSession } = await import("@/lib/admin");
    const session = await getAdminSession();
    return Boolean(session);
  } catch {
    return false;
  }
}

/**
 * Content for the public website. Automatically serves drafts when an
 * authenticated admin is previewing (rutvi_preview cookie).
 */
export async function getSettings(): Promise<SiteContent> {
  const preview = await isPreviewRequest();
  return buildContent(await loadSettings(preview));
}

/** Published content only — used by admin screens for baseline comparison. */
export async function getPublishedSettings(): Promise<SiteContent> {
  return buildContent(await loadSettings(false));
}

/** Draft (falling back to published) content for admin editing screens. */
export async function getDraftSettings(): Promise<SiteContent> {
  return buildContent(await loadSettings(true));
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

export function brandingStyle(branding: BrandingSettings) {
  const radius =
    branding.buttonStyle === "pill" ? "9999px" : branding.buttonStyle === "square" ? "0.15rem" : branding.radius;
  return {
    "--color-navy": branding.primaryColor,
    "--primary": branding.primaryColor,
    "--color-gold": branding.accentColor,
    "--accent": branding.accentColor,
    "--color-ivory": branding.backgroundColor,
    "--background": branding.backgroundColor,
    "--color-card": branding.surfaceColor,
    "--radius": radius,
  } as React.CSSProperties;
}
