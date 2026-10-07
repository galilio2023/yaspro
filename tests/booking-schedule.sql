-- Run against a disposable copy of the pre-0007 schema (including the 0004 exclusion).
INSERT INTO studios (id, slug, name, hourly_rate) VALUES
 ('00000000-0000-0000-0000-000000000001', 'nature-grid', 'Test Nature', 390),
 ('00000000-0000-0000-0000-000000000002', 'dark-walnut', 'Test Walnut', 390);
INSERT INTO bookings (id, reference_code, studio_id, session_type, scheduled_at, duration_hours, headcount, total_amount)
VALUES ('10000000-0000-0000-0000-000000000001', 'TEST-LEGACY', '00000000-0000-0000-0000-000000000001', 'podcast', '2026-11-20 10:00', 1, 2, 390);
INSERT INTO equipment (slug, name, category, daily_rate) VALUES
 ('smallhd-cine-7', 'Test Monitor', 'bundles', 450),
 ('unrelated-camera', 'Test Camera', 'cameras', 100);
\ir ../src/db/migrations/0007_windy_skrulls.sql
DO $$
DECLARE checkout uuid; failed_checkout uuid;
BEGIN
  IF (SELECT category FROM equipment WHERE slug = 'smallhd-cine-7') <> 'accessories' THEN RAISE EXCEPTION 'Accessory migration failed'; END IF;
  IF (SELECT category FROM equipment WHERE slug = 'unrelated-camera') <> 'cameras' THEN RAISE EXCEPTION 'Unrelated gear changed'; END IF;
  IF (SELECT count(*) FROM booking_sessions) <> 1 THEN RAISE EXCEPTION 'Legacy backfill failed'; END IF;
  INSERT INTO bookings (reference_code, studio_id, session_type, scheduled_at, duration_hours, headcount, total_amount)
  VALUES ('TEST-MULTI', '00000000-0000-0000-0000-000000000001', 'podcast', '2026-11-20 12:00', 1, 2, 780) RETURNING id INTO checkout;
  INSERT INTO booking_sessions (booking_id, position, studio_id, scheduled_at, duration_hours, headcount)
  VALUES (checkout, 2, '00000000-0000-0000-0000-000000000002', '2026-11-21 12:00', 1, 2);
  IF (SELECT count(*) FROM booking_sessions WHERE booking_id = checkout) <> 2 THEN RAISE EXCEPTION 'Missing sessions'; END IF;
  IF (SELECT total_amount FROM bookings WHERE id = checkout) <> 780 THEN RAISE EXCEPTION 'Total changed'; END IF;
  -- A normal booking must conflict with a secondary podcast session.
  BEGIN
    INSERT INTO bookings (reference_code, studio_id, session_type, scheduled_at, duration_hours, total_amount)
    VALUES ('TEST-CONFLICT', '00000000-0000-0000-0000-000000000002', 'podcast', '2026-11-21 12:30', 1, 390);
    RAISE EXCEPTION 'Secondary conflict was accepted';
  EXCEPTION WHEN exclusion_violation THEN NULL;
  END;
  -- If a later session conflicts, the checkout and its primary schedule roll back together.
  BEGIN
    INSERT INTO bookings (reference_code, studio_id, session_type, scheduled_at, duration_hours, total_amount)
    VALUES ('TEST-ROLLBACK', '00000000-0000-0000-0000-000000000001', 'podcast', '2026-11-22 10:00', 1, 780) RETURNING id INTO failed_checkout;
    INSERT INTO booking_sessions (booking_id, position, studio_id, scheduled_at, duration_hours, headcount)
    VALUES (failed_checkout, 2, '00000000-0000-0000-0000-000000000002', '2026-11-21 12:00', 1, 2);
    RAISE EXCEPTION 'Conflict was accepted';
  EXCEPTION WHEN exclusion_violation THEN NULL;
  END;
  IF EXISTS (SELECT 1 FROM bookings WHERE reference_code = 'TEST-ROLLBACK') THEN RAISE EXCEPTION 'Partial checkout retained'; END IF;
  -- Payment confirmation and cancellation synchronize every session.
  UPDATE bookings SET status = 'confirmed', payment_status = 'paid', payment_reference = 'synthetic-payment' WHERE id = checkout;
  IF EXISTS (SELECT 1 FROM booking_sessions WHERE booking_id = checkout AND status <> 'confirmed') THEN RAISE EXCEPTION 'Status not synchronized'; END IF;
  UPDATE bookings SET status = 'cancelled' WHERE id = checkout;
  IF EXISTS (SELECT 1 FROM booking_sessions WHERE booking_id = checkout AND status <> 'cancelled') THEN RAISE EXCEPTION 'Cancellation not synchronized'; END IF;
  INSERT INTO bookings (reference_code, studio_id, session_type, scheduled_at, duration_hours, total_amount)
  VALUES ('TEST-RELEASED', '00000000-0000-0000-0000-000000000002', 'podcast', '2026-11-21 12:00', 1, 390);
  BEGIN
    UPDATE bookings SET status = 'confirmed' WHERE id = checkout;
    RAISE EXCEPTION 'Reactivation conflict was accepted';
  EXCEPTION WHEN exclusion_violation THEN NULL;
  END;
  IF (SELECT status FROM bookings WHERE id = checkout) <> 'cancelled' THEN RAISE EXCEPTION 'Reactivation did not roll back'; END IF;
  DELETE FROM bookings WHERE id = checkout;
  IF EXISTS (SELECT 1 FROM booking_sessions WHERE booking_id = checkout) THEN RAISE EXCEPTION 'Cascade failed'; END IF;
END;
$$;
