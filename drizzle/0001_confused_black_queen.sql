CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"path" text,
	"product_id" integer,
	"referrer" text,
	"source" text DEFAULT 'direct' NOT NULL,
	"device" text DEFAULT 'desktop' NOT NULL,
	"session_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_email" text,
	"action" text NOT NULL,
	"entity" text,
	"entity_id" text,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"scope" text NOT NULL,
	"version" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"note" text,
	"author_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiry_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"enquiry_id" integer NOT NULL,
	"author_email" text NOT NULL,
	"body" text NOT NULL,
	"kind" text DEFAULT 'note' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hamper_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"hamper_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homepage_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"subtitle" text,
	"body" text,
	"eyebrow" text,
	"image_url" text,
	"cta_label" text,
	"cta_href" text,
	"secondary_cta_label" text,
	"secondary_cta_href" text,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"kind" text DEFAULT 'image' NOT NULL,
	"size_bytes" integer NOT NULL,
	"url" text NOT NULL,
	"folder" text DEFAULT 'general' NOT NULL,
	"alt" text,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "navigation_menus" (
	"id" serial PRIMARY KEY NOT NULL,
	"location" text DEFAULT 'header' NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"parent_id" integer,
	"is_external" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"badge" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'announcement' NOT NULL,
	"placement" text DEFAULT 'site_top' NOT NULL,
	"headline" text,
	"body" text,
	"image_url" text,
	"cta_label" text,
	"cta_href" text,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"title" text,
	"description" text,
	"og_image" text,
	"canonical" text,
	"robots" text DEFAULT 'index,follow' NOT NULL,
	"keywords" text,
	"alt_text" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "last_login_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "parent_id" integer;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "meta_title" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "meta_description" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "priority" text DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "assigned_to" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "discount_price_paise" bigint;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "material" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "size" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "collection" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "website_settings" ADD COLUMN "draft_value" jsonb;--> statement-breakpoint
ALTER TABLE "website_settings" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "website_settings" ADD COLUMN "published_by" text;--> statement-breakpoint
ALTER TABLE "website_settings" ADD COLUMN "updated_by" text;--> statement-breakpoint
ALTER TABLE "enquiry_notes" ADD CONSTRAINT "enquiry_notes_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hamper_items" ADD CONSTRAINT "hamper_items_hamper_id_products_id_fk" FOREIGN KEY ("hamper_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_events_created_idx" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_type_idx" ON "analytics_events" USING btree ("type");--> statement-breakpoint
CREATE INDEX "analytics_events_path_idx" ON "analytics_events" USING btree ("path");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_email");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity");--> statement-breakpoint
CREATE INDEX "content_versions_scope_idx" ON "content_versions" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "enquiry_notes_enquiry_idx" ON "enquiry_notes" USING btree ("enquiry_id");--> statement-breakpoint
CREATE INDEX "hamper_items_hamper_idx" ON "hamper_items" USING btree ("hamper_id");--> statement-breakpoint
CREATE UNIQUE INDEX "homepage_sections_key_idx" ON "homepage_sections" USING btree ("key");--> statement-breakpoint
CREATE INDEX "media_assets_kind_idx" ON "media_assets" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "media_assets_folder_idx" ON "media_assets" USING btree ("folder");--> statement-breakpoint
CREATE INDEX "navigation_menus_location_idx" ON "navigation_menus" USING btree ("location");--> statement-breakpoint
CREATE INDEX "promo_campaigns_active_idx" ON "promo_campaigns" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "seo_metadata_path_idx" ON "seo_metadata" USING btree ("path");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "enquiries_assigned_idx" ON "enquiries" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "products_type_idx" ON "products" USING btree ("product_type");