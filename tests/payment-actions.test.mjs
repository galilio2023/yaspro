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
    console: { error() {}, log() {} },
    process: { env: { DATABASE_URL: 'postgresql://test:local@localhost/db' } },
    ...globals,
  });
  return exports;
}

test('processBookingOnlinePayment records deposit payment and updates booking', async () => {
  let updatedValues = null;
  let revalidatedPaths = [];

  const mockDb = {
    update: () => ({
      set: (vals) => {
        updatedValues = vals;
        return {
          where: () => Promise.resolve(),
        };
      },
    }),
  };

  const { processBookingOnlinePayment } = loadSource('src/lib/payment-actions.ts', {
    '@/db': { db: mockDb },
    '@/db/schema': {
      bookings: { id: Symbol('id'), referenceCode: Symbol('referenceCode') },
    },
    'drizzle-orm': { eq: () => {} },
    'next/cache': { revalidatePath: (p) => { revalidatedPaths.push(p); } },
    '@/lib/auth': { auth: { api: { getSession: async () => ({ user: { role: 'admin' } }) } } },
    'next/headers': { headers: async () => new Headers() },
  });

  const res = await processBookingOnlinePayment(
    '01923456-7890-7abc-def0-1234567890ab',
    1000,
    'deposit',
    'YAS-BK-123'
  );

  assert.equal(res.success, true);
  assert.equal(res.paymentStatus, 'deposit_paid');
  assert.ok(res.transactionId.startsWith('TXN_YAS_'));
  assert.equal(updatedValues.paymentStatus, 'deposit_paid');
  assert.equal(updatedValues.paymentReference, res.transactionId);
  assert.ok(revalidatedPaths.includes('/admin/bookings'));
});

test('processBookingOnlinePayment rejects missing reference and invalid amount', async () => {
  const { processBookingOnlinePayment } = loadSource('src/lib/payment-actions.ts', {
    '@/db': { db: {} },
    '@/db/schema': { bookings: {} },
    'drizzle-orm': { eq: () => {} },
    'next/cache': { revalidatePath: () => {} },
    '@/lib/auth': { auth: { api: { getSession: async () => ({ user: { role: 'admin' } }) } } },
    'next/headers': { headers: async () => new Headers() },
  });

  const resMissing = await processBookingOnlinePayment('', 500, 'full', '');
  assert.equal(resMissing.success, false);
  assert.match(resMissing.error, /booking reference is required/i);

  const resAmount = await processBookingOnlinePayment('valid-id', 0, 'full', 'REF-1');
  assert.equal(resAmount.success, false);
  assert.match(resAmount.error, /invalid payment amount/i);
});

function bankTransferFixture({ userId = 'owner', paymentStatus = 'unpaid', session = { user: { id: 'owner' } }, concurrentPayment = false, exists = true, databaseUrl = 'postgresql://test:local@localhost/db' } = {}) {
  const booking = { id: '01923456-7890-7abc-def0-1234567890ab', referenceCode: 'YAS-BK-123', userId, paymentStatus, paymentReference: 'original' };
  const paths = [];
  let queries = 0;
  const matches = (conditions) => conditions.every(([column, value]) => booking[column] === value);
  const { markBookingBankTransferPending } = loadSource('src/lib/payment-actions.ts', {
    '@/db': { db: {
      query: { bookings: { findFirst: async ({ where }) => {
        queries++;
        const result = exists && matches(where) ? { ...booking } : undefined;
        if (concurrentPayment) booking.paymentStatus = 'paid';
        return result;
      } } },
      update: () => ({ set: (values) => ({ where: (conditions) => ({ returning: async () => {
        if (!matches(conditions)) return [];
        Object.assign(booking, values);
        return [{ id: booking.id }];
      } }) }) }),
    } },
    '@/db/schema': { bookings: Object.fromEntries(Object.keys(booking).map((key) => [key, key])) },
    'drizzle-orm': { eq: (column, value) => [column, value], and: (...conditions) => conditions },
    'next/cache': { revalidatePath: (p) => paths.push(p) },
    '@/lib/auth': { auth: { api: { getSession: async () => session } } },
    'next/headers': { headers: async () => new Headers() },
  }, { process: { env: { DATABASE_URL: databaseUrl } } });
  return { action: markBookingBankTransferPending, booking, paths, queries: () => queries };
}

test('bank transfer requires authentication before querying bookings', async () => {
  const fixture = bankTransferFixture({ session: null });
  assert.equal((await fixture.action('', 'YAS-BK-123')).success, false);
  assert.equal(fixture.queries(), 0);
  assert.equal(fixture.booking.paymentReference, 'original');
});

for (const options of [{ userId: 'another-user' }, { userId: null }, { exists: false }, { databaseUrl: '' }]) {
  test(`bank transfer rejects inaccessible bookings: ${JSON.stringify(options)}`, async () => {
    const fixture = bankTransferFixture(options);
    assert.equal((await fixture.action(fixture.booking.id, '')).success, false);
    assert.equal(fixture.booking.paymentReference, 'original');
    assert.equal(fixture.paths.length, 0);
  });
}

for (const status of ['paid', 'deposit_paid', 'refunded', 'pending']) {
  test(`bank transfer preserves ${status} payment state and reference`, async () => {
    const fixture = bankTransferFixture({ paymentStatus: status });
    assert.equal((await fixture.action('', 'YAS-BK-123')).success, false);
    assert.equal(fixture.booking.paymentStatus, status);
    assert.equal(fixture.booking.paymentReference, 'original');
    assert.equal(fixture.paths.length, 0);
  });
}

test('bank transfer does not overwrite a payment completed after lookup', async () => {
  const fixture = bankTransferFixture({ concurrentPayment: true });
  assert.equal((await fixture.action('', 'YAS-BK-123')).success, false);
  assert.equal(fixture.booking.paymentStatus, 'paid');
  assert.equal(fixture.booking.paymentReference, 'original');
});

for (const lookup of ['id', 'reference', 'reference-as-id']) {
  test(`bank transfer records an owned unpaid booking by ${lookup}`, async () => {
    const fixture = bankTransferFixture();
    const id = lookup === 'id' ? fixture.booking.id : lookup === 'reference-as-id' ? 'YAS-BK-123' : '';
    assert.equal((await fixture.action(id, lookup === 'reference' ? 'YAS-BK-123' : '')).success, true);
    assert.equal(fixture.booking.paymentStatus, 'unpaid');
    assert.match(fixture.booking.paymentReference, /^WIRE_PENDING_/);
    assert.equal(fixture.paths.length, 3);
  });
}

test('bank transfer rejects an absent booking identifier', async () => {
  const fixture = bankTransferFixture();
  assert.equal((await fixture.action('', '')).success, false);
  assert.equal(fixture.queries(), 0);
});
