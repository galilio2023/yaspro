ALTER TYPE "public"."project_category" ADD VALUE 'shows';--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "influencers" ALTER COLUMN "total_followers" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "security_deposit" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "specs" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "is_popular" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "is_kit" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "included_in_kit" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "influencers" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "influencers" ADD COLUMN "flag" text;--> statement-breakpoint
ALTER TABLE "influencers" ADD COLUMN "raw_followers" integer;--> statement-breakpoint
ALTER TABLE "influencers" ADD COLUMN "collaborations" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "influencers" ADD COLUMN "signature_productions" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "influencers" ADD COLUMN "demographics" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "arabic_title" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "tag" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "views" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "year" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "deliverables" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "tech_stack" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'client' NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookings_studio_schedule_idx" ON "bookings" USING btree ("studio_id","status","scheduled_at");--> statement-breakpoint
CREATE INDEX "bookings_user_id_idx" ON "bookings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookings_created_at_idx" ON "bookings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rfps_created_at_idx" ON "enterprise_rfps" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rfps_status_idx" ON "enterprise_rfps" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inquiries_resolved_idx" ON "inquiries" USING btree ("is_resolved");--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_slug_unique" UNIQUE("slug");