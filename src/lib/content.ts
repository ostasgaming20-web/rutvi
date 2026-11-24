import { and, asc, desc, eq, gte, lte, or, isNull, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  contentVersions,
  homepageSections,
  navigationMenus,
  promoCampaigns,
  seoMetadata,
} from "@/lib/db/schema";

export type ContentScope = "settings" | "homepage" | "navigation" | "seo" | "marketing";

export const CONTENT_SCOPES: ContentScope[] = ["settings", "homepage", "navigation", "seo", "marketing"];

export const SCOPE_LABELS: Record<ContentScope, string> = {
  settings: "Branding & website settings",
  homepage: "Homepage sections",
  navigation: "Navigation & menus",
  seo: "SEO metadata",
  marketing: "Marketing campaigns",
};

export async function isPreviewMode() {
  try {
    const store = await cookies();
    if (store.get("rutvi_preview")?.value !== "1") return false;
    const { getAdminSession } = await import("@/lib/admin");
    return Boolean(await getAdminSession());
  } catch {
    return false;
  }
}

const DATE_FIELDS = ["createdAt", "updatedAt", "startsAt", "endsAt", "publishedAt", "lastLoginAt"];

function reviveDates<T>(row: Record<string, unknown>): T {
  const output: Record<string, unknown> = { ...row };
  for (const field of DATE_FIELDS) {
    const value = output[field];
    if (typeof value === "string") output[field] = new Date(value);
  }
  return output as T;
}

export async function latestVersion(scope: ContentScope) {
  const [row] = await db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.scope, scope))
    .orderBy(desc(contentVersions.version))
    .limit(1);
  return row ?? null;
}

async function snapshotItems<T>(scope: ContentScope): Promise<T[] | null> {
  const version = await latestVersion(scope);
  if (!version) return null;
  const items = (version.snapshot as { items?: Record<string, unknown>[] }).items;
  if (!Array.isArray(items)) return null;
  return items.map((item) => reviveDates<T>(item));
}

/* ------------------------------- homepage -------------------------------- */

export type HomepageSectionData = {
  id: number;
  key: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  eyebrow: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  settings: Record<string, unknown>;
  isEnabled: boolean;
  sortOrder: number;
};

export const defaultHomepageSections: Omit<HomepageSectionData, "id">[] = [
  {
    key: "hero",
    type: "hero",
    title: null,
    subtitle: null,
    body: null,
    eyebrow: null,
    imageUrl: "/uploads/products/re003d-gift-set.jpg",
    ctaLabel: null,
    ctaHref: "/products",
    secondaryCtaLabel: null,
    secondaryCtaHref: "/quote",
    settings: { show3d: true, align: "left" },
    isEnabled: true,
    sortOrder: 0,
  },
  {
    key: "highlights",
    type: "highlights",
    title: "Why teams choose RUTVI",
    subtitle: null,
    body: null,
    eyebrow: null,
    imageUrl: null,
    ctaLabel: null,
    ctaHref: null,
    secondaryCtaLabel: null,
    secondaryCtaHref: null,
    settings: {},
    isEnabled: true,
    sortOrder: 1,
  },
  {
    key: "marquee",
    type: "marquee",
    title: null,
    subtitle: null,
    body: "Corporate gift sets, Customized pens, Diaries & notebooks, Bottles & mugs, Laptop bags, Tech accessories, Trophies & awards, Employee welcome kits, Festive hampers",
    eyebrow: null,
    imageUrl: null,
    ctaLabel: null,
    ctaHref: null,
    secondaryCtaLabel: null,
    secondaryCtaHref: null,
    settings: {},
    isEnabled: true,
    sortOrder: 2,
  },
  {
    key: "categories",
    type: "categories",
    title: "Explore the collection",
    subtitle: "Shop by category",
    body: "Fifteen curated categories covering everything from executive gifts to festive hampers.",
    eyebrow: "Categories",
    imageUrl: null,
    ctaLabel: "View all categories",
    ctaHref: "/products",
    secondaryCtaLabel: null,
    secondaryCtaHref: null,
    settings: { limit: 8 },
    isEnabled: true,
    sortOrder: 3,
  },
  {
    key: "featured",
    type: "featured",
    title: "Featured gifts, chosen by our team",
    subtitle: "Signature pieces",
    body: "A short edit of the pieces our clients return for — thoughtfully made, easy to brand and ready for bulk orders.",
    eyebrow: "Signature pieces",
    imageUrl: null,
    ctaLabel: "Shop all gifts",
    ctaHref: "/products",
    secondaryCtaLabel: null,
    secondaryCtaHref: null,
    settings: { limit: 8, collection: "" },
    isEnabled: true,
    sortOrder: 4,
  },
  {
    key: "customization",
    type: "customization",
    title: "Make it unmistakably yours",
    subtitle: null,
    body: "Logo debossing, foil stamping, laser engraving and custom packaging — applied with care.",
    eyebrow: "Customisation",
    imageUrl: null,
    ctaLabel: "Build your gift",
    ctaHref: "/customize",
    secondaryCtaLabel: null,
    secondaryCtaHref: null,
    settings: {},
    isEnabled: true,
    sortOrder: 5,
  },
  {
    key: "hampers",
    type: "hampers",
    title: "Hampers & gift sets",
    subtitle: "Curated hampers",
    body: "Festive, executive and employee welcome hampers built around your brief.",
    eyebrow: "Hampers",
    imageUrl: null,
    ctaLabel: "Explore hampers",
    ctaHref: "/hampers",
    secondaryCtaLabel: null,
    secondaryCtaHref: null,
    settings: { limit: 3 },
    isEnabled: true,
    sortOrder: 6,
  },
  {
    key: "why-choose",
    type: "why-choose",
    title: "Trusted for the moments that matter",
    subtitle: null,
    body: null,
    eyebrow: "Why RUTVI",
    imageUrl: null,
    ctaLabel: null,
    ctaHref: null,
    secondaryCtaLabel: null,
    secondaryCtaHref: null,
    settings: {},
    isEnabled: true,
    sortOrder: 7,
  },
  {
    key: "process",
    type: "process",
    title: "From brief to delivery",
    subtitle: null,
    body: null,
    eyebrow: "How it works",
    imageUrl: null,
    ctaLabel: null,
    ctaHref: null,
    secondaryCtaLabel: null,
    secondaryCtaHref: null,
    settings: {},
    isEnabled: true,
    sortOrder: 8,
  },
  {
    key: "testimonials",
    type: "testimonials",
    title: "Trusted for the moments that matter",
    subtitle: null,
    body: null,
    eyebrow: "Client words",
    imageUrl: null,
    ctaLabel: null,
    ctaHref: null,
    secondaryCtaLabel: null,
    secondaryCtaHref: null,
    settings: {},
    isEnabled: true,
    sortOrder: 9,
  },
  {
    key: "enquiry",
    type: "enquiry",
    title: "Let's make your next gift unforgettable.",
    subtitle: null,
    body: "Share the occasion, quantity and budget. We will come back with a considered proposal, samples where needed, and clear timelines.",
    eyebrow: "Corporate enquiry",
    imageUrl: "/uploads/products/gift-bags.jpg",
    ctaLabel: "Request a corporate quotation",
    ctaHref: "/quote",
    secondaryCtaLabel: null,
    secondaryCtaHref: null,
    settings: {},
    isEnabled: true,
    sortOrder: 10,
  },
];

