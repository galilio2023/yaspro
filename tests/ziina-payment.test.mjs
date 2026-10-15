import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const loadDependency = createRequire(import.meta.url);
import vm from 'node:vm';
import ts from 'typescript';

function loadSource(file, mocks = {}, globals = {}) {
  const source = fs.readFileSync(path.join(import.meta.dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : loadDependency(name),
    console: { error() {}, log() {}, warn() {} },
    process: { env: { DATABASE_URL: 'postgresql://test:local@localhost/db', NODE_ENV: 'test', ZIINA_SIMULATE: 'true' } },
    ...globals,
  });
  return exports;
}

const booking = (over = {}) => ({
  id: '11111111-2222-3333-4444-555555555555',
  referenceCode: 'YAS-BK-777',
  userId: 'owner',
  totalAmount: '2400.00',
  paymentStatus: 'unpaid',
  status: 'pending',
  ...over,
});

const mocksFor = (mockDb) => ({
  '@/lib/actions/platform-settings-operations': { getPlatformSettings: async () => ({ depositPercent: 50, vatRatePercent: 5 }) },
  '@/lib/actions/shared': { getCurrentSession: async () => ({ user: { id: 'owner' } }) },
  '@/lib/booking-payment-capability': { hasBookingPaymentCapability: async () => false },
  '@/db': { db: mockDb },
  '@/db/schema': { bookings: { id: Symbol('id'), referenceCode: Symbol('referenceCode'), paymentStatus: Symbol('ps') } },
  'drizzle-orm': { eq: () => {}, and: () => {} },
  'next/cache': { revalidatePath: () => {}, updateTag: () => {} },
});

test('createZiinaPaymentIntent simulation uses the server quote amount', async () => {
  let updatedBooking = null;
  const mockDb = {
    query: { bookings: { findFirst: async () => booking() } },
    update: () => ({ set: (data) => { updatedBooking = data; return { where: () => ({ returning: async () => [{ id: 'booking' }] }) }; } }),
  };
  const { createZiinaPaymentIntent } = loadSource('src/lib/ziina.ts', mocksFor(mockDb));

  const res = await createZiinaPaymentIntent('YAS-BK-777', { paymentStatus: 'unpaid', amountAed: 1200 }, 'deposit', 'YAS-BK-777');

  assert.equal(res.success, true);
  assert.equal(res.paymentStatus, 'deposit_paid');
  assert.match(res.message, /1,200/);
  assert.ok(res.transactionId.startsWith('ZIINA_SIM_'));
  assert.equal(updatedBooking.paymentReference, res.transactionId);
});

test('createZiinaPaymentIntent never simulates in production and does NOT update the database', async () => {
  let dbUpdateCalled = false;
  const mockDb = {
    query: { bookings: { findFirst: async () => booking() } },
    update: () => { dbUpdateCalled = true; return { set: () => ({ where: () => Promise.resolve() }) }; },
  };
  const { createZiinaPaymentIntent } = loadSource('src/lib/ziina.ts', mocksFor(mockDb), {
    process: { env: { NODE_ENV: 'production', ZIINA_SIMULATE: 'true', DATABASE_URL: 'postgresql://real@host/db' } },
  });

  const res = await createZiinaPaymentIntent('booking-123', { paymentStatus: 'unpaid', amountAed: 2400 }, 'full', 'YAS-BK-777');
  assert.equal(res.success, false);
  assert.match(res.error, /configuration is missing/i);
  assert.equal(dbUpdateCalled, false);
});

test('createZiinaPaymentIntent rejects unknown and already-paid bookings', async () => {
  let row = null;
  const mockDb = { query: { bookings: { findFirst: async () => row } }, update: () => { throw new Error('no'); } };
  const { createZiinaPaymentIntent } = loadSource('src/lib/ziina.ts', mocksFor(mockDb));

  assert.equal((await createZiinaPaymentIntent('x', { paymentStatus: 'unpaid', amountAed: 2400 }, 'full', 'NOPE')).error, 'Booking not found.');
  row = booking({ paymentStatus: 'paid' });
  assert.match((await createZiinaPaymentIntent('x', { paymentStatus: 'unpaid', amountAed: 2400 }, 'full', 'YAS-BK-777')).error, /already fully paid/i);
});
for (const [userId, sessionId, capability, allowed] of [
  ['owner', null, false, false], ['owner', 'other', true, false],
  ['owner', 'owner', false, true], [null, null, false, false], [null, null, true, true],
]) {
  test(`Ziina authorization: owner=${userId}, session=${sessionId}, capability=${capability}`, async () => {
    let writes = 0;
    const mockDb = {
      query: { bookings: { findFirst: async () => booking({ userId }) } },
      update: () => { writes++; return { set: () => ({ where: () => ({ returning: async () => [{ id: 'booking' }] }) }) }; },
    };
    const { createZiinaPaymentIntent } = loadSource('src/lib/ziina.ts', {
      ...mocksFor(mockDb),
      '@/lib/actions/shared': { getCurrentSession: async () => sessionId ? { user: { id: sessionId } } : null },
      '@/lib/booking-payment-capability': { hasBookingPaymentCapability: async () => capability },
    }, { fetch: () => { throw new Error('Unexpected provider call'); } });
    const result = await createZiinaPaymentIntent('YAS-BK-777', { paymentStatus: 'unpaid', amountAed: 2400 }, 'full', 'YAS-BK-777');
    assert.equal(result.success, allowed);
    assert.equal(writes, allowed ? 1 : 0);
    if (!allowed) assert.match(result.error, /Unauthorized/);
  });
}

