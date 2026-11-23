import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { hashPassword } from "better-auth/crypto";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: { ...schema, ...authSchema } });

type SeedProduct = {
  name: string;
  slug: string;
  sku: string;
  category: string;
  short: string;
  description: string;
  price?: number;
  minQty: number;
  colors: string[];
  specs: [string, string][];
  custom: string[];
  images: string[];
  featured?: boolean;
  type?: "product" | "hamper";
  contents?: string[];
  packaging?: string;
};

const categories: { name: string; slug: string; kind: "product" | "hamper"; description: string }[] = [
  { name: "Corporate Gift Sets", slug: "corporate-gift-sets", kind: "product", description: "Curated boxed sets that make a considered first impression." },
  { name: "Executive Gifts", slug: "executive-gifts", kind: "product", description: "Refined pieces for leadership, clients and milestones." },
  { name: "Customized Pens", slug: "customized-pens", kind: "product", description: "Precision writing instruments carrying your brand." },
  { name: "Diaries & Notebooks", slug: "diaries-notebooks", kind: "product", description: "Tactile stationery for everyday brand presence." },
  { name: "Bottles & Mugs", slug: "bottles-mugs", kind: "product", description: "Drinkware that keeps your identity close at hand." },
  { name: "Laptop Bags", slug: "laptop-bags", kind: "product", description: "Professional carry pieces built for the daily commute." },
  { name: "Backpacks", slug: "backpacks", kind: "product", description: "Everyday carry with a quietly branded finish." },
  { name: "T-shirts & Apparel", slug: "t-shirts-apparel", kind: "product", description: "Wearable brand moments for teams and events." },
  { name: "Promotional Merchandise", slug: "promotional-merchandise", kind: "product", description: "High-recall giveaways for launches and conferences." },
  { name: "Office Accessories", slug: "office-accessories", kind: "product", description: "Desk essentials that elevate the working day." },
  { name: "Tech Accessories", slug: "tech-accessories", kind: "product", description: "Useful technology gifts for modern teams." },
  { name: "Trophies & Awards", slug: "trophies-awards", kind: "product", description: "Recognition pieces crafted for milestone moments." },
  { name: "Employee Welcome Kits", slug: "employee-welcome-kits", kind: "product", description: "A warm, branded welcome from day one." },
  { name: "Festival Gifts", slug: "festival-gifts", kind: "product", description: "Seasonal gifting with a premium, personal touch." },
  { name: "Executive Hampers", slug: "executive-hampers", kind: "hamper", description: "Elevated hampers for clients and leadership." },
  { name: "Employee Welcome Hampers", slug: "employee-welcome-hampers", kind: "hamper", description: "Thoughtful onboarding hampers for new joiners." },
  { name: "Diwali Hampers", slug: "diwali-hampers", kind: "hamper", description: "Festive hampers that carry your best wishes." },
  { name: "New Year Hampers", slug: "new-year-hampers", kind: "hamper", description: "A polished start to the year for your network." },
  { name: "Festival Hampers", slug: "festival-hampers", kind: "hamper", description: "Celebrate every occasion with curated gifting." },
  { name: "Client Appreciation Hampers", slug: "client-appreciation-hampers", kind: "hamper", description: "Gratitude, presented beautifully." },
  { name: "Custom Corporate Hampers", slug: "custom-corporate-hampers", kind: "hamper", description: "Built entirely around your brief and budget." },
];

