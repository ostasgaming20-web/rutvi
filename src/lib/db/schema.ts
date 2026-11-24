import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    kind: text("kind").notNull().default("product"),
    parentId: integer("parent_id"),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("categories_slug_idx").on(table.slug),
    index("categories_parent_idx").on(table.parentId),
  ],
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sku: text("sku").notNull(),
    shortDescription: text("short_description"),
    description: text("description"),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    pricePaise: bigint("price_paise", { mode: "number" }),
    discountPricePaise: bigint("discount_price_paise", { mode: "number" }),
    material: text("material"),
    size: text("size"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    collection: text("collection"),
    minOrderQty: integer("min_order_qty").notNull().default(10),
    colors: jsonb("colors").$type<string[]>().notNull().default([]),
    specifications: jsonb("specifications").$type<{ label: string; value: string }[]>().notNull().default([]),
    customizationOptions: jsonb("customization_options").$type<string[]>().notNull().default([]),
    contents: jsonb("contents").$type<string[]>().notNull().default([]),
    packaging: text("packaging"),
    productType: text("product_type").notNull().default("product"),
    availability: text("availability").notNull().default("in_stock"),
    isFeatured: boolean("is_featured").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    isArchived: boolean("is_archived").notNull().default(false),
    viewCount: integer("view_count").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("products_slug_idx").on(table.slug),
    uniqueIndex("products_sku_idx").on(table.sku),
    index("products_category_idx").on(table.categoryId),
    index("products_featured_idx").on(table.isFeatured),
    index("products_type_idx").on(table.productType),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("product_images_product_idx").on(table.productId)],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    value: text("value").notNull(),
    sku: text("sku"),
    priceDeltaPaise: bigint("price_delta_paise", { mode: "number" }).notNull().default(0),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [index("product_variants_product_idx").on(table.productId)],
);

