-- Custom SQL migration for podcast catalog and studio blackouts
CREATE TABLE IF NOT EXISTS "podcast_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"seats" integer DEFAULT 2 NOT NULL,
	"location" text DEFAULT 'Iris Bay - Business Bay, Dubai' NOT NULL,
	"image" text,
	"gradient" text,
	"description" text,
	"is_available" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "podcast_addons" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"desc" text,
	"price_num" integer NOT NULL,
	"price_display" text NOT NULL,
	"unit" text DEFAULT 'per asset' NOT NULL,
	"gradient" text,
	"vimeo_embed" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "studio_blackouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_id" uuid,
	"podcast_set_id" text,
	"title" text NOT NULL,
	"reason" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"all_day" boolean DEFAULT false NOT NULL,
	"created_by_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "studio_blackouts" ADD CONSTRAINT "studio_blackouts_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "studio_blackouts_time_idx" ON "studio_blackouts" USING btree ("start_time","end_time");
CREATE INDEX IF NOT EXISTS "studio_blackouts_studio_idx" ON "studio_blackouts" USING btree ("studio_id");
