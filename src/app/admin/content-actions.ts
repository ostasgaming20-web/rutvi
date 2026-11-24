"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  homepageSections,
  navigationMenus,
  promoCampaigns,
  seoMetadata,
  websiteSettings,
} from "@/lib/db/schema";
import { requireAdmin, requireCapability } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { publishScope, restoreVersion } from "@/lib/publishing";
import type { ContentScope } from "@/lib/content";
import { CONTENT_SCOPES } from "@/lib/content";
import { bool, nullable, optionalNum, text, redirectPath } from "@/lib/form";

function revalidateSite() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/hampers");
  revalidatePath("/customize");
}

function parseScope(value: string): ContentScope {
  if (!CONTENT_SCOPES.includes(value as ContentScope)) throw new Error("Unknown content scope.");
  return value as ContentScope;
}

async function saveDraftGroup(key: string, value: Record<string, unknown>, actorEmail: string) {
  await db
    .insert(websiteSettings)
    .values({ key, value, draftValue: value, updatedBy: actorEmail, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: websiteSettings.key,
      set: { draftValue: value, updatedBy: actorEmail, updatedAt: new Date() },
    });
}

/* ------------------------------- branding -------------------------------- */

export async function saveBranding(formData: FormData) {
  const admin = await requireCapability("content.edit");
  const value = {
    siteName: text(formData, "siteName") || "RUTVI ENTERPRISE",
    tagline: text(formData, "tagline"),
    logoUrl: text(formData, "logoUrl"),
    faviconUrl: text(formData, "faviconUrl"),
    primaryColor: text(formData, "primaryColor") || "#0d1f3c",
    accentColor: text(formData, "accentColor") || "#c3a068",
    buttonStyle: text(formData, "buttonStyle") || "rounded",
    headingFont: text(formData, "headingFont"),
    bodyFont: text(formData, "bodyFont"),
    backgroundColor: text(formData, "backgroundColor") || "#f8f5ef",
    surfaceColor: text(formData, "surfaceColor") || "#fffdf9",
    radius: text(formData, "radius") || "0.75rem",
    announcement: text(formData, "announcement"),
    announcementHref: text(formData, "announcementHref"),
  };
  await saveDraftGroup("branding", value, admin.session.user.email);
  await logAudit({ actorEmail: admin.session.user.email, action: "branding.draft", entity: "settings", entityId: "branding" });
  revalidatePath("/admin/customisation");
  redirect(redirectPath("/admin/customisation", { ok: "Branding saved as draft. Publish to go live." }));
}

export async function saveBusinessSettings(formData: FormData) {
  const admin = await requireCapability("settings.manage");
  const value = {
    businessName: text(formData, "businessName"),
    legalName: text(formData, "legalName"),
    gstin: text(formData, "gstin"),
    copyright: text(formData, "copyright"),
    maintenanceMode: bool(formData, "maintenanceMode"),
    maintenanceMessage: text(formData, "maintenanceMessage"),
    siteVisible: bool(formData, "siteVisible"),
    contactHeading: text(formData, "contactHeading"),
    contactIntro: text(formData, "contactIntro"),
  };
  await saveDraftGroup("business", value, admin.session.user.email);
  await logAudit({ actorEmail: admin.session.user.email, action: "settings.draft", entity: "settings", entityId: "business" });
  revalidatePath("/admin/settings");
  redirect(redirectPath("/admin/settings", { ok: "Website settings saved as draft." }));
}

export async function saveContactSettings(formData: FormData) {
  const admin = await requireCapability("settings.manage");
  const value = {
    phone: text(formData, "phone"),
    phoneHref: text(formData, "phoneHref"),
    whatsapp: text(formData, "whatsapp"),
    email: text(formData, "email"),
    address: text(formData, "address"),
    mapQuery: text(formData, "mapQuery"),
    hours: text(formData, "hours"),
    instagram: text(formData, "instagram"),
    linkedin: text(formData, "linkedin"),
    facebook: text(formData, "facebook"),
    youtube: text(formData, "youtube"),
  };
  await saveDraftGroup("contact", value, admin.session.user.email);
  await logAudit({ actorEmail: admin.session.user.email, action: "settings.draft", entity: "settings", entityId: "contact" });
  revalidatePath("/admin/settings");
  redirect(redirectPath("/admin/settings", { ok: "Contact details saved as draft." }));
}

