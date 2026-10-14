import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(dbUrl);

async function runSync() {
  console.log("Connecting to remote Neon PostgreSQL...");

  // 1. Ensure columns on users table
  console.log("Checking and syncing users table columns...");
  await sql`
    ALTER TABLE "users" 
    ADD COLUMN IF NOT EXISTS "phone" text,
    ADD COLUMN IF NOT EXISTS "company" text;
  `;
  console.log("✓ users table synced (phone, company columns verified).");

  // 2. Ensure columns on bookings table
  console.log("Checking and syncing bookings table columns...");
  await sql`
    ALTER TABLE "bookings"
    ADD COLUMN IF NOT EXISTS "promo_code" text;
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "bookings_promo_code_idx" ON "bookings" USING btree ("promo_code");
  `;
  console.log("✓ bookings table synced (promo_code column and index verified).");

  // 2b. Ensure booking_sessions table
  console.log("Checking and syncing booking_sessions table...");
  await sql`
    CREATE TABLE IF NOT EXISTS "booking_sessions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "booking_id" uuid NOT NULL REFERENCES "public"."bookings"("id") ON DELETE cascade,
      "position" integer NOT NULL,
      "studio_id" uuid NOT NULL REFERENCES "public"."studios"("id"),
      "scheduled_at" timestamp NOT NULL,
      "duration_hours" integer NOT NULL,
      "headcount" integer NOT NULL,
      "status" "booking_status" DEFAULT 'pending' NOT NULL
    );
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "booking_sessions_booking_position_idx" ON "booking_sessions" USING btree ("booking_id","position");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "booking_sessions_studio_schedule_idx" ON "booking_sessions" USING btree ("studio_id","status","scheduled_at");
  `;

  console.log("✓ booking_sessions table synced.");

  // 3. Ensure Enums
  console.log("Checking and syncing custom enums...");
  await sql`
    DO $$ BEGIN
      CREATE TYPE "public"."order_type" AS ENUM('studio_booking', 'podcast_booking', 'offer_claim', 'gear_rental');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;
  await sql`
    DO $$ BEGIN
      CREATE TYPE "public"."inquiry_pillar" AS ENUM('general', 'studios', 'podcast', 'production', 'influencers', 'social_media', 'equipment_rental', 'outdoor_broadcast');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;
  console.log("✓ enums verified.");

  // 4. Promo codes & usages
  console.log("Checking and syncing promo tables...");
  await sql`
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
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "promo_codes_code_active_idx" ON "promo_codes" USING btree ("code","is_active");
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "promo_usages" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "promo_code_id" uuid,
      "code" text NOT NULL,
      "user_email" text NOT NULL,
      "order_reference" text NOT NULL,
      "discount_applied" numeric(10, 2) NOT NULL,
      "used_at" timestamp DEFAULT now() NOT NULL
    );
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "promo_usages_code_email_idx" ON "promo_usages" USING btree ("code","user_email");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "promo_usages_order_ref_idx" ON "promo_usages" USING btree ("order_reference");
  `;
  console.log("✓ promo tables verified.");

  // 5. Podcast Bookings
  console.log("Checking and syncing podcast_bookings table...");
  await sql`
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
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "podcast_bookings_ref_idx" ON "podcast_bookings" USING btree ("reference_code");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "podcast_bookings_email_idx" ON "podcast_bookings" USING btree ("email");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "podcast_bookings_created_at_idx" ON "podcast_bookings" USING btree ("created_at");
  `;
  console.log("✓ podcast_bookings verified.");

  // 6. Offer Claims
  console.log("Checking and syncing offer_claims table...");
  await sql`
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
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "offer_claims_ref_idx" ON "offer_claims" USING btree ("reference_code");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "offer_claims_email_idx" ON "offer_claims" USING btree ("email");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "offer_claims_offer_id_idx" ON "offer_claims" USING btree ("offer_id");
  `;
  console.log("✓ offer_claims verified.");

  // 7. Gear Orders
  console.log("Checking and syncing gear_orders table...");
  await sql`
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
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "gear_orders_ref_idx" ON "gear_orders" USING btree ("reference_code");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "gear_orders_email_idx" ON "gear_orders" USING btree ("email");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "gear_orders_created_at_idx" ON "gear_orders" USING btree ("created_at");
  `;
  console.log("✓ gear_orders verified.");

  // 8. Campaign Inquiries
  console.log("Checking and syncing campaign_inquiries table...");
  await sql`
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
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "campaign_inquiries_pillar_idx" ON "campaign_inquiries" USING btree ("pillar");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "campaign_inquiries_email_idx" ON "campaign_inquiries" USING btree ("email");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "campaign_inquiries_created_at_idx" ON "campaign_inquiries" USING btree ("created_at");
  `;
  console.log("✓ campaign_inquiries verified.");

  // 9. Blocked Schedules
  console.log("Checking and syncing blocked_schedules table...");
  await sql`
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
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "blocked_schedules_dates_idx" ON "blocked_schedules" USING btree ("start_date","end_date");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "blocked_schedules_studio_idx" ON "blocked_schedules" USING btree ("studio_id");
  `;
  console.log("✓ blocked_schedules verified.");

  // 10. Booking Addons
  console.log("Checking and syncing booking_addons table...");
  await sql`
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
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "booking_addons_category_idx" ON "booking_addons" USING btree ("category");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "booking_addons_active_idx" ON "booking_addons" USING btree ("is_active");
  `;
  console.log("✓ booking_addons verified.");

  // 11. Service Packages
  console.log("Checking and syncing service_packages table...");
  await sql`
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
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "service_packages_pillar_idx" ON "service_packages" USING btree ("pillar");
  `;
  console.log("✓ service_packages verified.");

  // 12. Test query getCmsBookings mimics
  console.log("Testing exact getCmsBookings query against Neon DB...");
  const testResult = await sql`
    select "bookings"."id", "bookings"."reference_code", "bookings"."user_id", "bookings"."studio_id", 
           "bookings"."session_type", "bookings"."status", "bookings"."scheduled_at", "bookings"."duration_hours", 
           "bookings"."headcount", "bookings"."equipment_ids", "bookings"."props_notes", "bookings"."crew_notes", 
           "bookings"."special_requests", "bookings"."needs_editing", "bookings"."needs_color_grading", 
           "bookings"."needs_sound_mastering", "bookings"."total_amount", "bookings"."currency", 
           "bookings"."payment_status", "bookings"."payment_reference", "bookings"."promo_code", 
           "bookings"."created_at", "bookings"."updated_at", "users"."name", "users"."email", 
           "users"."phone", "users"."company", "studios"."name" as studio_name
    from "bookings" 
    left join "users" on "bookings"."user_id" = "users"."id" 
    left join "studios" on "bookings"."studio_id" = "studios"."id" 
    order by "bookings"."created_at" desc
    limit 5;
  `;
  console.log(`✓ Test bookings query executed successfully! Found ${testResult.length} booking rows.`);

  console.log("Testing exact line 66 booking_sessions query against Neon DB...");
  const bookingIds = testResult.map((r) => r.id);
  if (bookingIds.length) {
    const sessionResult = await sql`
      select "booking_sessions"."id", "booking_sessions"."booking_id", "booking_sessions"."position", 
             "booking_sessions"."studio_id", "booking_sessions"."scheduled_at", "booking_sessions"."duration_hours", 
             "booking_sessions"."headcount", "booking_sessions"."status", "studios"."name" as studio_name
      from "booking_sessions"
      left join "studios" on "booking_sessions"."studio_id" = "studios"."id"
      where "booking_sessions"."booking_id" = ANY(${bookingIds})
      order by "booking_sessions"."position" asc;
    `;
    console.log(`✓ Line 66 schedule query executed successfully! Found ${sessionResult.length} session rows.`);
  }

  console.log("\n==========================================");
  console.log("ALL REMOTE NEON TABLES & COLUMNS SYNCED 100%");
  console.log("==========================================");
}

runSync().catch((err) => {
  console.error("Migration/Sync Error:", err);
  process.exit(1);
});
