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
    process: { env: { DATABASE_URL: 'postgresql://test:local@localhost/db' } },
    ...globals,
  });
  return exports;
}

test('POST /api/webhooks/production handles payment.completed and reconciles booking', async () => {
  let updatedBooking = null;
  let notificationDispatched = null;

  const mockDb = {
    query: {
      bookings: {
        findFirst: async () => ({
          id: 'booking-uuid-123',
          referenceCode: 'YAS-BK-999',
          totalAmount: '2400.00',
          paymentStatus: 'unpaid',
          status: 'pending',
          paymentReference: 'intent-777',
          paymentIntent: { depositPercent: 50, amountFils: 240000, targetStatus: 'paid' },
          currency: 'AED',
          scheduledAt: new Date('2026-10-01T10:00:00Z'),
          durationHours: 3,
          sessionType: 'video_production',
          propsNotes: null,
          specialRequests: null,
          user: { email: 'producer@dubaimedia.ae' },
        }),
      },
    },
    update: () => ({
      set: (data) => {
        updatedBooking = data;
        return {
          where: () => Promise.resolve(),
        };
      },
    }),
  };

  const { POST } = loadSource('src/app/api/webhooks/production/route.ts', {
    '@/db': { db: mockDb },
    '@/db/schema': {
      bookings: { id: Symbol('id'), referenceCode: Symbol('referenceCode') },
      users: {},
    },
    'drizzle-orm': {
      eq: () => {},
      or: () => {},
    },
    'next/cache': {
      revalidatePath: () => {},
      updateTag: () => {},
    },
    'next/server': {
      NextResponse: {
        json: (body, init) => ({
          body,
          status: init?.status || 200,
          json: async () => body,
        }),
      },
    },
    '@/lib/notifications': {
      sendBookingConfirmationNotification: async (booking, email) => {
        notificationDispatched = { booking, email };
        return { sent: true, channel: 'log', recipient: email, subject: 'call-sheet' };
      },
    },
  });

  const request = {
    text: async () => JSON.stringify({
      event: 'payment_intent.status.updated',
      data: { id: 'intent-777', amount: 240000, currency_code: 'AED', status: 'completed' },
    }),
    headers: {
      get: () => null,
    },
  };

  const response = await POST(request);
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.paymentStatus, 'paid');
  assert.equal(response.body.status, 'confirmed');

  assert.equal(updatedBooking.paymentStatus, 'paid');
  assert.equal(updatedBooking.status, 'confirmed');
  assert.equal(updatedBooking.paymentReference, 'intent-777');

  assert.ok(notificationDispatched);
  assert.equal(notificationDispatched.email, 'producer@dubaimedia.ae');
  assert.equal(notificationDispatched.booking.referenceCode, 'YAS-BK-999');
});

test('POST /api/webhooks/production rejects missing event identifier', async () => {
  const { POST } = loadSource('src/app/api/webhooks/production/route.ts', {
    '@/db': { db: {} },
    '@/db/schema': { bookings: {}, users: {} },
    'drizzle-orm': { eq: () => {}, or: () => {} },
    'next/cache': { revalidatePath: () => {}, updateTag: () => {} },
    'next/server': {
      NextResponse: {
        json: (body, init) => ({ body, status: init?.status || 200 }),
      },
    },
    '@/lib/notifications': {
      sendBookingConfirmationNotification: async () => {},
    },
  });

  const request = {
    text: async () => JSON.stringify({}),
    headers: {
      get: () => null,
    },
  };

  const response = await POST(request);
  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.match(response.body.error, /missing event identifier/i);
});

test('POST /api/webhooks/production does NOT confirm when the paid amount mismatches', async () => {
  let updated = false;
  const mockDb = {
    query: { bookings: { findFirst: async () => ({
      id: 'b1', referenceCode: 'YAS-X', totalAmount: '2400.00', paymentStatus: 'unpaid', status: 'pending',
      paymentReference: 'intent-1', paymentIntent: { depositPercent: 50, amountFils: 240000, targetStatus: 'paid' }, user: { email: 'a@b.c' },
    }) } },
    update: () => { updated = true; return { set: () => ({ where: () => Promise.resolve() }) }; },
  };
  const { POST } = loadSource('src/app/api/webhooks/production/route.ts', {
    '@/db': { db: mockDb },
    '@/db/schema': { bookings: { id: Symbol('id'), paymentReference: Symbol('pr') }, users: {} },
    'drizzle-orm': { eq: () => {}, or: () => {} },
    'next/cache': { revalidatePath: () => {}, updateTag: () => {} },
    'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status || 200 }) } },
    '@/lib/notifications': { sendBookingConfirmationNotification: async () => {} },
  });
  const res = await POST({
    text: async () => JSON.stringify({ event: 'payment_intent.status.updated', data: { id: 'intent-1', amount: 100, currency_code: 'AED', status: 'completed' } }),
    headers: { get: () => null },
  });
  assert.equal(res.status, 422);
  assert.equal(updated, false);
});

