CREATE TABLE IF NOT EXISTS "blocked_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_id" text,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"start_time" text,
	"end_time" text,
	"reason" text NOT NULL,
	"scope" text DEFAULT 'all' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blocked_schedules_dates_idx" ON "blocked_schedules" USING btree ("start_date","end_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blocked_schedules_studio_idx" ON "blocked_schedules" USING btree ("studio_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "booking_addons" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"arabic_name" text,
	"description" text,
	"price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"price_unit" text DEFAULT 'session' NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	"prop_category" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_addons_category_idx" ON "booking_addons" USING btree ("category");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_addons_active_idx" ON "booking_addons" USING btree ("is_active");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_packages" (
	"id" text PRIMARY KEY NOT NULL,
	"pillar" text NOT NULL,
	"title" text NOT NULL,
	"arabic_title" text,
	"subtitle" text,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'AED' NOT NULL,
	"badge" text,
	"hours" integer,
	"episodes_count" integer,
	"deliverables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"arabic_deliverables" jsonb DEFAULT '[]'::jsonb,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_packages_pillar_idx" ON "service_packages" USING btree ("pillar");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_packages_active_idx" ON "service_packages" USING btree ("is_active");
