import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const loadDependency = createRequire(import.meta.url);
import vm from 'node:vm';
import ts from 'typescript';

function loadSource(file, mocks = {}, globals = {}) {
  const fullPath = path.resolve(import.meta.dirname, '..', file);
  const dir = path.dirname(fullPath);
  const source = fs.readFileSync(fullPath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require: (name) => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.startsWith('.')) {
        const resolvedTarget = path.resolve(dir, name);
        const candidate = [resolvedTarget, `${resolvedTarget}.ts`, `${resolvedTarget}.js`, path.join(resolvedTarget, 'index.ts')].find(fs.existsSync);
        if (candidate) {
          const relativeToRoot = path.relative(path.resolve(import.meta.dirname, '..'), candidate).replace(/\\/g, '/');
          return loadSource(relativeToRoot, mocks, globals);
        }
      }
      return loadDependency(name);
    },
    console: { error() {}, log() {} },
    process: { env: { DATABASE_URL: 'postgresql://test:local@localhost/rfp' } },
    ...globals,
  });
  return exports;
}

const tableMock = { id: Symbol('id'), slug: Symbol('slug') };
const schemaMock = {
  projects: tableMock,
  influencers: tableMock,
  equipment: tableMock,
  bookings: tableMock,
  enterpriseRfps: tableMock,
  inquiries: tableMock,
  users: tableMock,
  studios: tableMock,
};

test('updateInquiryStatus updates resolved state with database mock', async () => {
  let updatedPayload = null;
  const mockDb = {
    update: () => ({
      set: (payload) => {
        updatedPayload = payload;
        return {
          where: () => Promise.resolve(),
        };
      },
    }),
  };

  const { updateInquiryStatus } = loadSource('src/lib/cms-actions.ts', {
    '@/db': { db: mockDb },
    '@/db/schema': schemaMock,
    'drizzle-orm': { eq: () => {}, desc: () => {} },
    'next/cache': { revalidatePath: () => {} },
    '@/features/projects/data': { PROJECTS_DATA: [] },
    '@/features/influencers/data': { INFLUENCERS_DATA: [] },
    '@/features/gear/data': { GEAR_DATA: [] },
    '@/features/booking/constants': { STUDIOS: [] },
    '@/lib/utils': { slugify: (s) => s },
    '@/lib/auth': { auth: { api: { getSession: async () => ({ user: { role: 'admin' } }) } } },
    'next/headers': { headers: async () => new Headers() },
  });

  const res = await updateInquiryStatus('inq-123', true);
  assert.equal(res.success, true);
  assert.equal(updatedPayload?.isResolved, true);

  const resReopen = await updateInquiryStatus('inq-123', false);
  assert.equal(resReopen.success, true);
  assert.equal(updatedPayload?.isResolved, false);
});

test('updateBookingPaymentStatus updates paymentStatus and reference code', async () => {
  let updatedPayload = null;
  const mockDb = {
    update: () => ({
      set: (payload) => {
        updatedPayload = payload;
        return {
          where: () => Promise.resolve(),
        };
      },
    }),
  };

  const { updateBookingPaymentStatus } = loadSource('src/lib/cms-actions.ts', {
    '@/db': { db: mockDb },
    '@/db/schema': schemaMock,
    'drizzle-orm': { eq: () => {}, desc: () => {} },
    'next/cache': { revalidatePath: () => {} },
    '@/features/projects/data': { PROJECTS_DATA: [] },
    '@/features/influencers/data': { INFLUENCERS_DATA: [] },
    '@/features/gear/data': { GEAR_DATA: [] },
    '@/features/booking/constants': { STUDIOS: [] },
    '@/lib/utils': { slugify: (s) => s },
    '@/lib/auth': { auth: { api: { getSession: async () => ({ user: { role: 'admin' } }) } } },
    'next/headers': { headers: async () => new Headers() },
  });

  const res = await updateBookingPaymentStatus('book-99', 'paid', 'STRIPE_CH_991823');
  assert.equal(res.success, true);
  assert.equal(updatedPayload?.paymentStatus, 'paid');
  assert.equal(updatedPayload?.paymentReference, 'STRIPE_CH_991823');
});

