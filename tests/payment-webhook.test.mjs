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
    json: async () => ({
      event: 'payment.completed',
      referenceCode: 'YAS-BK-999',
      paymentReference: 'PAY-STRIPE-777',
      customerEmail: 'producer@dubaimedia.ae',
    }),
  };

  const response = await POST(request);
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.paymentStatus, 'paid');
  assert.equal(response.body.status, 'confirmed');

  assert.equal(updatedBooking.paymentStatus, 'paid');
  assert.equal(updatedBooking.status, 'confirmed');
  assert.equal(updatedBooking.paymentReference, 'PAY-STRIPE-777');

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
    json: async () => ({}),
  };

  const response = await POST(request);
  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.match(response.body.error, /missing event identifier/i);
});
