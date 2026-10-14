ALTER TABLE "bookings" ADD COLUMN "promo_code" text;--> statement-breakpoint
CREATE INDEX "bookings_promo_code_idx" ON "bookings" USING btree ("promo_code");