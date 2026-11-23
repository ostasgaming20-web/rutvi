import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/lib/db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

type ShowcaseProduct = {
  name: string;
  slug: string;
  sku: string;
  category: string;
  short: string;
  description: string;
  minQty: number;
  colors: string[];
  specs: [string, string][];
  custom: string[];
  images: string[];
  contents?: string[];
  packaging?: string;
};

const showcase: ShowcaseProduct[] = [
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
      "A weighty matte-black metal ball pen with soft-touch finish, coloured accent rings and a smooth twist-free click action. Available in four accent colours with your logo printed along the barrel.",
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
    packaging: "Flat packed, bulk carton",
  },
];

async function main() {
  const categoryRows = await db.select().from(schema.categories);
  const categoryId = new Map(categoryRows.map((row) => [row.slug, row.id]));

  for (const product of showcase) {
    const id = categoryId.get(product.category);
    if (!id) throw new Error(`Missing category ${product.category}`);

    const [existing] = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(eq(schema.products.sku, product.sku))
      .limit(1);

    const values = {
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      shortDescription: product.short,
      description: product.description,
      categoryId: id,
      pricePaise: null,
      minOrderQty: product.minQty,
      colors: product.colors,
      specifications: product.specs.map(([label, value]) => ({ label, value })),
      customizationOptions: product.custom,
      contents: product.contents ?? [],
      packaging: product.packaging ?? null,
      productType: "product",
      availability: "in_stock",
      isFeatured: true,
      isActive: true,
      sortOrder: showcase.indexOf(product),
      updatedAt: new Date(),
    };

    let productId = existing?.id;
    if (productId) {
      await db.update(schema.products).set(values).where(eq(schema.products.id, productId));
      await db.delete(schema.productImages).where(eq(schema.productImages.productId, productId));
    } else {
      const [row] = await db.insert(schema.products).values(values).returning({ id: schema.products.id });
      productId = row.id;
    }

    await db.insert(schema.productImages).values(
      product.images.map((url, index) => ({
        productId: productId!,
        url,
        alt: `${product.name} — view ${index + 1}`,
        sortOrder: index,
      })),
    );
    console.log("saved", product.sku);
  }

  const featuredSkus = showcase.map((product) => product.sku);
  await db
    .update(schema.products)
    .set({ isFeatured: false })
    .where(eq(schema.products.isFeatured, true));
  await db
    .update(schema.products)
    .set({ isFeatured: true })
    .where(inArray(schema.products.sku, featuredSkus));

  console.log("Showcase products ready.");
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