export const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: "Hero",
  highlights: "Business highlights",
  marquee: "Scrolling marquee",
  categories: "Category grid",
  featured: "Featured products",
  customization: "Customisation showcase",
  hampers: "Hamper showcase",
  "why-choose": "Why choose us",
  process: "How it works",
  testimonials: "Testimonials",
  enquiry: "Enquiry form",
};

export async function getHomepageSections(): Promise<HomepageSectionData[]> {
  const preview = await isPreviewMode();
  if (!preview) {
    const published = await snapshotItems<HomepageSectionData>("homepage");
    if (published && published.length > 0) return published;
  }
  try {
    const rows = await db.select().from(homepageSections).orderBy(asc(homepageSections.sortOrder));
    if (rows.length > 0) return rows as HomepageSectionData[];
  } catch {
    /* fall through */
  }
  return defaultHomepageSections.map((section, index) => ({ ...section, id: -(index + 1) }));
}

/* ------------------------------ navigation ------------------------------- */

export type NavItemData = {
  id: number;
  location: string;
  label: string;
  href: string;
  parentId: number | null;
  isExternal: boolean;
  isActive: boolean;
  badge: string | null;
  sortOrder: number;
};

export const defaultNavigation: Omit<NavItemData, "id">[] = [
  { location: "header", label: "Home", href: "/", parentId: null, isExternal: false, isActive: true, badge: null, sortOrder: 0 },
  { location: "header", label: "Products", href: "/products", parentId: null, isExternal: false, isActive: true, badge: null, sortOrder: 1 },
  { location: "header", label: "Customize Your Gift", href: "/customize", parentId: null, isExternal: false, isActive: true, badge: null, sortOrder: 2 },
  { location: "header", label: "Hampers & Gift Sets", href: "/hampers", parentId: null, isExternal: false, isActive: true, badge: null, sortOrder: 3 },
  { location: "header", label: "Services", href: "/services", parentId: null, isExternal: false, isActive: true, badge: null, sortOrder: 4 },
  { location: "header", label: "About Us", href: "/about", parentId: null, isExternal: false, isActive: true, badge: null, sortOrder: 5 },
  { location: "header", label: "Contact", href: "/contact", parentId: null, isExternal: false, isActive: true, badge: null, sortOrder: 6 },
  { location: "footer", label: "Products", href: "/products", parentId: null, isExternal: false, isActive: true, badge: null, sortOrder: 0 },
  { location: "footer", label: "Customize Your Gift", href: "/customize", parentId: null, isExternal: false, isActive: true, badge: null, sortOrder: 1 },
  { location: "footer", label: "Hampers & Gift Sets", href: "/hampers", parentId: null, isExternal: false, isActive: true, badge: null, sortOrder: 2 },
  { location: "footer", label: "Services", href: "/services", parentId: null, isExternal: false, isActive: true, badge: null, sortOrder: 3 },
  { location: "footer", label: "About Us", href: "/about", parentId: null, isExternal: false, isActive: true, badge: null, sortOrder: 4 },
  { location: "footer", label: "Contact", href: "/contact", parentId: null, isExternal: false, isActive: true, badge: null, sortOrder: 5 },
  { location: "footer", label: "Request a Quote", href: "/quote", parentId: null, isExternal: false, isActive: true, badge: null, sortOrder: 6 },
];

