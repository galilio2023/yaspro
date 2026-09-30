CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "bookings" ADD CONSTRAINT "no_overlapping_bookings" 
EXCLUDE USING gist (
  "studio_id" WITH =,
  tsrange("scheduled_at", "scheduled_at" + ("duration_hours" || ' hours')::interval) WITH &&
) WHERE ("status" IN ('confirmed', 'pending'));