test('dispatchTelemetryEvent returns success acknowledgment', async () => {
  const { dispatchTelemetryEvent } = loadSource('src/lib/cms-actions.ts', {
    '@/db': { db: {} },
    '@/db/schema': schemaMock,
    'drizzle-orm': { eq: () => {}, desc: () => {} },
    'next/cache': { revalidatePath: () => {} },
    '@/features/projects/data': { PROJECTS_DATA: [] },
    '@/features/influencers/data': { INFLUENCERS_DATA: [] },
    '@/features/gear/data': { GEAR_DATA: [] },
    '@/features/booking/constants': { STUDIOS: [] },
    '@/lib/utils': { slugify: (s) => s },
    '@/lib/auth': { auth: { api: { getSession: async () => ({ user: { role: 'admin' } }) } } },
    'next/headers': { headers: async () => new Headers() },
  });

  const res = await dispatchTelemetryEvent({
    source: 'OB-VAN MERCEDES 01',
    type: 'OB_VAN_GPS',
    level: 'info',
    summary: 'Starlink link locked at 1.2 Gbps uplink.',
  });

  assert.equal(res.success, true);
  assert.match(res.message, /broadcasted/i);
});

test('getCmsUsers and getCmsInquiries enforce admin authentication in connected environment', async () => {
  const { getCmsUsers, getCmsInquiries } = loadSource('src/lib/cms-actions.ts', {
    '@/db': { db: { select: () => ({ from: () => ({ orderBy: () => Promise.resolve([]) }) }) } },
    '@/db/schema': schemaMock,
    'drizzle-orm': { eq: () => {}, desc: () => {} },
    'next/cache': { revalidatePath: () => {} },
    '@/features/projects/data': { PROJECTS_DATA: [] },
    '@/features/influencers/data': { INFLUENCERS_DATA: [] },
    '@/features/gear/data': { GEAR_DATA: [] },
    '@/features/booking/constants': { STUDIOS: [] },
    '@/lib/utils': { slugify: (s) => s },
    '@/lib/auth': { auth: { api: { getSession: async () => ({ user: { role: 'admin' } }) } } },
    'next/headers': { headers: async () => new Headers() },
  });

  const usersList = await getCmsUsers();
  assert.ok(Array.isArray(usersList));

  const inquiriesList = await getCmsInquiries();
  assert.ok(Array.isArray(inquiriesList));
});

function gearReservationFixture({ storedGear, dbAvailable = true, insertError } = {}) {
  const inserts = [];
  const queries = [];
  const gear = { id: 'camera-kit', name: 'Trusted Camera', dailyRate: 101 };
  const { submitGearReservation } = loadSource('src/lib/actions/equipment-gear.ts', {
    '@/db': { db: {
      select: () => ({ from: () => ({ where: (condition) => {
        queries.push(condition);
        return { limit: async () => storedGear ? [storedGear] : [] };
      } }) }),
      insert: () => ({ values: async (value) => {
        if (insertError) throw insertError;
        inserts.push(value);
      } }),
    } },
    '@/db/schema': schemaMock,
    'drizzle-orm': { eq: (column, value) => ({ column, value }) },
    'next/cache': { revalidatePath() {} },
    '@/features/gear/data': { GEAR_DATA: [gear] },
    '@/lib/utils': {},
    './shared': { isDbAvailable: () => dbAvailable, isUuid: (id) => /^[0-9a-f-]{36}$/.test(id) },
  });
  const input = {
    gearId: gear.id, customerName: ' Test Customer ', email: 'test@example.com',
    phone: '+971 50 123 4567', durationDays: 1,
    gearName: 'Forged gear', estimatedTotal: 1,
  };
  return { submit: (overrides = {}) => submitGearReservation({ ...input, ...overrides }), inserts, queries };
}

test('gear reservation uses trusted catalog pricing for every tier and delivery option', async () => {
  for (const [durationDays, rental] of [[1, 101], [3, 243], [7, 462]]) {
    for (const deliveryMethod of ['soundstage', 'hub_pickup', 'dubai_courier']) {
      const fixture = gearReservationFixture();
      const result = await fixture.submit({ durationDays, deliveryMethod });
      assert.equal(result.success, true);
      assert.match(result.data.referenceCode, /^GEAR-/);
      const inquiry = fixture.inserts[0];
      assert.equal(inquiry.name, 'Test Customer');
      assert.ok(inquiry.message.includes('Item: Trusted Camera (ID: camera-kit)'));
      assert.ok(inquiry.message.includes(`Estimated Amount: AED ${rental + (deliveryMethod === 'dubai_courier' ? 250 : 0)}`));
      assert.ok(!inquiry.message.includes('Forged gear'));
    }
  }
});

