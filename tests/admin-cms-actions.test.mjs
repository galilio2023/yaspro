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