test('POST /api/webhooks/production ignores non-completed payment statuses', async () => {
  const { POST } = loadSource('src/app/api/webhooks/production/route.ts', {
    '@/db': { db: {} },
    '@/db/schema': { bookings: {}, users: {} },
    'drizzle-orm': { eq: () => {}, or: () => {} },
    'next/cache': { revalidatePath: () => {}, updateTag: () => {} },
    'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status || 200 }) } },
    '@/lib/notifications': { sendBookingConfirmationNotification: async () => {} },
  });
  const res = await POST({
    text: async () => JSON.stringify({ event: 'payment_intent.status.updated', data: { id: 'i', status: 'pending' } }),
    headers: { get: () => null },
  });
  assert.equal(res.body.status, 'ignored_non_completed');
});

test('webhook metadata cannot reconcile an intent absent from stored paymentReference', async () => {
  let query;
  const { POST } = loadSource('src/app/api/webhooks/production/route.ts', {
    '@/db': { db: { query: { bookings: { findFirst: async ({ where }) => { query = where; return null; } } }, update: () => assert.fail('Unexpected write') } },
    '@/db/schema': { bookings: { id: 'id', paymentReference: 'paymentReference' } },
    'drizzle-orm': { eq: (column, value) => ({ column, value }), or: (...conditions) => ({ conditions }) },
    'next/cache': {},
    'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status || 200 }) } },
    '@/lib/notifications': { sendBookingConfirmationNotification: () => assert.fail('Unexpected notification') },
  });
  const response = await POST({ headers: { get: () => null }, text: async () => JSON.stringify({
    event: 'payment_intent.status.updated', data: { id: 'unrelated-intent', status: 'completed', metadata: { bookingId: 'victim-booking' }, amount: 240000 },
  }) });
  assert.equal(response.status, 404);
  assert.deepEqual(query, { column: 'paymentReference', value: 'unrelated-intent' });
});


for (const [status, targetStatus, amount, expectedStatus] of [
  ['unpaid', 'deposit_paid', 60000, 200],
  ['unpaid', 'deposit_paid', 120000, 422],
  ['deposit_paid', 'paid', 180000, 200],
  ['deposit_paid', 'paid', 120000, 422],
  ['unpaid', 'paid', 240000, 200],
]) {
  test(`webhook honors stored 25% terms after settings change: ${status} ${amount}`, async () => {
    const row = { id: 'booking', referenceCode: 'REF', totalAmount: '2400', status: 'confirmed',
      paymentStatus: status, paymentReference: 'intent', user: null,
      paymentIntent: { depositPercent: 25, targetStatus, amountFils: targetStatus === 'deposit_paid' ? 60000 : status === 'deposit_paid' ? 180000 : 240000 },
    };
    let writes = 0;
    const { POST } = loadSource('src/app/api/webhooks/production/route.ts', {
      '@/db': { db: {
        query: { bookings: { findFirst: async () => row }, platformSettings: { findFirst: () => assert.fail('Current settings must not be read') } },
        update: () => ({ set: (values) => ({ where: async () => { writes++; Object.assign(row, values); } }) }),
      } },
      '@/db/schema': { bookings: { id: 'id', paymentReference: 'reference' } },
      'next/cache': { revalidatePath() {}, updateTag() {} },
      'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status || 200 }) } },
      '@/lib/notifications': { sendBookingConfirmationNotification() {} },
    });
    const request = { headers: { get: () => null }, text: async () => JSON.stringify({
      event: 'payment_intent.status.updated', data: { id: 'intent', status: 'completed', currency_code: 'AED', amount },
    }) };
    assert.equal((await POST(request)).status, expectedStatus);
    assert.equal(writes, expectedStatus === 200 ? 1 : 0);
    if (expectedStatus === 200) {
      assert.equal(row.paymentStatus, targetStatus);
      assert.equal((await POST(request)).body.status, 'already_reconciled');
      assert.equal(writes, 1);
    }
  });
}