export async function saveHeroSettings(formData: FormData) {
  const admin = await requireCapability("content.edit");
  const value = {
    eyebrow: text(formData, "eyebrow"),
    headline: text(formData, "headline"),
    description: text(formData, "description"),
    primaryCta: text(formData, "primaryCta"),
    secondaryCta: text(formData, "secondaryCta"),
    badge: text(formData, "badge"),
  };
  await saveDraftGroup("hero", value, admin.session.user.email);
  revalidatePath("/admin/customisation");
  redirect(redirectPath("/admin/customisation", { ok: "Hero copy saved as draft." }));
}

export async function saveFooterSettings(formData: FormData) {
  const admin = await requireCapability("content.edit");
  const value = { tagline: text(formData, "tagline"), note: text(formData, "note") };
  await saveDraftGroup("footer", value, admin.session.user.email);
  revalidatePath("/admin/customisation");
  redirect(redirectPath("/admin/customisation", { ok: "Footer copy saved as draft." }));
}

export async function saveStatsSettings(formData: FormData) {
  const admin = await requireCapability("content.edit");
  const value = {
    products: text(formData, "products"),
    categories: text(formData, "categories"),
    hampers: text(formData, "hampers"),
    delivery: text(formData, "delivery"),
  };
  await saveDraftGroup("stats", value, admin.session.user.email);
  revalidatePath("/admin/customisation");
  redirect(redirectPath("/admin/customisation", { ok: "Highlights saved as draft." }));
}

export async function saveSeoSettings(formData: FormData) {
  const admin = await requireCapability("seo.manage");
  const value = {
    titleTemplate: text(formData, "titleTemplate"),
    defaultOgImage: text(formData, "defaultOgImage"),
    twitterHandle: text(formData, "twitterHandle"),
    sitemapEnabled: bool(formData, "sitemapEnabled"),
    robotsTxt: text(formData, "robotsTxt"),
    indexSite: bool(formData, "indexSite"),
  };
  await saveDraftGroup("seo", value, admin.session.user.email);
  revalidatePath("/admin/seo");
  redirect(redirectPath("/admin/seo", { ok: "Global SEO saved as draft." }));
}

export async function saveThreeSettings(formData: FormData) {
  const admin = await requireCapability("three.manage");
  const value = {
    modelUrl: text(formData, "modelUrl"),
    boxColor: text(formData, "boxColor") || "#f2ebe0",
    lidColor: text(formData, "lidColor") || "#f7f1e7",
    ribbonColor: text(formData, "ribbonColor") || "#101014",
    bowColor: text(formData, "bowColor") || "#c9a468",
    scale: optionalNum(formData, "scale") ?? 1,
    positionY: optionalNum(formData, "positionY") ?? 0,
    cameraX: optionalNum(formData, "cameraX") ?? 0,
    cameraY: optionalNum(formData, "cameraY") ?? 1.75,
    cameraZ: optionalNum(formData, "cameraZ") ?? 6.6,
    cameraFov: optionalNum(formData, "cameraFov") ?? 32,
    lightIntensity: optionalNum(formData, "lightIntensity") ?? 1,
    ambientIntensity: optionalNum(formData, "ambientIntensity") ?? 1,
    background: text(formData, "background"),
    autoRotate: bool(formData, "autoRotate"),
    rotateSpeed: optionalNum(formData, "rotateSpeed") ?? 0.9,
    enableZoom: bool(formData, "enableZoom"),
    showProducts: bool(formData, "showProducts"),
    openingAnimation: text(formData, "openingAnimation") || "unwrap",
    unwrapLabel: text(formData, "unwrapLabel") || "UNWRAP YOUR GIFT",
    animationAssetUrl: text(formData, "animationAssetUrl"),
  };
  await saveDraftGroup("three", value, admin.session.user.email);
  await logAudit({ actorEmail: admin.session.user.email, action: "three.draft", entity: "settings", entityId: "three" });
  revalidatePath("/admin/3d-studio");
  redirect(redirectPath("/admin/3d-studio", { ok: "3D configuration saved as draft." }));
}

