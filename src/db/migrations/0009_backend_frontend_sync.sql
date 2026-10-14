DO $$ BEGIN
  CREATE TYPE "public"."order_type" AS ENUM('studio_booking', 'podcast_booking', 'offer_claim', 'gear_rental');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."inquiry_pillar" AS ENUM('general', 'studios', 'podcast', 'production', 'influencers', 'social_media', 'equipment_rental', 'outdoor_broadcast');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "promo_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"discount_type" text DEFAULT 'percentage' NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"min_spend" numeric(10, 2) DEFAULT '0',
	"applicable_types" jsonb DEFAULT '["all"]'::jsonb,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "promo_usages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promo_code_id" uuid,
	"code" text NOT NULL,
	"user_email" text NOT NULL,
	"order_reference" text NOT NULL,
	"discount_applied" numeric(10, 2) NOT NULL,
	"used_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "podcast_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_code" text NOT NULL,
	"package_id" text NOT NULL,
	"package_name" text NOT NULL,
	"sessions_count" integer DEFAULT 1 NOT NULL,
	"include_video" boolean DEFAULT false NOT NULL,
	"needs_editing" boolean DEFAULT false NOT NULL,
	"needs_social_clips" boolean DEFAULT false NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"company" text,
	"preferred_date" text NOT NULL,
	"preferred_time" text NOT NULL,
	"special_requests" text,
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'AED' NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"promo_code" text,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"payment_status" text DEFAULT 'unpaid' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "podcast_bookings_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "offer_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_code" text NOT NULL,
	"offer_id" text NOT NULL,
	"offer_title" text NOT NULL,
	"offer_category" text NOT NULL,
	"sessions_count" integer DEFAULT 1 NOT NULL,
	"sessions_schedule" jsonb DEFAULT '[]'::jsonb,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"company" text,
	"notes" text,
	"original_price" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'AED' NOT NULL,
	"promo_code" text,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"payment_status" text DEFAULT 'unpaid' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "offer_claims_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gear_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_code" text NOT NULL,
	"items" jsonb NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"rental_days" integer DEFAULT 1 NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"company" text,
	"delivery_option" text DEFAULT 'pickup' NOT NULL,
	"delivery_address" text,
	"notes" text,
	"subtotal" numeric(10, 2) NOT NULL,
	"security_deposit" numeric(10, 2) DEFAULT '0',
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'AED' NOT NULL,
	"promo_code" text,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"payment_status" text DEFAULT 'unpaid' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gear_orders_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaign_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pillar" "inquiry_pillar" DEFAULT 'general' NOT NULL,
	"target_id" text,
	"target_name" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"budget_range" text,
	"timeline" text,
	"goals" jsonb DEFAULT '[]'::jsonb,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "promo_usages" ADD CONSTRAINT "promo_usages_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "promo_codes_code_active_idx" ON "promo_codes" USING btree ("code","is_active");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "promo_usages_code_email_idx" ON "promo_usages" USING btree ("code","user_email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "promo_usages_order_ref_idx" ON "promo_usages" USING btree ("order_reference");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "podcast_bookings_ref_idx" ON "podcast_bookings" USING btree ("reference_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "podcast_bookings_email_idx" ON "podcast_bookings" USING btree ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "podcast_bookings_created_at_idx" ON "podcast_bookings" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "offer_claims_ref_idx" ON "offer_claims" USING btree ("reference_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "offer_claims_email_idx" ON "offer_claims" USING btree ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "offer_claims_offer_id_idx" ON "offer_claims" USING btree ("offer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gear_orders_ref_idx" ON "gear_orders" USING btree ("reference_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gear_orders_email_idx" ON "gear_orders" USING btree ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gear_orders_created_at_idx" ON "gear_orders" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "campaign_inquiries_pillar_idx" ON "campaign_inquiries" USING btree ("pillar");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "campaign_inquiries_email_idx" ON "campaign_inquiries" USING btree ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "campaign_inquiries_created_at_idx" ON "campaign_inquiries" USING btree ("created_at");
