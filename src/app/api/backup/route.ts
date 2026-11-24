import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  categories,
  homepageSections,
  navigationMenus,
  promoCampaigns,
  seoMetadata,
  websiteSettings,
} from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super_admin") {
    return NextResponse.json({ message: "Only a super admin can export a backup." }, { status: 403 });
  }

  const [settings, sections, navigation, seo, campaigns, categoryRows] = await Promise.all([
    db.select().from(websiteSettings),
    db.select().from(homepageSections),
    db.select().from(navigationMenus),
    db.select().from(seoMetadata),
    db.select().from(promoCampaigns),
    db.select().from(categories),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    exportedBy: admin.session.user.email,
    version: 1,
    websiteSettings: settings,
    homepageSections: sections,
    navigationMenus: navigation,
    seoMetadata: seo,
    promoCampaigns: campaigns,
    categories: categoryRows,
  };

  await logAudit({
    actorEmail: admin.session.user.email,
    action: "backup.export",
    entity: "system",
    meta: { counts: { sections: sections.length, navigation: navigation.length, seo: seo.length } },
  });

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="rutvi-content-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