/* ------------------------------- publishing ------------------------------- */

export async function publishContent(formData: FormData) {
  const admin = await requireCapability("content.publish");
  const scope = parseScope(text(formData, "scope"));
  const note = nullable(formData, "note") ?? undefined;
  const version = await publishScope(scope, admin.session.user.email, note);
  revalidateSite();
  const target = text(formData, "returnTo") || "/admin";
  redirect(redirectPath(target, { ok: `Published version ${version}.` }));
}

export async function restoreContent(formData: FormData) {
  const admin = await requireCapability("content.versions");
  const versionId = Number(text(formData, "versionId"));
  if (!versionId) redirect(redirectPath("/admin/versions", { error: "Choose a version to restore." }));
  try {
    const version = await restoreVersion(versionId, admin.session.user.email);
    revalidateSite();
    const returnTo = text(formData, "returnTo") || "/admin/versions";
    redirect(redirectPath(returnTo, { ok: `Restored and published as version ${version}.` }));
  } catch (error) {
    redirect(
      redirectPath("/admin/versions", {
        error: error instanceof Error ? error.message : "Could not restore that version.",
      }),
    );
  }
}

export async function discardDraft(formData: FormData) {
  const admin = await requireCapability("content.edit");
  const scope = parseScope(text(formData, "scope"));
  if (scope === "settings") {
    await db
      .update(websiteSettings)
      .set({ draftValue: null, updatedAt: new Date() })
      .where(sql`${websiteSettings.draftValue} is not null`);
  }
  await logAudit({ actorEmail: admin.session.user.email, action: `draft.discard.${scope}`, entity: "content" });
  revalidateSite();
  redirect(redirectPath(text(formData, "returnTo") || "/admin", { ok: "Draft discarded." }));
}

export async function setPreviewMode(formData: FormData) {
  await requireAdmin();
  const store = await cookies();
  if (bool(formData, "enabled")) {
    store.set("rutvi_preview", "1", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 4,
    });
    redirect("/");
  }
  store.delete("rutvi_preview");
  redirect("/admin");
}

/* -------------------------------- homepage -------------------------------- */

export async function updateHomepageSection(formData: FormData) {
  const admin = await requireCapability("content.edit");
  const id = Number(text(formData, "id"));
  if (!id) redirect(redirectPath("/admin/homepage", { error: "Missing section." }));

  await db
    .update(homepageSections)
    .set({
      title: nullable(formData, "title"),
      subtitle: nullable(formData, "subtitle"),
      body: nullable(formData, "body"),
      eyebrow: nullable(formData, "eyebrow"),
      imageUrl: nullable(formData, "imageUrl"),
      ctaLabel: nullable(formData, "ctaLabel"),
      ctaHref: nullable(formData, "ctaHref"),
      secondaryCtaLabel: nullable(formData, "secondaryCtaLabel"),
      secondaryCtaHref: nullable(formData, "secondaryCtaHref"),
      isEnabled: bool(formData, "isEnabled"),
      updatedAt: new Date(),
    })
    .where(eq(homepageSections.id, id));

  await logAudit({ actorEmail: admin.session.user.email, action: "homepage.section.update", entity: "homepage_section", entityId: id });
  revalidatePath("/admin/homepage");
  redirect(redirectPath("/admin/homepage", { ok: "Section saved as draft." }));
}

export async function reorderHomepageSections(formData: FormData) {
  const admin = await requireCapability("content.edit");
  const ids = text(formData, "order")
    .split(",")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);
  for (let index = 0; index < ids.length; index += 1) {
    await db.update(homepageSections).set({ sortOrder: index, updatedAt: new Date() }).where(eq(homepageSections.id, ids[index]));
  }
  await logAudit({ actorEmail: admin.session.user.email, action: "homepage.reorder", entity: "homepage_section", meta: { ids } });
  revalidatePath("/admin/homepage");
}

