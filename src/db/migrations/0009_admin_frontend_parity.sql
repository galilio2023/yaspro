ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "half_day_rate" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "full_day_rate" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "area_sqm" integer;--> statement-breakpoint
ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "dimensions" text;--> statement-breakpoint
ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "ceiling_height" text;--> statement-breakpoint
ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "power" text;--> statement-breakpoint
ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "sound_isolation" text;--> statement-breakpoint
ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "category" text;--> statement-breakpoint
ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "badge" text;--> statement-breakpoint
ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "gallery" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "internal_notes" text;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "promo_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label" text,
	"discount_percent" integer,
	"discount_amount" numeric(10, 2),
	"eligible_offer_ids" jsonb,
	"expires_at" timestamp,
	"max_uses" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
