CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."inquiry_type" AS ENUM('ob_van', 'live_broadcast', 'outdoor_filming', 'studio_booking', 'technical_support', 'general');--> statement-breakpoint
CREATE TYPE "public"."project_category" AS ENUM('government', 'commercial', 'influencer', 'event', 'documentary');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('podcast', 'video_production', 'photography', 'interview', 'commercial', 'music_video');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_code" text NOT NULL,
	"user_id" uuid,
	"studio_id" uuid,
	"session_type" "session_type" NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"duration_hours" integer DEFAULT 1 NOT NULL,
	"headcount" integer DEFAULT 1 NOT NULL,
	"equipment_ids" jsonb DEFAULT '[]'::jsonb,
	"props_notes" text,
	"crew_notes" text,
	"special_requests" text,
	"needs_editing" boolean DEFAULT false,
	"needs_color_grading" boolean DEFAULT false,
	"needs_sound_mastering" boolean DEFAULT false,
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'AED' NOT NULL,
	"payment_status" text DEFAULT 'unpaid' NOT NULL,
	"payment_reference" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
CREATE TABLE "enterprise_rfps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_code" text NOT NULL,
	"organization_name" text NOT NULL,
	"organization_type" text DEFAULT 'enterprise' NOT NULL,
	"contact_name" text NOT NULL,
	"contact_title" text,
	"work_email" text NOT NULL,
	"phone" text NOT NULL,
	"country" text DEFAULT 'UAE' NOT NULL,
	"project_scope" text NOT NULL,
	"target_locations" jsonb DEFAULT '[]'::jsonb,
	"estimated_budget" text NOT NULL,
	"requires_mawthooq_compliance" boolean DEFAULT false NOT NULL,
	"requires_ob_van" boolean DEFAULT false NOT NULL,
	"project_timeline" text,
	"selected_creators" jsonb DEFAULT '[]'::jsonb,
	"digital_twin_environment" text,
	"notes" text,
	"status" text DEFAULT 'pending_review' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "enterprise_rfps_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"daily_rate" numeric(10, 2) NOT NULL,
	"image_url" text,
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "influencers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"nationality" text,
	"bio" text,
	"image_url" text,
	"total_followers" integer,
	"instagram_handle" text,
	"youtube_handle" text,
	"tiktok_handle" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "influencers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"inquiry_type" "inquiry_type" DEFAULT 'general' NOT NULL,
	"message" text NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"category" "project_category" NOT NULL,
	"client" text,
	"cover_image_url" text,
	"video_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "studios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"capacity" integer DEFAULT 10 NOT NULL,
	"hourly_rate" numeric(10, 2) NOT NULL,
	"image_url" text,
	"amenities" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "studios_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE no action ON UPDATE no action;