for (const updatedRows of [[], [{ id: 'booking' }]]) {
  test(`Ziina live redirect requires a persisted reference (${updatedRows.length} rows)`, async () => {
    let values;
    const mockDb = {
      query: { bookings: { findFirst: async () => booking() } },
      update: () => ({ set: (data) => { values = data; return { where: () => ({ returning: async () => updatedRows }) }; } }),
    };
    const { createZiinaPaymentIntent } = loadSource('src/lib/ziina.ts', mocksFor(mockDb), {
      process: { env: { NODE_ENV: 'production', DATABASE_URL: 'postgresql://fixture/db', ZIINA_API_KEY: 'synthetic-key' } },
      AbortSignal,
      fetch: async () => ({ ok: true, json: async () => ({ id: 'intent', redirect_url: 'https://example.test/pay' }) }),
    });
    const result = await createZiinaPaymentIntent('YAS-BK-777', { paymentStatus: 'unpaid', amountAed: 2400 }, 'full', 'YAS-BK-777');
    assert.equal(result.success, updatedRows.length > 0);
    assert.equal(values.paymentReference, 'intent');
    if (!updatedRows.length) {
      assert.equal(result.paymentUrl, undefined);
      assert.match(result.error, /retry/i);
    }
  });
}

for (const [depositPercent, status, type, expectedAmount, expectedStatus] of [
  [25, 'unpaid', 'deposit', 600, 'deposit_paid'],
  [70, 'unpaid', 'deposit', 1680, 'deposit_paid'],
  [25, 'deposit_paid', 'full', 1800, 'paid'],
  [100, 'unpaid', 'full', 2400, 'paid'],
]) {
  test(`server quote and provider agree: ${depositPercent}% ${status} ${type}`, async () => {
    let payload;
    const db = {
      query: { bookings: { findFirst: async () => booking({ paymentStatus: status }) } },
      update: () => ({ set: () => ({ where: () => ({ returning: async () => [{ id: 'booking' }] }) }) }),
    };
    const api = loadSource('src/lib/ziina.ts', {
      ...mocksFor(db),
      '@/lib/actions/platform-settings-operations': { getPlatformSettings: async () => ({ depositPercent, vatRatePercent: 0 }) },
    }, {
      process: { env: { NODE_ENV: 'production', DATABASE_URL: 'postgresql://fixture/db', ZIINA_API_KEY: 'synthetic-key' } },
      AbortSignal,
      fetch: async (_url, init) => {
        payload = JSON.parse(init.body);
        return { ok: true, json: async () => ({ id: 'intent', redirect_url: 'https://example.test/pay' }) };
      },
    });
    const { quote } = await api.getBookingPaymentQuote('YAS-BK-777', 'YAS-BK-777');
    assert.equal(quote.vatRatePercent, 0);
    const option = quote.options.find((option) => option.type === type);
    assert.equal(option.amountAed, expectedAmount);
    if (status === 'deposit_paid' || depositPercent === 100) assert.equal(quote.options.length, 1);
    const result = await api.createZiinaPaymentIntent('YAS-BK-777', {
      paymentStatus: quote.paymentStatus, amountAed: option.amountAed,
    }, type, 'YAS-BK-777');
    assert.equal(result.success, true);
    assert.equal(payload.amount, expectedAmount * 100);
    assert.equal(payload.metadata.paymentType, expectedStatus);
  });
}

for (const [status, amountAed, type] of [
  ['unpaid', 1, 'full'],
  ['unpaid', 1200, 'full'], // Same amount as the balance, but a stale status.
  ['deposit_paid', 1200, 'deposit'],
]) {
  test(`stale or tampered payment is refreshed without charging: ${status} ${amountAed} ${type}`, async () => {
    const db = {
      query: { bookings: { findFirst: async () => booking({ paymentStatus: 'deposit_paid' }) } },
      update: () => { throw new Error('Unexpected write'); },
    };
    const api = loadSource('src/lib/ziina.ts', mocksFor(db), {
      fetch: () => { throw new Error('Unexpected charge'); },
    });
    const result = await api.createZiinaPaymentIntent('YAS-BK-777', { paymentStatus: status, amountAed }, type, 'YAS-BK-777');
    assert.equal(result.success, false);
    assert.match(result.error, /changed/);
    assert.equal(result.quote.paymentStatus, 'deposit_paid');
    assert.equal(result.quote.options.length, 1);
    assert.equal(result.quote.options[0].amountAed, 1200);
  });
}

test('quote and intent fail closed if settings cannot be loaded', async () => {
  const db = {
    query: { bookings: { findFirst: async () => booking() } },
    update: () => { throw new Error('Unexpected write'); },
  };
  const api = loadSource('src/lib/ziina.ts', {
    ...mocksFor(db),
    '@/lib/actions/platform-settings-operations': { getPlatformSettings: async () => { throw new Error('read failed'); } },
  });
  assert.equal((await api.getBookingPaymentQuote('YAS-BK-777', 'YAS-BK-777')).quote, undefined);
  const result = await api.createZiinaPaymentIntent('YAS-BK-777', { paymentStatus: 'unpaid', amountAed: 1200 }, 'deposit', 'YAS-BK-777');
  assert.equal(result.success, false);
});