export async function toggleHomepageSection(formData: FormData) {
  const admin = await requireCapability("content.edit");
  const id = Number(text(formData, "id"));
  if (!id) return;
  await db
    .update(homepageSections)
    .set({ isEnabled: sql`not ${homepageSections.isEnabled}`, updatedAt: new Date() })
    .where(eq(homepageSections.id, id));
  await logAudit({ actorEmail: admin.session.user.email, action: "homepage.section.toggle", entity: "homepage_section", entityId: id });
  revalidatePath("/admin/homepage");
}

export async function addHomepageSection(formData: FormData) {
  const admin = await requireCapability("content.edit");
  const type = text(formData, "type") || "custom";
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${homepageSections.sortOrder}), 0)::int` })
    .from(homepageSections);
  const key = `${type}-${Date.now().toString(36)}`;
  await db.insert(homepageSections).values({
    key,
    type,
    title: text(formData, "title") || "New section",
    isEnabled: true,
    sortOrder: Number(max) + 1,
  });
  await logAudit({ actorEmail: admin.session.user.email, action: "homepage.section.create", entity: "homepage_section", meta: { type } });
  revalidatePath("/admin/homepage");
  redirect(redirectPath("/admin/homepage", { ok: "Section added as draft." }));
}

export async function deleteHomepageSection(formData: FormData) {
  const admin = await requireCapability("content.edit");
  const id = Number(text(formData, "id"));
  if (!id) return;
  await db.delete(homepageSections).where(eq(homepageSections.id, id));
  await logAudit({ actorEmail: admin.session.user.email, action: "homepage.section.delete", entity: "homepage_section", entityId: id });
  revalidatePath("/admin/homepage");
}

/* ------------------------------- navigation ------------------------------- */

export async function saveNavItem(formData: FormData) {
  const admin = await requireCapability("navigation.manage");
  const id = Number(text(formData, "id"));
  const parentId = optionalNum(formData, "parentId");
  const values = {
    location: text(formData, "location") || "header",
    label: text(formData, "label"),
    href: text(formData, "href") || "/",
    parentId: parentId && parentId > 0 ? parentId : null,
    isExternal: bool(formData, "isExternal"),
    isActive: bool(formData, "isActive"),
    badge: nullable(formData, "badge"),
    sortOrder: optionalNum(formData, "sortOrder") ?? 0,
  };
  if (!values.label) redirect(redirectPath("/admin/navigation", { error: "Menu label is required." }));

  if (id) {
    await db.update(navigationMenus).set(values).where(eq(navigationMenus.id, id));
  } else {
    await db.insert(navigationMenus).values(values);
  }
  await logAudit({ actorEmail: admin.session.user.email, action: id ? "navigation.update" : "navigation.create", entity: "navigation_menu", entityId: id || null });
  revalidatePath("/admin/navigation");
  redirect(redirectPath("/admin/navigation", { ok: "Menu saved as draft." }));
}

export async function deleteNavItem(formData: FormData) {
  const admin = await requireCapability("navigation.manage");
  const id = Number(text(formData, "id"));
  if (!id) return;
  await db.delete(navigationMenus).where(eq(navigationMenus.id, id));
  await logAudit({ actorEmail: admin.session.user.email, action: "navigation.delete", entity: "navigation_menu", entityId: id });
  revalidatePath("/admin/navigation");
}

export async function reorderNavItems(formData: FormData) {
  const admin = await requireCapability("navigation.manage");
  const ids = text(formData, "order")
    .split(",")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);
  for (let index = 0; index < ids.length; index += 1) {
    await db.update(navigationMenus).set({ sortOrder: index }).where(eq(navigationMenus.id, ids[index]));
  }
  await logAudit({ actorEmail: admin.session.user.email, action: "navigation.reorder", entity: "navigation_menu", meta: { ids } });
  revalidatePath("/admin/navigation");
}

export async function toggleNavItem(formData: FormData) {
  const admin = await requireCapability("navigation.manage");
  const id = Number(text(formData, "id"));
  if (!id) return;
  await db
    .update(navigationMenus)
    .set({ isActive: sql`not ${navigationMenus.isActive}` })
    .where(eq(navigationMenus.id, id));
  revalidatePath("/admin/navigation");
}

/* ---------------------------------- seo ---------------------------------- */

export async function saveSeoEntry(formData: FormData) {
  const admin = await requireCapability("seo.manage");
  const path = text(formData, "path").startsWith("/") ? text(formData, "path") : `/${text(formData, "path")}`;
  const values = {
    title: nullable(formData, "title"),
    description: nullable(formData, "description"),
    ogImage: nullable(formData, "ogImage"),
    canonical: nullable(formData, "canonical"),
    robots: text(formData, "robots") || "index,follow",
    keywords: nullable(formData, "keywords"),
    altText: nullable(formData, "altText"),
    updatedAt: new Date(),
  };
  await db
    .insert(seoMetadata)
    .values({ path, ...values })
    .onConflictDoUpdate({ target: seoMetadata.path, set: values });
  await logAudit({ actorEmail: admin.session.user.email, action: "seo.update", entity: "seo_metadata", entityId: path });
  revalidatePath("/admin/seo");
  redirect(redirectPath("/admin/seo", { ok: `SEO saved for ${path}.` }));
}

export async function deleteSeoEntry(formData: FormData) {
  const admin = await requireCapability("seo.manage");
  const id = Number(text(formData, "id"));
  if (!id) return;
  await db.delete(seoMetadata).where(eq(seoMetadata.id, id));
  revalidatePath("/admin/seo");
}

/* ------------------------------- marketing -------------------------------- */

export async function saveCampaign(formData: FormData) {
  const admin = await requireCapability("marketing.manage");
  const id = Number(text(formData, "id"));
  const startsAt = text(formData, "startsAt");
  const endsAt = text(formData, "endsAt");
  const values = {
    name: text(formData, "name") || "Untitled campaign",
    type: text(formData, "type") || "announcement",
    placement: text(formData, "placement") || "site_top",
    headline: nullable(formData, "headline"),
    body: nullable(formData, "body"),
    imageUrl: nullable(formData, "imageUrl"),
    ctaLabel: nullable(formData, "ctaLabel"),
    ctaHref: nullable(formData, "ctaHref"),
    startsAt: startsAt ? new Date(startsAt) : null,
    endsAt: endsAt ? new Date(endsAt) : null,
    isActive: bool(formData, "isActive"),
    sortOrder: optionalNum(formData, "sortOrder") ?? 0,
  };
  if (id) {
    await db.update(promoCampaigns).set(values).where(eq(promoCampaigns.id, id));
  } else {
    await db.insert(promoCampaigns).values(values);
  }
  await logAudit({ actorEmail: admin.session.user.email, action: id ? "marketing.update" : "marketing.create", entity: "promo_campaign", entityId: id || null });
  revalidatePath("/admin/marketing");
  redirect(redirectPath("/admin/marketing", { ok: "Campaign saved as draft." }));
}

export async function deleteCampaign(formData: FormData) {
  const admin = await requireCapability("marketing.manage");
  const id = Number(text(formData, "id"));
  if (!id) return;
  await db.delete(promoCampaigns).where(eq(promoCampaigns.id, id));
  await logAudit({ actorEmail: admin.session.user.email, action: "marketing.delete", entity: "promo_campaign", entityId: id });
  revalidatePath("/admin/marketing");
}

export async function toggleCampaign(formData: FormData) {
  const admin = await requireCapability("marketing.manage");
  const id = Number(text(formData, "id"));
  if (!id) return;
  await db
    .update(promoCampaigns)
    .set({ isActive: sql`not ${promoCampaigns.isActive}` })
    .where(eq(promoCampaigns.id, id));
  revalidatePath("/admin/marketing");
}