export const hamperItems = pgTable(
  "hamper_items",
  {
    id: serial("id").primaryKey(),
    hamperId: integer("hamper_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    quantity: integer("quantity").notNull().default(1),
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("hamper_items_hamper_idx").on(table.hamperId)],
);

export const customizationOptions = pgTable(
  "customization_options",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    priceNote: text("price_note"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [uniqueIndex("customization_options_slug_idx").on(table.slug)],
);

export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    company: text("company"),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    city: text("city"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("customers_email_idx").on(table.email)],
);

export const enquiries = pgTable(
  "enquiries",
  {
    id: serial("id").primaryKey(),
    customerId: integer("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    type: text("type").notNull().default("quote"),
    status: text("status").notNull().default("new"),
    priority: text("priority").notNull().default("normal"),
    assignedTo: text("assigned_to"),
    productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
    productName: text("product_name"),
    quantity: integer("quantity"),
    budgetPaise: bigint("budget_paise", { mode: "number" }),
    customization: jsonb("customization").$type<Record<string, unknown>>().notNull().default({}),
    message: text("message"),
    sourcePage: text("source_page"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("enquiries_customer_idx").on(table.customerId),
    index("enquiries_status_idx").on(table.status),
    index("enquiries_created_idx").on(table.createdAt),
    index("enquiries_assigned_idx").on(table.assignedTo),
  ],
);

export const enquiryNotes = pgTable(
  "enquiry_notes",
  {
    id: serial("id").primaryKey(),
    enquiryId: integer("enquiry_id")
      .notNull()
      .references(() => enquiries.id, { onDelete: "cascade" }),
    authorEmail: text("author_email").notNull(),
    body: text("body").notNull(),
    kind: text("kind").notNull().default("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("enquiry_notes_enquiry_idx").on(table.enquiryId)],
);

export const quotationRequests = pgTable(
  "quotation_requests",
  {
    id: serial("id").primaryKey(),
    enquiryId: integer("enquiry_id")
      .notNull()
      .references(() => enquiries.id, { onDelete: "cascade" }),
    quoteNumber: text("quote_number").notNull(),
    status: text("status").notNull().default("draft"),
    subtotalPaise: bigint("subtotal_paise", { mode: "number" }).notNull().default(0),
    taxPaise: bigint("tax_paise", { mode: "number" }).notNull().default(0),
    deliveryPaise: bigint("delivery_paise", { mode: "number" }).notNull().default(0),
    totalPaise: bigint("total_paise", { mode: "number" }).notNull().default(0),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("quotation_requests_number_idx").on(table.quoteNumber),
    index("quotation_requests_enquiry_idx").on(table.enquiryId),
  ],
);

export const quotationItems = pgTable(
  "quotation_items",
  {
    id: serial("id").primaryKey(),
    quotationId: integer("quotation_id")
      .notNull()
      .references(() => quotationRequests.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitPricePaise: bigint("unit_price_paise", { mode: "number" }).notNull().default(0),
    totalPaise: bigint("total_paise", { mode: "number" }).notNull().default(0),
  },
  (table) => [index("quotation_items_quotation_idx").on(table.quotationId)],
);

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  company: text("company"),
  quote: text("quote").notNull(),
  rating: integer("rating").notNull().default(5),
  isPublished: boolean("is_published").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminUsers = pgTable(
  "admin_users",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("admin"),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: text("created_by"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("admin_users_user_idx").on(table.userId),
    uniqueIndex("admin_users_email_idx").on(table.email),
  ],
);

export const websiteSettings = pgTable("website_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  draftValue: jsonb("draft_value").$type<Record<string, unknown> | null>(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  publishedBy: text("published_by"),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const homepageSections = pgTable(
  "homepage_sections",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    type: text("type").notNull(),
    title: text("title"),
    subtitle: text("subtitle"),
    body: text("body"),
    eyebrow: text("eyebrow"),
    imageUrl: text("image_url"),
    ctaLabel: text("cta_label"),
    ctaHref: text("cta_href"),
    secondaryCtaLabel: text("secondary_cta_label"),
    secondaryCtaHref: text("secondary_cta_href"),
    settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
    isEnabled: boolean("is_enabled").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("homepage_sections_key_idx").on(table.key)],
);

export const navigationMenus = pgTable(
  "navigation_menus",
  {
    id: serial("id").primaryKey(),
    location: text("location").notNull().default("header"),
    label: text("label").notNull(),
    href: text("href").notNull(),
    parentId: integer("parent_id"),
    isExternal: boolean("is_external").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    badge: text("badge"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("navigation_menus_location_idx").on(table.location)],
);

export const seoMetadata = pgTable(
  "seo_metadata",
  {
    id: serial("id").primaryKey(),
    path: text("path").notNull(),
    title: text("title"),
    description: text("description"),
    ogImage: text("og_image"),
    canonical: text("canonical"),
    robots: text("robots").notNull().default("index,follow"),
    keywords: text("keywords"),
    altText: text("alt_text"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("seo_metadata_path_idx").on(table.path)],
);

export const promoCampaigns = pgTable(
  "promo_campaigns",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type").notNull().default("announcement"),
    placement: text("placement").notNull().default("site_top"),
    headline: text("headline"),
    body: text("body"),
    imageUrl: text("image_url"),
    ctaLabel: text("cta_label"),
    ctaHref: text("cta_href"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("promo_campaigns_active_idx").on(table.isActive)],
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: serial("id").primaryKey(),
    fileName: text("file_name").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    kind: text("kind").notNull().default("image"),
    sizeBytes: integer("size_bytes").notNull(),
    url: text("url").notNull(),
    folder: text("folder").notNull().default("general"),
    alt: text("alt"),
    uploadedBy: text("uploaded_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("media_assets_kind_idx").on(table.kind), index("media_assets_folder_idx").on(table.folder)],
);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: serial("id").primaryKey(),
    type: text("type").notNull(),
    path: text("path"),
    productId: integer("product_id"),
    referrer: text("referrer"),
    source: text("source").notNull().default("direct"),
    device: text("device").notNull().default("desktop"),
    sessionId: text("session_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("analytics_events_created_idx").on(table.createdAt),
    index("analytics_events_type_idx").on(table.type),
    index("analytics_events_path_idx").on(table.path),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    actorEmail: text("actor_email"),
    action: text("action").notNull(),
    entity: text("entity"),
    entityId: text("entity_id"),
    meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_created_idx").on(table.createdAt),
    index("audit_logs_actor_idx").on(table.actorEmail),
    index("audit_logs_entity_idx").on(table.entity),
  ],
);

export const contentVersions = pgTable(
  "content_versions",
  {
    id: serial("id").primaryKey(),
    scope: text("scope").notNull(),
    version: integer("version").notNull(),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
    note: text("note"),
    authorEmail: text("author_email"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("content_versions_scope_idx").on(table.scope)],
);

export const uploadedFiles = pgTable(
  "uploaded_files",
  {
    id: serial("id").primaryKey(),
    enquiryId: integer("enquiry_id").references(() => enquiries.id, { onDelete: "set null" }),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    url: text("url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("uploaded_files_enquiry_idx").on(table.enquiryId)],
);

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type HamperItem = typeof hamperItems.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type EnquiryNote = typeof enquiryNotes.$inferSelect;
export type Quotation = typeof quotationRequests.$inferSelect;
export type QuotationItem = typeof quotationItems.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type CustomizationOption = typeof customizationOptions.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NavigationMenu = typeof navigationMenus.$inferSelect;
export type HomepageSection = typeof homepageSections.$inferSelect;
export type SeoMetadata = typeof seoMetadata.$inferSelect;
export type PromoCampaign = typeof promoCampaigns.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type ContentVersion = typeof contentVersions.$inferSelect;