const products: SeedProduct[] = [
  {
    name: "Premium Leather Gift Set — RE003D",
    slug: "premium-leather-gift-set-re003d",
    sku: "RE003D",
    category: "corporate-gift-sets",
    short: "A5 leather notebook, metal ball pen, keychain and card holder in a black presentation box.",
    description:
      "A complete executive gift set built around a tan A5 leather notebook with a magnetic closure strap. Presented in a black foam-lined box with a matching leather card holder, a bamboo-accent metal pen and a leather keychain — every piece debossed with your logo.",
    minQty: 25,
    colors: ["Tan", "Black"],
    specs: [
      ["Notebook size", "A5 — 21 × 14.5 cm"],
      ["Set includes", "Notebook, pen, keychain, card holder"],
      ["Packaging", "Black foam-lined presentation box"],
      ["Branding", "Deboss / foil on all four pieces"],
    ],
    custom: ["Logo deboss", "Foil stamping", "Custom box sleeve"],
    images: ["/uploads/products/re003d-gift-set.jpg"],
    featured: true,
    contents: ["A5 leather notebook", "Metal ball pen", "Leather keychain", "Leather card holder"],
    packaging: "Black foam-lined presentation box",
  },
  {
    name: "Metal Ball Pen — RE101P",
    slug: "metal-ball-pen-re101p",
    sku: "RE101P",
    category: "customized-pens",
    short: "Matte black metal ball pen with coloured grip rings and full-body logo branding.",
    description:
      "A weighty matte-black metal ball pen with soft-touch finish, coloured accent rings and a smooth click action. Available in four accent colours with your logo printed along the barrel.",
    minQty: 50,
    colors: ["Grey", "Navy Blue", "White", "Red"],
    specs: [
      ["Body", "Matte black metal"],
      ["Accent options", "Grey, navy blue, white, red"],
      ["Ink", "Blue — smooth flow refill"],
      ["Branding", "Pad print or laser engraving"],
    ],
    custom: ["Pad printing", "Laser engraving", "Individual poly bag"],
    images: ["/uploads/products/re101p-metal-pen.jpg"],
    featured: true,
    packaging: "Individual poly bag, bulk carton",
  },
  {
    name: "Multifunctional Notebook Diary — RE002D",
    slug: "multifunctional-notebook-diary-re002d",
    sku: "RE002D",
    category: "diaries-notebooks",
    short: "A5 hardbound diary with phone and pen holders, 116 pages and a metal logo plate.",
    description:
      "An all-in-one A5 organiser with a magnetic flap, mobile and pen holders, a pendrive loop and a metal plate for your logo. 116 ruled pages with four-year calendars, plus India, Delhi and Mumbai metro rail maps.",
    minQty: 25,
    colors: ["Black", "Grey", "Orange", "Blue"],
    specs: [
      ["Size", "21.2 × 14.7 cm (A5)"],
      ["Pages", "116 ruled pages"],
      ["Weight", "400 g"],
      ["Features", "Phone holder, pen holder, pendrive loop"],
      ["Calendars", "2024 – 2027"],
    ],
    custom: ["Metal logo plate", "Deboss", "Custom inner page"],
    images: ["/uploads/products/re002d-notebook-diary.jpg"],
    featured: true,
    packaging: "Individual shrink wrap",
  },
  {
    name: "Executive Tablet & Book Stand — RE004D",
    slug: "executive-tablet-book-stand-re004d",
    sku: "RE004D",
    category: "office-accessories",
    short: "Folding grey fabric desk stand with a bamboo ledge for tablets, phones and books.",
    description:
      "A folding desk stand in textured grey fabric with a bamboo front ledge — holds a tablet, phone or open book at a comfortable reading angle. Packs flat for gifting and travel.",
    minQty: 20,
    colors: ["Grey"],
    specs: [
      ["Material", "Textured fabric over rigid board, bamboo ledge"],
      ["Fits", "Tablets up to 11 in, phones, books"],
      ["Folded", "Slim flat-pack profile"],
      ["Branding", "Screen print or woven label"],
    ],
    custom: ["Screen printing", "Woven label", "Custom gift box"],
    images: ["/uploads/products/re004d-diary-stand.jpg"],
    featured: true,
    packaging: "Kraft gift box",
  },
  {
    name: "Premium Gift Bags — RE005B",
    slug: "premium-gift-bags-re005b",
    sku: "RE005B",
    category: "promotional-merchandise",
    short: "Deep green board gift bags with gold foil logo and satin ribbon handles.",
    description:
      "Rigid-look paper gift bags in deep forest green with gold foil branding and gold satin ribbon handles. Built to carry hampers and gift sets with a premium, reusable finish.",
    minQty: 50,
    colors: ["Forest Green", "Ivory", "Black"],
    specs: [
      ["Material", "300 gsm art board, matte lamination"],
      ["Handles", "Gold satin ribbon"],
      ["Finish", "Gold foil stamping"],
      ["Sizes", "Small, medium, large"],
    ],
    custom: ["Gold foil", "Spot UV", "Custom size and ribbon colour"],
    images: ["/uploads/products/gift-bags.jpg"],
    featured: true,
    packaging: "Flat packed, bulk carton",
  },
];

const customizationOptions = [
  { name: "Logo printing", slug: "logo-printing", description: "Screen, pad or UV printing in one to four colours.", priceNote: "From ₹15 per unit", sortOrder: 1 },
  { name: "Laser engraving", slug: "laser-engraving", description: "Permanent, precise marking on metal, wood and leather.", priceNote: "From ₹40 per unit", sortOrder: 2 },
  { name: "Embossing", slug: "embossing", description: "Raised or debossed branding on leather and paper.", priceNote: "From ₹35 per unit", sortOrder: 3 },
  { name: "Embroidery", slug: "embroidery", description: "Stitched branding for apparel and bags.", priceNote: "From ₹60 per unit", sortOrder: 4 },
  { name: "Foil stamping", slug: "foil-stamping", description: "Gold, silver or blind foil on packaging and stationery.", priceNote: "From ₹25 per unit", sortOrder: 5 },
  { name: "Personalized packaging", slug: "personalized-packaging", description: "Printed sleeves, name tags and custom inserts.", priceNote: "Quoted per brief", sortOrder: 6 },
  { name: "Custom gift box", slug: "custom-gift-box", description: "Rigid boxes built to size with your artwork.", priceNote: "From ₹180 per unit", sortOrder: 7 },
];

