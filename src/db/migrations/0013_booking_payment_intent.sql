-- Snapshot intent terms; existing intents without terms must be recreated.
ALTER TABLE "bookings" ADD COLUMN "payment_intent" jsonb;
