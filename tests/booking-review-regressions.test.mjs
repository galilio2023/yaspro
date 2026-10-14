import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const dependency = createRequire(import.meta.url);
function load(file, mocks, globals = {}) {
  const exports = {};
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  vm.runInNewContext(outputText, {
    exports, Date, Intl, console: { error() {}, warn() {} },
    process: { env: { DATABASE_URL: 'postgresql://synthetic/fixture' } },
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name]
      : name.startsWith('@/') || name.startsWith('./') ? {} : dependency(name),
    ...globals,
  });
  return exports;
}

const originalBooking = {
  id: 'booking-1', studioId: 'studio-1', scheduledAt: new Date('2026-11-20T09:00:00Z'),
  durationHours: 3, headcount: 5, status: 'confirmed', totalAmount: '1000.00',
};
const primary = { bookingId: 'booking-1', position: 1, ...originalBooking };
const secondary = { ...primary, id: 'session-2', position: 2, studioId: 'studio-2',
  scheduledAt: new Date('2026-11-21T10:00:00Z') };
function bookingFixture({ sessions = [primary, secondary], trigger = false, failSession = false } = {}) {
  const bookings = { id: 'id' }, bookingSessions = { bookingId: 'bookingId', position: 'position' };
  let booking = { ...originalBooking };
  let schedule = sessions.map((session) => ({ ...session }));
  const eq = (column, value) => (row) => row[column] === value;
  function writeSession(values, ignoreExisting = false) {
    if (failSession) throw new Error('Session write failed');
    const existing = schedule.find((session) => session.bookingId === values.bookingId && session.position === values.position);
    if (existing) {
      if (!ignoreExisting) Object.assign(existing, values);
    } else schedule.push({ ...values });
  }
  function syncTrigger() {
    if (trigger && booking.studioId) writeSession({ ...booking, bookingId: booking.id, position: 1 });
    if (trigger && !booking.studioId) schedule = schedule.filter((session) => session.position !== 1);
  }
  const tx = {
    update: () => ({ set: (data) => ({ where: (condition) => ({ returning: async () => {
      if (!condition(booking)) return [];
      Object.assign(booking, data);
      syncTrigger();
      return [{ ...booking }];
    } }) }) }),
    insert: (table) => ({ values: (values) => table === bookings ? { returning: async () => {
      booking = { id: 'booking-1', ...values };
      syncTrigger();
      return [{ ...booking }];
    } } : {
      onConflictDoNothing: async () => writeSession(values, true),
      onConflictDoUpdate: async () => writeSession(values),
    } }),
    delete: () => ({ where: async (condition) => {
      if (failSession) throw new Error('Session write failed');
      schedule = schedule.filter((session) => !condition(session));
    } }),
  };
  const actions = load('src/lib/actions/bookings-rfp-operations.ts', {
    '@/db/schema': { bookings, bookingSessions },
    '@/db': { db: { transaction: async (callback) => {
      const beforeBooking = { ...booking }, beforeSchedule = schedule.map((session) => ({ ...session }));
      try { return await callback(tx); }
      catch (error) { booking = beforeBooking; schedule = beforeSchedule; throw error; }
    } } },
    'drizzle-orm': { eq, and: (...conditions) => (row) => conditions.every((condition) => condition(row)) },
    'next/cache': { revalidatePath() {} }, 'next/headers': {},
    './shared': { requireAdmin: async () => {}, isDbAvailable: () => true },
  });
  return { ...actions, get booking() { return booking; }, get schedule() { return schedule; } };
}

test('schedule changes update only session 1, including duration and headcount alone', async () => {
  for (const trigger of [false, true]) {
    const f = bookingFixture({ trigger });
    assert.equal((await f.updateCmsBookingDetails({ id: 'booking-1', durationHours: 4, headcount: 6 })).success, true);
    assert.equal(f.schedule[0].durationHours, 4);
    assert.equal(f.schedule[0].headcount, 6);
    assert.deepEqual(f.schedule[1], secondary);
  }
});

test('adding a studio or repairing a missing session uses the stored booking values', async () => {
  for (const input of [{ studioId: 'studio-3' }, { scheduledAt: new Date('2026-11-22T08:00:00Z') }]) {
    const f = bookingFixture({ sessions: [secondary] });
    assert.equal((await f.updateCmsBookingDetails({ id: 'booking-1', ...input })).success, true);
    const session = f.schedule.find((item) => item.position === 1);
    assert.equal(session.studioId, input.studioId ?? originalBooking.studioId);
    assert.equal(session.scheduledAt.getTime(), (input.scheduledAt ?? originalBooking.scheduledAt).getTime());
    assert.equal(session.durationHours, originalBooking.durationHours);
    assert.equal(session.headcount, originalBooking.headcount);
    assert.deepEqual(f.schedule[0], secondary);
  }
});

test('clearing a studio removes only the primary session and preserves later sessions', async () => {
  for (const trigger of [false, true]) {
    const f = bookingFixture({ trigger });
    assert.equal((await f.updateCmsBookingDetails({ id: 'booking-1', studioId: null })).success, true);
    assert.equal(f.booking.studioId, null);
    assert.deepEqual(f.schedule, [secondary]);
  }
});