const settings: { key: string; value: Record<string, unknown> }[] = [
  {
    key: "contact",
    value: {
      phone: "+91 98699 94699",
      phoneHref: "+919869994699",
      whatsapp: "919869994699",
      email: "sales.rutvi@gmail.com",
      address: "Kondivita Road, Opposite Aqua Metro Station, MIDC, Andheri East, Mumbai, Maharashtra, India",
      mapQuery: "Kondivita Road, Andheri East, Mumbai, Maharashtra",
      hours: "Monday – Saturday, 10:00 – 19:00",
      instagram: "https://instagram.com",
      linkedin: "https://linkedin.com",
    },
  },
  {
    key: "hero",
    value: {
      eyebrow: "Corporate gifting, considered",
      headline: "Make Every Gift a Lasting Impression.",
      description:
        "Discover premium corporate gifting, customized merchandise and thoughtfully curated hampers designed to strengthen business relationships.",
      primaryCta: "Explore Our Collection",
      secondaryCta: "Request a Quote",
      badge: "Trusted by teams across Mumbai",
    },
  },
  {
    key: "footer",
    value: {
      tagline: "Corporate gift suppliers helping Mumbai businesses make every gift count.",
      note: "Corporate gifting, customized merchandise and curated hampers, delivered across India.",
    },
  },
  {
    key: "stats",
    value: {
      products: "35",
      categories: "15",
      hampers: "7",
      delivery: "Pan-India",
    },
  },
];

async function main() {
  console.log("Seeding database…");

  const existing = await db.select().from(schema.categories).limit(1);
  if (existing.length === 0) {
    await db.insert(schema.categories).values(
      categories.map((category, index) => ({
        name: category.name,
        slug: category.slug,
        kind: category.kind,
        description: category.description,
        imageUrl: null,
        sortOrder: index,
      })),
    );
  }

  const categoryRows = await db.select().from(schema.categories);
  const categoryId = new Map(categoryRows.map((row) => [row.slug, row.id]));

  const existingProducts = await db.select().from(schema.products).limit(1);
  if (existingProducts.length === 0) {
    for (const [index, product] of products.entries()) {
      const [row] = await db
        .insert(schema.products)
        .values({
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          shortDescription: product.short,
          description: product.description,
          categoryId: categoryId.get(product.category)!,
          pricePaise: product.price ?? null,
          minOrderQty: product.minQty,
          colors: product.colors,
          specifications: product.specs.map(([label, value]) => ({ label, value })),
          customizationOptions: product.custom,
          contents: product.contents ?? [],
          packaging: product.packaging ?? null,
          productType: product.type ?? "product",
          availability: "in_stock",
          isFeatured: product.featured ?? false,
          sortOrder: index,
        })
        .returning({ id: schema.products.id });

      await db.insert(schema.productImages).values(
        product.images.map((image, imageIndex) => ({
          productId: row.id,
          url: image,
          alt: `${product.name} — view ${imageIndex + 1}`,
          sortOrder: imageIndex,
        })),
      );

      await db.insert(schema.productVariants).values(
        product.colors.map((color) => ({
          productId: row.id,
          name: "Colour",
          value: color,
          priceDeltaPaise: 0,
        })),
      );
    }
  }

  const existingCustomization = await db.select().from(schema.customizationOptions).limit(1);
  if (existingCustomization.length === 0) {
    await db.insert(schema.customizationOptions).values(customizationOptions);
  }

  for (const setting of settings) {
    await db
      .insert(schema.websiteSettings)
      .values({ key: setting.key, value: setting.value })
      .onConflictDoUpdate({
        target: schema.websiteSettings.key,
        set: { value: setting.value, updatedAt: new Date() },
      });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "sales.rutvi@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Rutvi@2026!";
  const [existingAdmin] = await db
    .select()
    .from(authSchema.user)
    .where(eq(authSchema.user.email, adminEmail))
    .limit(1);

  if (!existingAdmin) {
    const userId = randomUUID();
    const hashed = await hashPassword(adminPassword);
    await db.insert(authSchema.user).values({
      id: userId,
      name: process.env.ADMIN_NAME ?? "Rutvi Admin",
      email: adminEmail,
      emailVerified: true,
    });
    await db.insert(authSchema.account).values({
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashed,
    });
    await db.insert(schema.adminUsers).values({
      userId,
      email: adminEmail,
      role: "admin",
    });
  }

  console.log(`Seed complete. Admin: ${adminEmail}`);
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
