ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "arabic_badge" text;--> statement-breakpoint
ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "arabic_amenities" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN IF NOT EXISTS "arabic_specs" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "arabic_client" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "arabic_tag" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "arabic_deliverables" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "arabic_tech_stack" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "influencers" ADD COLUMN IF NOT EXISTS "arabic_name" text;--> statement-breakpoint
ALTER TABLE "influencers" ADD COLUMN IF NOT EXISTS "arabic_collaborations" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "influencers" ADD COLUMN IF NOT EXISTS "arabic_signature_productions" jsonb DEFAULT '[]'::jsonb;
