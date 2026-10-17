-- Align schema additions with Neon PostgreSQL database
ALTER TABLE "offers" ADD COLUMN IF NOT EXISTS "restricted_hours" jsonb;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN IF NOT EXISTS "studio_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "offers" ADD CONSTRAINT "offers_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN IF NOT EXISTS "total_quantity" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "podcast_sets" ADD COLUMN IF NOT EXISTS "name_ar" text;--> statement-breakpoint
ALTER TABLE "podcast_sets" ADD COLUMN IF NOT EXISTS "location_ar" text;--> statement-breakpoint
ALTER TABLE "podcast_sets" ADD COLUMN IF NOT EXISTS "description_ar" text;--> statement-breakpoint
ALTER TABLE "podcast_addons" ADD COLUMN IF NOT EXISTS "title_ar" text;--> statement-breakpoint
ALTER TABLE "podcast_addons" ADD COLUMN IF NOT EXISTS "desc_ar" text;--> statement-breakpoint
ALTER TABLE "podcast_addons" ADD COLUMN IF NOT EXISTS "unit_ar" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TYPE "session_type" ADD VALUE IF NOT EXISTS 'virtual_production';
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
