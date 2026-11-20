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
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("categories_slug_idx").on(table.slug)],
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
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("products_slug_idx").on(table.slug),
    uniqueIndex("products_sku_idx").on(table.sku),
    index("products_category_idx").on(table.categoryId),
    index("products_featured_idx").on(table.isFeatured),
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
  ],
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
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

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
export type Enquiry = typeof enquiries.$inferSelect;
export type Quotation = typeof quotationRequests.$inferSelect;
export type QuotationItem = typeof quotationItems.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type CustomizationOption = typeof customizationOptions.$inferSelect;
