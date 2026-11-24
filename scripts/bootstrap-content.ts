import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import {
  defaultBranding,
  defaultBusiness,
  defaultSeo,
  defaultThree,
} from "../src/lib/settings";
import { defaultHomepageSections, defaultNavigation } from "../src/lib/content";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const db = drizzle(pool, { schema });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "sales.rutvi@gmail.com";

  await db.execute(
    sql`update ${schema.adminUsers} set role = 'super_admin' where email = ${adminEmail}`,
  );
  const promoted = await db.select().from(schema.adminUsers);
  console.log(`Admin users: ${promoted.map((row) => `${row.email} (${row.role})`).join(", ")}`);

  const settingDefaults: Record<string, Record<string, unknown>> = {
    branding: defaultBranding,
    business: defaultBusiness,
    seo: defaultSeo,
    three: defaultThree,
  };
  for (const [key, value] of Object.entries(settingDefaults)) {
    await db
      .insert(schema.websiteSettings)
      .values({ key, value })
      .onConflictDoNothing({ target: schema.websiteSettings.key });
  }
  console.log("Settings defaults ensured.");

  const existingSections = await db.select({ id: schema.homepageSections.id }).from(schema.homepageSections).limit(1);
  if (existingSections.length === 0) {
    await db.insert(schema.homepageSections).values(
      defaultHomepageSections.map((section) => ({
        key: section.key,
        type: section.type,
        title: section.title,
        subtitle: section.subtitle,
        body: section.body,
        eyebrow: section.eyebrow,
        imageUrl: section.imageUrl,
        ctaLabel: section.ctaLabel,
        ctaHref: section.ctaHref,
        secondaryCtaLabel: section.secondaryCtaLabel,
        secondaryCtaHref: section.secondaryCtaHref,
        settings: section.settings,
        isEnabled: section.isEnabled,
        sortOrder: section.sortOrder,
      })),
    );
    console.log(`Homepage sections seeded: ${defaultHomepageSections.length}`);
  }

  const existingNav = await db.select({ id: schema.navigationMenus.id }).from(schema.navigationMenus).limit(1);
  if (existingNav.length === 0) {
    await db.insert(schema.navigationMenus).values(defaultNavigation);
    console.log(`Navigation items seeded: ${defaultNavigation.length}`);
  }

  const existingSeo = await db.select({ id: schema.seoMetadata.id }).from(schema.seoMetadata).limit(1);
  if (existingSeo.length === 0) {
    await db.insert(schema.seoMetadata).values([
      {
        path: "/",
        title: "Corporate Gifts & Custom Hampers in Mumbai",
        description:
          "RUTVI ENTERPRISE supplies premium corporate gifts, customized promotional merchandise and curated corporate hampers in Mumbai, with delivery across India.",
        ogImage: "/uploads/products/re003d-gift-set.jpg",
        canonical: "/",
        keywords: "corporate gifts mumbai, corporate hampers, customized corporate gifts",
      },
      {
        path: "/products",
        title: "Corporate Gift Catalogue",
        description: "Browse corporate gifts, executive stationery, drinkware, tech accessories and promotional merchandise.",
        canonical: "/products",
      },
      {
        path: "/hampers",
        title: "Corporate Hampers & Gift Sets",
        description: "Curated festive, executive and employee welcome hampers for corporate gifting.",
        canonical: "/hampers",
      },
      {
        path: "/customize",
        title: "Customize Your Corporate Gift",
        description: "Build a bespoke corporate gift with logo branding, custom packaging and bulk pricing.",
        canonical: "/customize",
      },
      {
        path: "/services",
        title: "Corporate Gifting Services",
        description: "End-to-end corporate gifting: curation, branding, sampling, packaging and pan-India delivery.",
        canonical: "/services",
      },
      {
        path: "/about",
        title: "About RUTVI ENTERPRISE",
        description: "Mumbai-based corporate gifting specialists helping businesses make every gift count.",
        canonical: "/about",
      },
      {
        path: "/contact",
        title: "Contact RUTVI ENTERPRISE",
        description: "Talk to our corporate gifting team in Andheri East, Mumbai.",
        canonical: "/contact",
      },
      {
        path: "/quote",
        title: "Request a Corporate Quotation",
        description: "Share your gifting brief and receive a considered proposal within one business day.",
        canonical: "/quote",
      },
    ]);
    console.log("SEO metadata seeded.");
  }

  console.log("Bootstrap complete.");
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
