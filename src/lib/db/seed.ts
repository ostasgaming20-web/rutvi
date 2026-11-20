import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { hashPassword } from "better-auth/crypto";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: { ...schema, ...authSchema } });

const img = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=82`;

const U = {
  giftBox: "photo-1549465220-1a8b9238cd48",
  gifts: "photo-1513201099705-a9746e1e201f",
  giftFlat: "photo-1607083206968-13611e3d76db",
  executive: "photo-1513885535751-8b9238bd345a",
  hamper: "photo-1607344645866-009c320b63e0",
  hamper2: "photo-1608571423902-eed4a5ad8108",
  pen: "photo-1583485088034-697b5bc54ccd",
  pen2: "photo-1585336261022-680e295ce3fe",
  writing: "photo-1455390582262-044cdead277a",
  notebook: "photo-1531346878377-a5be20888e57",
  notebook2: "photo-1544816155-12df9643f363",
  planner: "photo-1517842645767-c639042777db",
  bottle: "photo-1602143407151-7111542de6e8",
  bottle2: "photo-1523362628745-0c100150b504",
  mug: "photo-1514228742587-6b1558fcca3d",
  mug2: "photo-1577937927133-66ef06acdf18",
  bag: "photo-1547949003-9792a18a2601",
  backpack: "photo-1553062407-98eeb64c6a62",
  laptopbag: "photo-1590874103328-eac38a683ce7",
  tshirt: "photo-1521572163474-6864f9cf17ab",
  tech: "photo-1505740420928-5e560c06d30e",
  tech2: "photo-1527864550417-7fd91fc51a46",
  laptop: "photo-1593642632823-8f785ba67e45",
  trophy: "photo-1567427017947-545c5f8d16ad",
  trophy2: "photo-1579952363873-27f3bade9f55",
  team: "photo-1556761175-b413da4baf72",
  handshake: "photo-1600880292203-757bb62b4baf",
  office: "photo-1497366754035-f200968a6e72",
  event: "photo-1517245386807-bb43f82c33c4",
  desk: "photo-1503602642458-232111445657",
  journal: "photo-1526170375885-4d8ecf77b99f",
  speaker: "photo-1587829741301-dc798b83add3",
};

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

const categories: { name: string; slug: string; kind: "product" | "hamper"; description: string; image: string }[] = [
  { name: "Corporate Gift Sets", slug: "corporate-gift-sets", kind: "product", description: "Curated boxed sets that make a considered first impression.", image: U.giftBox },
  { name: "Executive Gifts", slug: "executive-gifts", kind: "product", description: "Refined pieces for leadership, clients and milestones.", image: U.executive },
  { name: "Customized Pens", slug: "customized-pens", kind: "product", description: "Precision writing instruments carrying your brand.", image: U.pen },
  { name: "Diaries & Notebooks", slug: "diaries-notebooks", kind: "product", description: "Tactile stationery for everyday brand presence.", image: U.notebook },
  { name: "Bottles & Mugs", slug: "bottles-mugs", kind: "product", description: "Drinkware that keeps your identity close at hand.", image: U.bottle },
  { name: "Laptop Bags", slug: "laptop-bags", kind: "product", description: "Professional carry pieces built for the daily commute.", image: U.laptopbag },
  { name: "Backpacks", slug: "backpacks", kind: "product", description: "Everyday carry with a quietly branded finish.", image: U.backpack },
  { name: "T-shirts & Apparel", slug: "t-shirts-apparel", kind: "product", description: "Wearable brand moments for teams and events.", image: U.tshirt },
  { name: "Promotional Merchandise", slug: "promotional-merchandise", kind: "product", description: "High-recall giveaways for launches and conferences.", image: U.event },
  { name: "Office Accessories", slug: "office-accessories", kind: "product", description: "Desk essentials that elevate the working day.", image: U.desk },
  { name: "Tech Accessories", slug: "tech-accessories", kind: "product", description: "Useful technology gifts for modern teams.", image: U.tech },
  { name: "Trophies & Awards", slug: "trophies-awards", kind: "product", description: "Recognition pieces crafted for milestone moments.", image: U.trophy },
  { name: "Employee Welcome Kits", slug: "employee-welcome-kits", kind: "product", description: "A warm, branded welcome from day one.", image: U.team },
  { name: "Festival Gifts", slug: "festival-gifts", kind: "product", description: "Seasonal gifting with a premium, personal touch.", image: U.gifts },
  { name: "Executive Hampers", slug: "executive-hampers", kind: "hamper", description: "Elevated hampers for clients and leadership.", image: U.hamper },
  { name: "Employee Welcome Hampers", slug: "employee-welcome-hampers", kind: "hamper", description: "Thoughtful onboarding hampers for new joiners.", image: U.hamper2 },
  { name: "Diwali Hampers", slug: "diwali-hampers", kind: "hamper", description: "Festive hampers that carry your best wishes.", image: U.giftFlat },
  { name: "New Year Hampers", slug: "new-year-hampers", kind: "hamper", description: "A polished start to the year for your network.", image: U.giftBox },
  { name: "Festival Hampers", slug: "festival-hampers", kind: "hamper", description: "Celebrate every occasion with curated gifting.", image: U.gifts },
  { name: "Client Appreciation Hampers", slug: "client-appreciation-hampers", kind: "hamper", description: "Gratitude, presented beautifully.", image: U.handshake },
  { name: "Custom Corporate Hampers", slug: "custom-corporate-hampers", kind: "hamper", description: "Built entirely around your brief and budget.", image: U.hamper },
];

const products: SeedProduct[] = [
  {
    name: "The Signature Welcome Box",
    slug: "signature-welcome-box",
    sku: "RE-CGS-001",
    category: "corporate-gift-sets",
    short: "A hardbound diary, metal pen and insulated bottle in a navy keepsake box.",
    description:
      "Our most requested onboarding gift. A soft-touch navy box opens to reveal a vegan-leather diary, a weighted metal rollerball and a double-walled steel bottle. Every element is debossed with your identity for a considered, cohesive presentation.",
    price: 249900,
    minQty: 25,
    colors: ["Navy", "Charcoal", "Ivory"],
    specs: [["Box", "Rigid board, soft-touch laminate"], ["Diary", "A5, 160 pages, vegan leather"], ["Bottle", "500 ml, double-wall steel"], ["Branding", "Deboss + laser engraving"]],
    custom: ["Logo printing", "Laser engraving", "Embossing", "Custom gift box"],
    images: [U.giftBox, U.executive, U.giftFlat],
    featured: true,
  },
  {
    name: "Ivory Ribbon Gift Set",
    slug: "ivory-ribbon-gift-set",
    sku: "RE-CGS-002",
    category: "corporate-gift-sets",
    short: "Satin-ribbon packaging with a candle, notebook and brass pen.",
    description:
      "An ivory gift box finished with champagne satin ribbon. Inside, a hand-poured soy candle, a linen-bound notebook and a brass-finish pen sit in a custom foam insert. Ideal for client thank-yous and festive gestures.",
    price: 189900,
    minQty: 20,
    colors: ["Ivory", "Sand", "Blush"],
    specs: [["Box", "Rigid board with satin ribbon"], ["Candle", "180 g soy wax"], ["Notebook", "A6, linen bound"], ["Branding", "Foil stamping"]],
    custom: ["Logo printing", "Foil stamping", "Personalized packaging"],
    images: [U.giftFlat, U.giftBox, U.gifts],
    featured: true,
  },
  {
    name: "Executive Leather Trio",
    slug: "executive-leather-trio",
    sku: "RE-EXE-001",
    category: "executive-gifts",
    short: "Leather folder, card holder and pen presented in a magnetic box.",
    description:
      "A quietly luxurious trio for senior clients. Full-grain leather folder, slim card holder and a machined pen, presented in a magnetic-close box with a suede pouch. Available in three restrained colourways.",
    price: 379900,
    minQty: 10,
    colors: ["Cognac", "Black", "Navy"],
    specs: [["Material", "Full-grain leather"], ["Folder", "A4, document sleeve"], ["Pen", "Brass, 0.7 mm"], ["Packaging", "Magnetic gift box"]],
    custom: ["Laser engraving", "Debossing", "Custom gift box"],
    images: [U.executive, U.pen, U.hamper],
    featured: true,
  },
  {
    name: "Onyx Desk Companion",
    slug: "onyx-desk-companion",
    sku: "RE-EXE-002",
    category: "executive-gifts",
    short: "A stone-finish desk set with pen well and phone rest.",
    description:
      "A sculptural desk piece in matte stone finish, with a weighted pen well and a discreet phone rest. Subtle branding is laser-etched into the base for an understated executive gift.",
    price: 219900,
    minQty: 15,
    colors: ["Onyx", "Bone", "Slate"],
    specs: [["Material", "Cast stone composite"], ["Dimensions", "18 × 9 × 2.5 cm"], ["Finish", "Matte sealed"], ["Branding", "Laser etch"]],
    custom: ["Laser engraving", "Logo printing"],
    images: [U.desk, U.office, U.journal],
  },
  {
    name: "Meridian Metal Rollerball",
    slug: "meridian-metal-rollerball",
    sku: "RE-PEN-001",
    category: "customized-pens",
    short: "Weighted brass rollerball with a satin navy barrel.",
    description:
      "A satisfying, weight-balanced rollerball in satin navy with champagne-gold trim. Supplied in a slim gift sleeve, with engraving or print available on the barrel and cap.",
    price: 64900,
    minQty: 50,
    colors: ["Navy", "Black", "Champagne"],
    specs: [["Body", "Brass, satin finish"], ["Refill", "0.7 mm rollerball"], ["Weight", "32 g"], ["Branding", "Laser engraving"]],
    custom: ["Laser engraving", "Logo printing", "Personalized packaging"],
    images: [U.pen, U.pen2, U.writing],
    featured: true,
  },
  {
    name: "Soft-Touch Gel Pen Set",
    slug: "soft-touch-gel-pen-set",
    sku: "RE-PEN-002",
    category: "customized-pens",
    short: "A trio of soft-touch gel pens in a printed sleeve.",
    description:
      "Three smooth-glide gel pens in a printed kraft sleeve. A practical, high-recall giveaway for conferences and campus drives, with generous branding space.",
    price: 24900,
    minQty: 100,
    colors: ["Navy", "Ivory", "Sand"],
    specs: [["Body", "Soft-touch ABS"], ["Tip", "0.5 mm gel"], ["Packaging", "Printed kraft sleeve"], ["Branding", "Pad printing"]],
    custom: ["Logo printing", "Personalized packaging"],
    images: [U.pen2, U.writing, U.pen],
  },
  {
    name: "Linen Bound Journal",
    slug: "linen-bound-journal",
    sku: "RE-DIA-001",
    category: "diaries-notebooks",
    short: "A5 linen journal with ribbon marker and debossed cover.",
    description:
      "A refined A5 journal bound in textured linen, with 160 pages of 100 gsm ivory paper, a ribbon marker and a rear pocket. Debossed or foil-stamped with your mark.",
    price: 89900,
    minQty: 30,
    colors: ["Sand", "Navy", "Olive", "Charcoal"],
    specs: [["Size", "A5, 148 × 210 mm"], ["Pages", "160, 100 gsm"], ["Binding", "Linen hardcover"], ["Extras", "Ribbon marker, rear pocket"]],
    custom: ["Embossing", "Foil stamping", "Logo printing"],
    images: [U.notebook, U.planner, U.notebook2],
    featured: true,
  },
  {
    name: "Weekly Desk Planner",
    slug: "weekly-desk-planner",
    sku: "RE-DIA-002",
    category: "diaries-notebooks",
    short: "Undated weekly planner with a lay-flat binding.",
    description:
      "An undated weekly planner designed for focused work. Lay-flat binding, 120 gsm pages and a soft-touch cover that takes foil branding beautifully.",
    price: 74900,
    minQty: 30,
    colors: ["Ivory", "Navy", "Sage"],
    specs: [["Size", "B5, 176 × 250 mm"], ["Pages", "192, 120 gsm"], ["Binding", "Lay-flat"], ["Branding", "Foil stamping"]],
    custom: ["Foil stamping", "Logo printing"],
    images: [U.planner, U.notebook2, U.writing],
  },
  {
    name: "Atlas Insulated Bottle",
    slug: "atlas-insulated-bottle",
    sku: "RE-BOT-001",
    category: "bottles-mugs",
    short: "500 ml double-wall steel bottle with laser-etched branding.",
    description:
      "A 500 ml double-wall vacuum bottle that holds temperature for 24 hours cold and 12 hours hot. Powder-coated in deep navy with a leak-proof lid and a laser-etched logo.",
    price: 109900,
    minQty: 25,
    colors: ["Navy", "Ivory", "Charcoal"],
    specs: [["Capacity", "500 ml"], ["Material", "18/8 stainless steel"], ["Retention", "24 h cold / 12 h hot"], ["Branding", "Laser engraving"]],
    custom: ["Laser engraving", "Logo printing", "Custom gift box"],
    images: [U.bottle, U.bottle2, U.mug],
    featured: true,
  },
  {
    name: "Stoneware Coffee Mug",
    slug: "stoneware-coffee-mug",
    sku: "RE-MUG-001",
    category: "bottles-mugs",
    short: "Matte stoneware mug with a champagne-gold interior glaze.",
    description:
      "A 350 ml stoneware mug with a matte exterior and a warm champagne interior glaze. A daily-use gift that keeps your brand on the desk, not in a drawer.",
    price: 54900,
    minQty: 50,
    colors: ["Bone", "Navy", "Clay"],
    specs: [["Capacity", "350 ml"], ["Material", "Stoneware"], ["Care", "Dishwasher safe"], ["Branding", "Ceramic print"]],
    custom: ["Logo printing", "Personalized packaging"],
    images: [U.mug, U.mug2, U.bottle2],
  },
  {
    name: "Commuter Laptop Brief",
    slug: "commuter-laptop-brief",
    sku: "RE-BAG-001",
    category: "laptop-bags",
    short: "Slim 15-inch laptop brief in water-resistant recycled canvas.",
    description:
      "A slim, structured brief for the daily commute. Fits a 15-inch laptop, with a padded sleeve, document pocket and trolley strap. Branding is debossed on the leather patch.",
    price: 249900,
    minQty: 20,
    colors: ["Charcoal", "Navy", "Stone"],
    specs: [["Fits", "Up to 15-inch laptop"], ["Material", "Recycled canvas, leather trim"], ["Features", "Trolley strap, padded sleeve"], ["Branding", "Leather deboss"]],
    custom: ["Embossing", "Logo printing", "Embroidery"],
    images: [U.laptopbag, U.bag, U.backpack],
  },
  {
    name: "Heritage Leather Folio",
    slug: "heritage-leather-folio",
    sku: "RE-BAG-002",
    category: "laptop-bags",
    short: "Full-grain leather folio for documents and a 13-inch laptop.",
    description:
      "A hand-finished full-grain leather folio with a suede lining, document sleeves and a magnetic closure. Ages beautifully and carries a blind-debossed monogram or logo.",
    price: 429900,
    minQty: 10,
    colors: ["Cognac", "Black"],
    specs: [["Material", "Full-grain leather"], ["Fits", "13-inch laptop + A4"], ["Lining", "Microsuede"], ["Branding", "Blind deboss"]],
    custom: ["Embossing", "Laser engraving"],
    images: [U.bag, U.laptopbag, U.executive],
  },
  {
    name: "Everyday Tech Backpack",
    slug: "everyday-tech-backpack",
    sku: "RE-BKP-001",
    category: "backpacks",
    short: "22 L commuter backpack with a padded 16-inch sleeve.",
    description:
      "A clean, 22-litre backpack in recycled ripstop with a padded 16-inch laptop compartment, hidden security pocket and USB pass-through. Embroidered or printed with your logo.",
    price: 219900,
    minQty: 20,
    colors: ["Black", "Navy", "Olive"],
    specs: [["Capacity", "22 L"], ["Fits", "16-inch laptop"], ["Material", "Recycled ripstop"], ["Branding", "Embroidery"]],
    custom: ["Embroidery", "Logo printing"],
    images: [U.backpack, U.bag, U.laptopbag],
    featured: true,
  },
  {
    name: "Weekender Duffel",
    slug: "weekender-duffel",
    sku: "RE-BKP-002",
    category: "backpacks",
    short: "40 L duffel with a separate shoe compartment.",
    description:
      "A 40-litre duffel in heavyweight canvas with leather handles, a separate shoe compartment and a detachable shoulder strap. A generous gift for offsites and leadership retreats.",
    price: 289900,
    minQty: 15,
    colors: ["Olive", "Charcoal", "Sand"],
    specs: [["Capacity", "40 L"], ["Material", "Heavyweight canvas"], ["Features", "Shoe compartment, detachable strap"], ["Branding", "Leather patch"]],
    custom: ["Embroidery", "Embossing"],
    images: [U.bag, U.backpack, U.event],
  },
  {
    name: "Pima Cotton Polo",
    slug: "pima-cotton-polo",
    sku: "RE-APP-001",
    category: "t-shirts-apparel",
    short: "Breathable pima cotton polo with tonal embroidery.",
    description:
      "A 220 gsm pima cotton polo with a tailored fit, mother-of-pearl buttons and tonal chest embroidery. Sized for full teams, with a low minimum for sampling.",
    price: 89900,
    minQty: 25,
    colors: ["Navy", "White", "Charcoal", "Sage"],
    specs: [["Fabric", "220 gsm pima cotton"], ["Fit", "Tailored"], ["Sizes", "S–3XL"], ["Branding", "Tonal embroidery"]],
    custom: ["Embroidery", "Logo printing"],
    images: [U.tshirt, U.team, U.event],
  },
  {
    name: "Heavyweight Event Tee",
    slug: "heavyweight-event-tee",
    sku: "RE-APP-002",
    category: "t-shirts-apparel",
    short: "240 gsm organic cotton tee for launches and offsites.",
    description:
      "A boxy, heavyweight organic cotton tee built for events. Screen-printed or embroidered with your campaign artwork, packed individually by size.",
    price: 59900,
    minQty: 50,
    colors: ["Ivory", "Black", "Navy"],
    specs: [["Fabric", "240 gsm organic cotton"], ["Fit", "Relaxed"], ["Sizes", "XS–3XL"], ["Branding", "Screen print"]],
    custom: ["Logo printing", "Embroidery"],
    images: [U.tshirt, U.event, U.team],
  },
  {
    name: "Recycled Canvas Tote",
    slug: "recycled-canvas-tote",
    sku: "RE-PRO-001",
    category: "promotional-merchandise",
    short: "Sturdy 12 oz canvas tote with a printed gusset.",
    description:
      "A 12 oz recycled canvas tote with reinforced handles and a full-width printed gusset. A practical, sustainable giveaway for conferences and campus events.",
    price: 34900,
    minQty: 100,
    colors: ["Natural", "Navy", "Black"],
    specs: [["Material", "12 oz recycled canvas"], ["Size", "38 × 42 cm"], ["Handles", "Reinforced cotton"], ["Branding", "Screen print"]],
    custom: ["Logo printing", "Personalized packaging"],
    images: [U.bag, U.event, U.desk],
  },
  {
    name: "Insulated Travel Tumbler",
    slug: "insulated-travel-tumbler",
    sku: "RE-PRO-002",
    category: "promotional-merchandise",
    short: "380 ml tumbler with a slide lid and matte finish.",
    description:
      "A 380 ml insulated tumbler with a slide lid, non-slip base and a matte powder coat that takes crisp one-colour branding.",
    price: 79900,
    minQty: 50,
    colors: ["Ivory", "Navy", "Terracotta"],
    specs: [["Capacity", "380 ml"], ["Material", "Stainless steel"], ["Lid", "Slide closure"], ["Branding", "Laser engraving"]],
    custom: ["Laser engraving", "Logo printing"],
    images: [U.mug2, U.bottle, U.bottle2],
  },
  {
    name: "Walnut Desk Organiser",
    slug: "walnut-desk-organiser",
    sku: "RE-OFF-001",
    category: "office-accessories",
    short: "Solid walnut tray for stationery and devices.",
    description:
      "A solid walnut desk tray with felt-lined compartments for pens, cards and a phone. Finished with natural oil and a discreet engraved logo.",
    price: 179900,
    minQty: 15,
    colors: ["Walnut", "Oak"],
    specs: [["Material", "Solid walnut"], ["Dimensions", "24 × 12 × 3 cm"], ["Lining", "Wool felt"], ["Branding", "Laser engraving"]],
    custom: ["Laser engraving", "Custom gift box"],
    images: [U.desk, U.office, U.journal],
    featured: true,
  },
  {
    name: "Brass Paperweight",
    slug: "brass-paperweight",
    sku: "RE-OFF-002",
    category: "office-accessories",
    short: "Machined brass block with an engraved monogram.",
    description:
      "A weighty, machined brass paperweight with a brushed finish and an engraved logo or monogram. Presented in a lined box.",
    price: 129900,
    minQty: 20,
    colors: ["Brass", "Blackened Brass"],
    specs: [["Material", "Solid brass"], ["Dimensions", "7 × 7 × 2 cm"], ["Finish", "Brushed"], ["Branding", "Engraving"]],
    custom: ["Laser engraving", "Custom gift box"],
    images: [U.office, U.desk, U.executive],
  },
  {
    name: "Wireless Charging Pad",
    slug: "wireless-charging-pad",
    sku: "RE-TEC-001",
    category: "tech-accessories",
    short: "15 W leather charging pad with a debossed logo.",
    description:
      "A 15 W fast wireless charger wrapped in vegan leather, with a non-slip base and USB-C cable. A useful, premium tech gift for clients and teams.",
    price: 149900,
    minQty: 25,
    colors: ["Charcoal", "Cognac", "Navy"],
    specs: [["Output", "15 W fast charge"], ["Material", "Vegan leather"], ["Cable", "1 m USB-C"], ["Branding", "Deboss"]],
    custom: ["Embossing", "Laser engraving"],
    images: [U.tech2, U.tech, U.laptop],
    featured: true,
  },
  {
    name: "Studio Wireless Headphones",
    slug: "studio-wireless-headphones",
    sku: "RE-TEC-002",
    category: "tech-accessories",
    short: "Over-ear Bluetooth headphones with active noise cancelling.",
    description:
      "Over-ear Bluetooth headphones with active noise cancelling, 30-hour battery life and a hard travel case. Customised with a printed logo on the case and earcup.",
    price: 599900,
    minQty: 10,
    colors: ["Midnight", "Sand", "Sage"],
    specs: [["Battery", "30 hours"], ["Connectivity", "Bluetooth 5.3"], ["Features", "ANC, USB-C"], ["Branding", "Case print"]],
    custom: ["Logo printing", "Laser engraving"],
    images: [U.tech, U.tech2, U.laptop],
  },
  {
    name: "Crystal Recognition Award",
    slug: "crystal-recognition-award",
    sku: "RE-TRO-001",
    category: "trophies-awards",
    short: "Optical crystal award with a sandblasted inscription.",
    description:
      "A faceted optical crystal award with a sandblasted inscription and a weighted black base. Supplied in a velvet-lined presentation box.",
    price: 229900,
    minQty: 5,
    colors: ["Clear", "Smoked"],
    specs: [["Material", "Optical crystal"], ["Height", "22 cm"], ["Base", "Black marble"], ["Branding", "Sandblasting"]],
    custom: ["Laser engraving", "Custom gift box"],
    images: [U.trophy, U.trophy2, U.executive],
  },
  {
    name: "Walnut Achievement Plaque",
    slug: "walnut-achievement-plaque",
    sku: "RE-TRO-002",
    category: "trophies-awards",
    short: "Walnut plaque with a brushed brass face plate.",
    description:
      "A solid walnut plaque with a brushed brass face plate, engraved with names, dates and your brand mark. Wall or desk mounted.",
    price: 189900,
    minQty: 5,
    colors: ["Walnut", "Ebony"],
    specs: [["Material", "Walnut + brass"], ["Size", "26 × 20 cm"], ["Mount", "Desk or wall"], ["Branding", "Engraving"]],
    custom: ["Laser engraving"],
    images: [U.trophy2, U.trophy, U.office],
  },
  {
    name: "Day One Welcome Kit",
    slug: "day-one-welcome-kit",
    sku: "RE-WEL-001",
    category: "employee-welcome-kits",
    short: "Notebook, bottle, pen and welcome card in a branded box.",
    description:
      "Everything a new joiner needs on day one: a linen notebook, insulated bottle, metal pen and a printed welcome card, packed in a branded box with a name sleeve.",
    price: 279900,
    minQty: 20,
    colors: ["Navy", "Ivory", "Charcoal"],
    specs: [["Contents", "4 pieces"], ["Box", "Rigid, magnetic close"], ["Personalisation", "Name sleeve"], ["Branding", "Print + deboss"]],
    custom: ["Logo printing", "Embossing", "Personalized packaging"],
    images: [U.team, U.giftBox, U.handshake],
    featured: true,
  },
  {
    name: "Remote Starter Kit",
    slug: "remote-starter-kit",
    sku: "RE-WEL-002",
    category: "employee-welcome-kits",
    short: "Desk lamp, notebook and mug for the home office.",
    description:
      "A thoughtful kit for remote joiners: a compact LED desk lamp, linen notebook and stoneware mug, packed with a printed onboarding guide.",
    price: 239900,
    minQty: 20,
    colors: ["Bone", "Navy"],
    specs: [["Contents", "3 pieces + guide"], ["Lamp", "USB-C, 3 warmth settings"], ["Box", "Printed mailer"], ["Branding", "Print"]],
    custom: ["Logo printing", "Personalized packaging"],
    images: [U.office, U.desk, U.mug],
  },
  {
    name: "Diwali Luminance Set",
    slug: "diwali-luminance-set",
    sku: "RE-FES-001",
    category: "festival-gifts",
    short: "Brass diya, gourmet chocolates and a hand-poured candle.",
    description:
      "A festive set built around a hand-cast brass diya, single-origin chocolates and a sandalwood candle, presented in a deep navy box with gold foil detailing.",
    price: 219900,
    minQty: 25,
    colors: ["Navy", "Maroon"],
    specs: [["Contents", "Diya, chocolates, candle"], ["Box", "Rigid with gold foil"], ["Card", "Personalised insert"], ["Branding", "Foil stamping"]],
    custom: ["Foil stamping", "Personalized packaging", "Custom gift box"],
    images: [U.gifts, U.giftFlat, U.giftBox],
    featured: true,
  },
  {
    name: "Festive Dry Fruit Hamper",
    slug: "festive-dry-fruit-hamper",
    sku: "RE-FES-002",
    category: "festival-gifts",
    short: "Premium dry fruits in a reusable wooden tray.",
    description:
      "Almonds, cashews, pistachios and apricots in a reusable acacia tray, finished with a satin ribbon and a personalised greeting card.",
    price: 169900,
    minQty: 25,
    colors: ["Natural", "Navy"],
    specs: [["Contents", "4 dry fruit varieties"], ["Tray", "Acacia wood"], ["Weight", "800 g"], ["Branding", "Engraved plaque"]],
    custom: ["Laser engraving", "Personalized packaging"],
    images: [U.hamper2, U.giftFlat, U.hamper],
  },
  {
    name: "The Executive Hamper",
    slug: "executive-hamper",
    sku: "RE-HAM-001",
    category: "executive-hampers",
    short: "Leather folio, brass pen, single-origin coffee and chocolates.",
    description:
      "A signature client hamper: a leather folio, brass rollerball, single-origin coffee, artisan chocolates and a linen notebook, layered in a suede-lined trunk.",
    price: 649900,
    minQty: 10,
    colors: ["Navy", "Cognac"],
    specs: [["Contents", "5 curated pieces"], ["Box", "Suede-lined trunk"], ["Card", "Letterpress insert"], ["Branding", "Deboss + foil"]],
    custom: ["Laser engraving", "Foil stamping", "Custom gift box", "Personalized packaging"],
    images: [U.hamper, U.executive, U.giftBox],
    featured: true,
    type: "hamper",
    contents: ["Full-grain leather folio", "Brass rollerball pen", "Single-origin coffee, 250 g", "Artisan chocolate box", "Linen-bound notebook"],
    packaging: "Suede-lined rigid trunk with brass clasp and satin ribbon.",
  },
  {
    name: "New Joiner Welcome Hamper",
    slug: "new-joiner-welcome-hamper",
    sku: "RE-HAM-002",
    category: "employee-welcome-hampers",
    short: "A warm welcome with drinkware, stationery and a personalised card.",
    description:
      "A generous onboarding hamper with an insulated bottle, stoneware mug, notebook, pen and a personalised welcome card, packed in a reusable canvas crate.",
    price: 349900,
    minQty: 20,
    colors: ["Navy", "Ivory"],
    specs: [["Contents", "5 pieces"], ["Crate", "Reusable canvas"], ["Personalisation", "Name tag"], ["Branding", "Print + embroidery"]],
    custom: ["Logo printing", "Embroidery", "Personalized packaging"],
    images: [U.hamper2, U.team, U.handshake],
    type: "hamper",
    contents: ["Insulated steel bottle", "Stoneware mug", "Linen notebook", "Metal pen", "Personalised welcome card"],
    packaging: "Reusable canvas crate with leather handles and a printed sleeve.",
  },
  {
    name: "Diwali Celebration Hamper",
    slug: "diwali-celebration-hamper",
    sku: "RE-HAM-003",
    category: "diwali-hampers",
    short: "Diya, mithai, dry fruits and a sandalwood candle.",
    description:
      "Our most-loved festive hamper: a hand-cast brass diya, premium mithai, dry fruits and a sandalwood candle in a deep navy box with gold foil.",
    price: 289900,
    minQty: 25,
    colors: ["Navy", "Maroon", "Ivory"],
    specs: [["Contents", "5 festive pieces"], ["Box", "Rigid, gold foil"], ["Card", "Personalised"], ["Branding", "Foil stamping"]],
    custom: ["Foil stamping", "Personalized packaging", "Custom gift box"],
    images: [U.giftFlat, U.gifts, U.giftBox],
    featured: true,
    type: "hamper",
    contents: ["Hand-cast brass diya", "Premium mithai selection", "Roasted dry fruits", "Sandalwood candle", "Personalised greeting card"],
    packaging: "Deep navy rigid box, gold foil logo, champagne satin ribbon.",
  },
  {
    name: "New Year Signature Hamper",
    slug: "new-year-signature-hamper",
    sku: "RE-HAM-004",
    category: "new-year-hampers",
    short: "Sparkling juice, chocolates and a brass desk piece.",
    description:
      "A polished start to the year: sparkling juice, artisan chocolates, a brass desk piece and a linen planner, presented in an ivory keepsake box.",
    price: 319900,
    minQty: 20,
    colors: ["Ivory", "Navy"],
    specs: [["Contents", "4 pieces"], ["Box", "Ivory keepsake"], ["Card", "Letterpress"], ["Branding", "Foil stamping"]],
    custom: ["Foil stamping", "Personalized packaging"],
    images: [U.giftBox, U.gifts, U.executive],
    type: "hamper",
    contents: ["Sparkling juice, 750 ml", "Artisan chocolate selection", "Brass paperweight", "Linen weekly planner"],
    packaging: "Ivory rigid box with gold foil monogram and ribbon.",
  },
  {
    name: "Festival Gratitude Hamper",
    slug: "festival-gratitude-hamper",
    sku: "RE-HAM-005",
    category: "festival-hampers",
    short: "Tea, ceramics and sweets for every festive occasion.",
    description:
      "Single-estate tea, a pair of ceramic cups, seasonal sweets and a hand-poured candle, packed in a reusable wooden tray.",
    price: 259900,
    minQty: 20,
    colors: ["Natural", "Navy", "Bone"],
    specs: [["Contents", "4 pieces"], ["Tray", "Reusable wood"], ["Card", "Personalised"], ["Branding", "Engraved plaque"]],
    custom: ["Laser engraving", "Personalized packaging"],
    images: [U.hamper2, U.mug, U.giftFlat],
    type: "hamper",
    contents: ["Single-estate tea, 100 g", "Pair of ceramic cups", "Seasonal sweet box", "Hand-poured candle"],
    packaging: "Reusable wooden tray with printed belly band and ribbon.",
  },
  {
    name: "Client Appreciation Trunk",
    slug: "client-appreciation-trunk",
    sku: "RE-HAM-006",
    category: "client-appreciation-hampers",
    short: "A premium trunk of coffee, chocolate and desk objects.",
    description:
      "A thank-you with weight: single-origin coffee, artisan chocolate, a leather card holder and a brass pen in a suede-lined trunk with a letterpress note.",
    price: 549900,
    minQty: 10,
    colors: ["Cognac", "Navy"],
    specs: [["Contents", "4 premium pieces"], ["Trunk", "Suede-lined"], ["Note", "Letterpress"], ["Branding", "Deboss + foil"]],
    custom: ["Embossing", "Foil stamping", "Custom gift box"],
    images: [U.hamper, U.handshake, U.executive],
    featured: true,
    type: "hamper",
    contents: ["Single-origin coffee, 250 g", "Artisan chocolate box", "Leather card holder", "Brass rollerball pen"],
    packaging: "Suede-lined trunk with brass hardware and a letterpress note.",
  },
  {
    name: "Build-Your-Own Corporate Hamper",
    slug: "build-your-own-corporate-hamper",
    sku: "RE-HAM-007",
    category: "custom-corporate-hampers",
    short: "Choose every element, from contents to packaging and budget.",
    description:
      "Tell us your audience, budget and brand, and we will build a hamper from scratch. Choose the box, ribbon, contents and personalisation; we handle sourcing, packing and delivery.",
    minQty: 25,
    colors: ["Custom"],
    specs: [["Contents", "Your selection"], ["Box", "Your choice"], ["Budget", "Flexible"], ["Branding", "Fully custom"]],
    custom: ["Logo printing", "Laser engraving", "Embossing", "Foil stamping", "Custom gift box", "Personalized packaging"],
    images: [U.hamper, U.giftBox, U.giftFlat],
    type: "hamper",
    contents: ["Curated to your brief", "Flexible budget bands", "Custom packaging", "Personalised cards"],
    packaging: "Designed around your brand and budget.",
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
        imageUrl: img(category.image, 900),
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
          url: img(image, 1400),
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
