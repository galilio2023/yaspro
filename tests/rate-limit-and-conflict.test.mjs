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

test('checkRateLimit permits requests up to maxRequests and blocks subsequent ones', () => {
  const { checkRateLimit, resetRateLimitStore } = loadSource('src/lib/rate-limit.ts');
  resetRateLimitStore();

  const key = 'test-ip-client-1';
  // Allow 3 requests in 1000ms
  const r1 = checkRateLimit(key, 3, 1000);
  assert.equal(r1.allowed, true);
  assert.equal(r1.remaining, 2);

  const r2 = checkRateLimit(key, 3, 1000);
  assert.equal(r2.allowed, true);
  assert.equal(r2.remaining, 1);

  const r3 = checkRateLimit(key, 3, 1000);
  assert.equal(r3.allowed, true);
  assert.equal(r3.remaining, 0);

  // 4th request must be rejected
  const r4 = checkRateLimit(key, 3, 1000);
  assert.equal(r4.allowed, false);
  assert.equal(r4.remaining, 0);
  assert.ok(r4.resetInMs > 0);
});

test('checkIdempotency rejects duplicate submissions within cooldown period', () => {
  const { checkIdempotency, resetRateLimitStore } = loadSource('src/lib/rate-limit.ts');
  resetRateLimitStore();

  const idempotencyKey = 'booking:director@production.ae:studio-a:2026-10-15T10:00';

  // First submission is allowed
  assert.equal(checkIdempotency(idempotencyKey, 60_000), true);

  // Immediate retry within 60s is blocked as duplicate
  assert.equal(checkIdempotency(idempotencyKey, 60_000), false);

  // Different key is allowed
  const differentKey = 'booking:producer@other.ae:studio-b:2026-10-15T14:00';
  assert.equal(checkIdempotency(differentKey, 60_000), true);
});

test('createBooking rejects studio double-booking when schedule overlaps', async () => {
  const existingBookedStart = new Date('2026-10-15T14:00:00Z');
  const existingDurationHours = 4; // 14:00 to 18:00

  const mockExistingBooking = {
    id: 'booked-uuid-1',
    scheduledAt: existingBookedStart,
    durationHours: existingDurationHours,
    status: 'confirmed',
  };

  const mockDb = {
    query: {
      studios: {
        findFirst: async () => ({ id: 'studio-a-uuid', name: 'Studio A - Virtual Stage', slug: 'studio-a' }),
      },
    },
    select: () => ({
      from: () => ({
        where: () => Promise.resolve([mockExistingBooking]),
      }),
    }),
    insert: () => ({
      values: () => ({
        onConflictDoUpdate: () => ({
          returning: () => Promise.resolve([{ id: 'usr-1' }]),
        }),
        returning: () => Promise.resolve([{ id: 'booking-new' }]),
      }),
    }),
  };

  const rateLimitMod = loadSource('src/lib/rate-limit.ts');
  rateLimitMod.resetRateLimitStore();

  const validations = loadSource('src/lib/validations.ts');

  const { createBooking } = loadSource('src/lib/actions.ts', {
    '@/db': { db: mockDb },
    '@/db/schema': {
      bookings: { id: Symbol('id'), studioId: Symbol('studioId'), status: Symbol('status'), scheduledAt: Symbol('scheduledAt') },
      studios: { id: Symbol('id'), slug: Symbol('slug') },
      users: { id: Symbol('id'), email: Symbol('email') },
      inquiries: {},
      enterpriseRfps: {},
    },
    'drizzle-orm': { eq: () => {}, and: () => {}, inArray: () => {} },
    'next/cache': { revalidatePath: () => {} },
    '@/lib/utils': { generateBookingReference: () => 'YAS-123456' },
    '@/features/booking/constants': {
      STUDIOS: [{ id: 'studio-a', name: 'Studio A', rate: 1000 }],
      STUDIO_GEAR_PACKAGES: [],
    },
    './validations': validations,
    '@/lib/rate-limit': rateLimitMod,
    'next/headers': { headers: async () => new Headers() },
    '@/lib/auth': { auth: { api: { getSession: async () => null } } },
    '@/lib/notifications': {
      sendBookingConfirmationNotification: async () => {},
      sendInquiryNotification: async () => {},
    },
  });

  // Attempt to book overlapping time: 15:00 to 17:00 (inside 14:00 to 18:00 window)
  const overlappingInput = {
    firstName: 'Tariq',
    lastName: 'Mansoor',
    email: 'tariq@filmmaker.ae',
    phone: '+971501112233',
    company: 'Film UAE',
    studioId: 'studio-a',
    sessionType: 'video_production',
    scheduledAt: '2026-10-15T15:00:00Z',
    durationHours: 2,
    headcount: 5,
  };

  const result = await createBooking(overlappingInput);
  assert.equal(result.success, false);
  assert.match(result.message, /already reserved during your selected time window/i);
});