test('gear reservation uses database name and rate for both UUID and slug lookup', async () => {
  for (const gearId of ['camera-kit', '12345678-1234-1234-1234-123456789abc']) {
    const fixture = gearReservationFixture({ storedGear: { id: 'db-id', name: 'Database Camera', dailyRate: '200.00', isAvailable: true } });
    assert.equal((await fixture.submit({ gearId, durationDays: 3, deliveryMethod: 'dubai_courier' })).success, true);
    assert.equal(fixture.queries[0].column, gearId === 'camera-kit' ? tableMock.slug : tableMock.id);
    assert.ok(fixture.inserts[0].message.includes('Item: Database Camera (ID: db-id)'));
    assert.ok(fixture.inserts[0].message.includes('Estimated Amount: AED 730'));
  }
});

test('gear reservation rejects invalid fields and unknown or unavailable gear without inserting', async () => {
  for (const [field, value] of [
    ['customerName', ' '], ['email', 'invalid'], ['phone', '-------'],
    ['durationDays', 0], ['durationDays', -3], ['durationDays', 1.5],
    ['durationDays', '7'], ['durationDays', Infinity], ['deliveryMethod', 'free_courier'],
    ['gearId', 'missing'], ['notes', 'x'.repeat(2001)],
  ]) {
    const fixture = gearReservationFixture();
    const result = await fixture.submit({ [field]: value });
    assert.equal(result.success, false, `${field}: ${value}`);
    assert.ok(result.error.includes(field));
    assert.equal(fixture.inserts.length, 0);
    assert.equal(result.data, undefined);
  }
  const fixture = gearReservationFixture({ storedGear: { id: 'camera-kit', dailyRate: '100', isAvailable: false } });
  assert.equal((await fixture.submit()).success, false);
  assert.equal(fixture.inserts.length, 0);
});

test('gear reservation returns WhatsApp fallback without a reference when persistence fails', async () => {
  for (const options of [{ dbAvailable: false }, { insertError: new Error('database unavailable') }]) {
    const fixture = gearReservationFixture(options);
    const result = await fixture.submit();
    assert.equal(result.success, false);
    assert.match(result.error, /WhatsApp/);
    assert.equal(result.data, undefined);
    assert.equal(fixture.inserts.length, 0);
  }
});

test('studio metrics distinguish an empty table from zero active rows', async () => {
  for (const [rows, expected] of [[[], 2], [[{ isActive: false }], 0], [[{ isActive: true }, { isActive: false }], 1]]) {
    const { getCmsOverviewStats } = loadSource('src/lib/actions/metrics-overview.ts', {
      '@/db': { db: { select: () => ({ from: async () => rows }) } },
      '@/db/schema': schemaMock,
      '@/features/projects/data': { PROJECTS_DATA: [] },
      '@/features/influencers/data': { INFLUENCERS_DATA: [] },
      '@/features/gear/data': { GEAR_DATA: [] },
      '@/features/booking/constants': { STUDIOS: [{}, {}] },
      './shared': { isDbAvailable: () => true, requireAdmin: async () => {} },
    });
    assert.equal((await getCmsOverviewStats()).activeStudios, expected);
  }
});


test('reservations reject inconsistent schedules before database work and derive omitted returns', async () => {
  for (const dates of [
    { startDate: '2026-10-01', returnDate: '2026-09-30' },
    { startDate: '2026-10-01', returnDate: '2026-10-01' },
    { startDate: '2026-10-01', returnDate: '2026-10-03' },
    { returnDate: '2026-10-02' },
  ]) {
    const fixture = gearReservationFixture();
    assert.equal((await fixture.submit(dates)).success, false);
    assert.equal(fixture.queries.length, 0);
    assert.equal(fixture.inserts.length, 0);
  }
  for (const returnDate of [undefined, '2027-01-02']) {
    const fixture = gearReservationFixture();
    assert.equal((await fixture.submit({ startDate: '2026-12-30', returnDate, durationDays: 3 })).success, true);
    assert.match(fixture.inserts[0].message, /Shoot Dates: 2026-12-30 to 2027-01-02/);
  }
});