export async function getNavigation(location: "header" | "footer" | "mobile" = "header"): Promise<NavItemData[]> {
  const preview = await isPreviewMode();
  let rows: NavItemData[] | null = null;

  if (!preview) {
    const published = await snapshotItems<NavItemData>("navigation");
    if (published) rows = published.filter((row) => row.location === location && row.isActive);
  }

  if (!rows) {
    try {
      const all = await db
        .select()
        .from(navigationMenus)
        .where(and(eq(navigationMenus.location, location), eq(navigationMenus.isActive, true)))
        .orderBy(asc(navigationMenus.sortOrder));
      rows = all as NavItemData[];
    } catch {
      rows = [];
    }
  }

  if (rows.length === 0) {
    return defaultNavigation
      .filter((item) => item.location === location)
      .map((item, index) => ({ ...item, id: -(index + 1) }));
  }
  return rows.sort((a, b) => a.sortOrder - b.sortOrder);
}

/* ---------------------------------- seo ---------------------------------- */

export type SeoEntry = {
  id: number;
  path: string;
  title: string | null;
  description: string | null;
  ogImage: string | null;
  canonical: string | null;
  robots: string;
  keywords: string | null;
  altText: string | null;
};

export async function getSeoMetadata(): Promise<SeoEntry[]> {
  const preview = await isPreviewMode();
  if (!preview) {
    const published = await snapshotItems<SeoEntry>("seo");
    if (published) return published;
  }
  try {
    return (await db.select().from(seoMetadata).orderBy(asc(seoMetadata.path))) as SeoEntry[];
  } catch {
    return [];
  }
}

export async function getSeoForPath(path: string) {
  const rows = await getSeoMetadata();
  return rows.find((row) => row.path === path) ?? null;
}

/* ------------------------------- marketing -------------------------------- */

export type CampaignData = {
  id: number;
  name: string;
  type: string;
  placement: string;
  headline: string | null;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
  sortOrder: number;
};

export async function getActiveCampaigns(placement?: string): Promise<CampaignData[]> {
  const preview = await isPreviewMode();
  const now = new Date();
  const withinWindow = (campaign: CampaignData) => {
    if (preview) return campaign.isActive;
    if (!campaign.isActive) return false;
    if (campaign.startsAt && campaign.startsAt > now) return false;
    if (campaign.endsAt && campaign.endsAt < now) return false;
    return true;
  };

  let rows: CampaignData[] | null = null;
  if (!preview) {
    const published = await snapshotItems<CampaignData>("marketing");
    if (published) rows = published;
  }
  if (!rows) {
    try {
      rows = (await db
        .select()
        .from(promoCampaigns)
        .where(eq(promoCampaigns.isActive, true))
        .orderBy(asc(promoCampaigns.sortOrder))) as CampaignData[];
    } catch {
      rows = [];
    }
  }

  return rows
    .filter(withinWindow)
    .filter((campaign) => (placement ? campaign.placement === placement : true))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getAnnouncement() {
  const campaigns = await getActiveCampaigns("site_top");
  const campaign = campaigns.find((item) => item.type === "announcement");
  if (campaign) {
    return { text: campaign.headline ?? "", href: campaign.ctaHref ?? null, id: campaign.id };
  }
  return null;
}

/* ------------------------------ helper queries ---------------------------- */

export async function countContentVersions(scope: ContentScope) {
  const [row] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(contentVersions)
    .where(eq(contentVersions.scope, scope));
  return Number(row?.value ?? 0);
}

export async function listVersions(scope: ContentScope, limit = 20) {
  return db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.scope, scope))
    .orderBy(desc(contentVersions.version))
    .limit(limit);
}

export async function getVersion(id: number) {
  const [row] = await db.select().from(contentVersions).where(eq(contentVersions.id, id)).limit(1);
  return row ?? null;
}

export { and, gte, lte, or, isNull };
