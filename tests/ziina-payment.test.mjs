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
  totalAmount: '2400.00',
  paymentStatus: 'unpaid',
  status: 'pending',
  ...over,
});

const mocksFor = (mockDb) => ({
  '@/db': { db: mockDb },
  '@/db/schema': { bookings: { id: Symbol('id'), referenceCode: Symbol('referenceCode'), paymentStatus: Symbol('ps') } },
  'drizzle-orm': { eq: () => {}, and: () => {} },
  'next/cache': { revalidatePath: () => {}, updateTag: () => {} },
});

test('createZiinaPaymentIntent simulation uses the SERVER amount and ignores the client amount', async () => {
  let updatedBooking = null;
  const mockDb = {
    query: { bookings: { findFirst: async () => booking() } },
    update: () => ({ set: (data) => { updatedBooking = data; return { where: () => Promise.resolve() }; } }),
  };
  const { createZiinaPaymentIntent } = loadSource('src/lib/ziina.ts', mocksFor(mockDb));

  // client claims AED 1 — must be ignored
  const res = await createZiinaPaymentIntent('YAS-BK-777', 1, 'deposit', 'YAS-BK-777');

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

  const res = await createZiinaPaymentIntent('booking-123', 500, 'full', 'YAS-BK-777');
  assert.equal(res.success, false);
  assert.match(res.error, /configuration is missing/i);
  assert.equal(dbUpdateCalled, false);
});

test('createZiinaPaymentIntent rejects unknown and already-paid bookings', async () => {
  let row = null;
  const mockDb = { query: { bookings: { findFirst: async () => row } }, update: () => { throw new Error('no'); } };
  const { createZiinaPaymentIntent } = loadSource('src/lib/ziina.ts', mocksFor(mockDb));

  assert.equal((await createZiinaPaymentIntent('x', 1, 'full', 'NOPE')).error, 'Booking not found.');
  row = booking({ paymentStatus: 'paid' });
  assert.match((await createZiinaPaymentIntent('x', 1, 'full', 'YAS-BK-777')).error, /already fully paid/i);
});