test('session insert and delete errors roll back booking edits', async () => {
  for (const input of [{ studioId: 'studio-3' }, { studioId: null }]) {
    const f = bookingFixture({ failSession: true });
    const result = await f.updateCmsBookingDetails({ id: 'booking-1', ...input });
    assert.equal(result.success, false);
    assert.match(result.error, /Session write failed/);
    assert.deepEqual(f.booking, originalBooking);
    assert.deepEqual(f.schedule, [primary, secondary]);
  }
  assert.equal((await bookingFixture().updateCmsBookingDetails({ id: 'missing', studioId: 'studio-3' })).success, false);
});

const manualInput = { clientName: 'Test Guest', clientEmail: 'guest@example.com', clientPhone: '+971500000000',
  sessionType: 'video_production', scheduledAt: originalBooking.scheduledAt, durationHours: 3,
  headcount: 5, totalAmount: '1000.00', status: 'confirmed' };
test('manual creation persists exactly one initial session with or without the booking trigger', async () => {
  for (const trigger of [false, true]) {
    const f = bookingFixture({ sessions: [], trigger });
    assert.equal((await f.createManualCmsBooking({ ...manualInput, studioId: 'studio-1' })).success, true);
    assert.equal(f.schedule.length, 1);
    assert.equal(f.schedule[0].status, 'confirmed');
  }
  const f = bookingFixture({ sessions: [], failSession: true });
  assert.equal((await f.createManualCmsBooking({ ...manualInput, studioId: 'studio-1' })).success, false);
  assert.deepEqual(f.booking, originalBooking);
  assert.equal(f.schedule.length, 0);
  assert.equal((await f.createManualCmsBooking(manualInput)).success, true);
  assert.equal(f.schedule.length, 0);
});

test('built-in promos obey database restrictions, including a zero redemption limit', async () => {
  let promo = { code: 'YASPRO10', discountType: 'percentage', discountValue: '10', isActive: true,
    expiresAt: null, maxUses: null, usedCount: 0, applicableTypes: ['studio_booking'] };
  const { validateUniversalPromoCode } = load('src/lib/actions.ts', {
    '@/db': { db: { query: { promoCodes: { findFirst: async () => promo } } } },
    '@/db/schema': { promoCodes: { code: 'code' } }, 'drizzle-orm': { eq() {} },
    'next/cache': {}, 'next/headers': {},
  });
  for (const changes of [
    { isActive: false }, { expiresAt: new Date('2000-01-01') }, { maxUses: 0 },
    { maxUses: 1, usedCount: 1 }, { applicableTypes: ['gear_rental'] },
  ]) {
    const original = promo;
    promo = { ...promo, ...changes };
    assert.equal((await validateUniversalPromoCode('YASPRO10', 'studio_booking')).valid, false);
    promo = original;
  }
  assert.equal((await validateUniversalPromoCode(' yaspro10 ', 'studio_booking')).valid, true);
  promo = null;
  assert.equal((await validateUniversalPromoCode('YASPRO10', 'studio_booking')).valid, false);
});

function nodes(node, predicate) {
  if (Array.isArray(node)) return node.flatMap((child) => nodes(child, predicate));
  if (!node || typeof node !== 'object') return [];
  return [...(predicate(node) ? [node] : []), ...nodes(node.props?.children, predicate)];
}
test('booking edit at Dubai midnight and across the UTC date boundary preserves its instant', async () => {
  const beforeZone = process.env.TZ;
  try {
    for (const zone of ['UTC', 'America/Los_Angeles', 'Asia/Dubai']) {
      process.env.TZ = zone;
      for (const [instant, expectedTime] of [['2026-11-20T20:00:00Z', '00:00'], ['2026-11-20T21:30:00Z', '01:30']]) {
        const states = [];
        let cursor = 0, saved;
        const booking = { ...originalBooking, scheduledAt: new Date(instant), referenceCode: 'YAS-TEST',
          sessionType: 'video_production', userName: 'Test Guest', userEmail: 'guest@example.com', userPhone: '12345678' };
        const { BookingsManager } = load('src/features/admin/components/BookingsManager.tsx', {
          react: { ...dependency('react'), useState: (initial) => {
            const index = cursor++;
            if (!(index in states)) states[index] = initial;
            return [states[index], (value) => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
          }, useRef: () => ({ current: null }), useCallback: (fn) => fn },
          '@/hooks/usePagination': { usePagination: (items) => ({ paginatedItems: items }) },
          '@/hooks/useFeedbackAlert': { useFeedbackAlert: () => ({ showFeedback() {} }) },
          '@/lib/utils': { formatCurrency: String },
          '@/lib/actions/bookings-rfp-operations': { updateCmsBookingDetails: async (input) => {
            saved = input; return { success: true };
          } },
        });
        const render = () => { cursor = 0; return BookingsManager({ initialBookings: [booking] }); };
        const edit = nodes(render(), (node) => node.type === 'button' && node.props.title === 'Edit Booking & Reschedule')[0];
        edit.props.onClick();
        const tree = render();
        assert.equal(nodes(tree, (node) => node.props?.type === 'date')[0].props.value, '2026-11-21');
        assert.equal(nodes(tree, (node) => node.props?.type === 'time')[0].props.value, expectedTime);
        await nodes(tree, (node) => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
        assert.equal(saved.scheduledAt.toISOString(), instant.replace('Z', '.000Z'));
      }
    }
  } finally {
    if (beforeZone === undefined) delete process.env.TZ;
    else process.env.TZ = beforeZone;
  }
});
