CREATE TABLE "booking_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"studio_id" uuid NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"duration_hours" integer NOT NULL,
	"headcount" integer NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_sessions" ADD CONSTRAINT "booking_sessions_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_sessions" ADD CONSTRAINT "booking_sessions_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "booking_sessions_booking_position_idx" ON "booking_sessions" USING btree ("booking_id","position");--> statement-breakpoint
CREATE INDEX "booking_sessions_studio_schedule_idx" ON "booking_sessions" USING btree ("studio_id","status","scheduled_at");--> statement-breakpoint
INSERT INTO "booking_sessions" ("booking_id", "position", "studio_id", "scheduled_at", "duration_hours", "headcount", "status")
SELECT "id", 1, "studio_id", "scheduled_at", "duration_hours", "headcount", "status"
FROM "bookings" WHERE "studio_id" IS NOT NULL;
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
ALTER TABLE "booking_sessions" ADD CONSTRAINT "booking_sessions_valid_schedule"
CHECK ("position" > 0 AND "duration_hours" > 0 AND "headcount" > 0);
--> statement-breakpoint
ALTER TABLE "booking_sessions" ADD CONSTRAINT "no_overlapping_booking_sessions"
EXCLUDE USING gist (
  "studio_id" WITH =,
  tsrange("scheduled_at", "scheduled_at" + "duration_hours" * INTERVAL '1 hour') WITH &&
) WHERE ("status" IN ('confirmed', 'pending'));
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "no_overlapping_bookings";
--> statement-breakpoint
CREATE FUNCTION sync_booking_schedule() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.studio_id IS NOT NULL THEN
    INSERT INTO booking_sessions (booking_id, position, studio_id, scheduled_at, duration_hours, headcount, status)
    VALUES (NEW.id, 1, NEW.studio_id, NEW.scheduled_at, NEW.duration_hours, NEW.headcount, NEW.status)
    ON CONFLICT (booking_id, position) DO UPDATE SET
      studio_id = EXCLUDED.studio_id, scheduled_at = EXCLUDED.scheduled_at,
      duration_hours = EXCLUDED.duration_hours, headcount = EXCLUDED.headcount,
      status = EXCLUDED.status;
  ELSE
    DELETE FROM booking_sessions WHERE booking_id = NEW.id AND position = 1;
  END IF;
  UPDATE booking_sessions SET status = NEW.status WHERE booking_id = NEW.id AND status <> NEW.status;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER bookings_sync_schedule
AFTER INSERT OR UPDATE OF studio_id, scheduled_at, duration_hours, headcount, status ON bookings
FOR EACH ROW EXECUTE FUNCTION sync_booking_schedule();
--> statement-breakpoint
CREATE FUNCTION inherit_booking_session_status() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Serialize session insertion with cancellation/payment confirmation of the checkout.
  SELECT status INTO NEW.status FROM bookings WHERE id = NEW.booking_id FOR UPDATE;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER booking_sessions_inherit_status BEFORE INSERT ON booking_sessions
FOR EACH ROW EXECUTE FUNCTION inherit_booking_session_status();
--> statement-breakpoint
UPDATE equipment SET category = 'accessories'
WHERE category IN ('cameras', 'lenses', 'bundles') AND slug IN (
  'smallhd-cine-7',
  'dzo-film-cinema-hard-case-lenses-box',
  'sigma-mc-11',
  'fusion-rig-for-sony-fx3-cinema-cage',
  'tilta-ff-t06-manual-follow-focus',
  'tilta-black-leather-side-handle',
  'tilta-camera-baseplate-15mm-lws',
  'tilta-v-mount-battery-plate-v2',
  'smallrig-npf-battery-adapter-plate',
  'smallrig-two-handles',
  'smallrig-shollder-plate',
  'smallrig-npfz100-dummy-battery-to-d-tap',
  'ulanzi-usb-c-cooler-fan-for-fx3'
);
