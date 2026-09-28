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

test('createZiinaPaymentIntent generates authenticated UAE transaction when simulation is enabled', async () => {
  let updatedBooking = null;

  const mockDb = {
    update: () => ({
      set: (data) => {
        updatedBooking = data;
        return {
          where: () => Promise.resolve(),
        };
      },
    }),
  };

  const { createZiinaPaymentIntent } = loadSource('src/lib/ziina.ts', {
    '@/db': { db: mockDb },
    '@/db/schema': {
      bookings: { id: Symbol('id'), referenceCode: Symbol('referenceCode') },
    },
    'drizzle-orm': { eq: () => {} },
    'next/cache': {
      revalidatePath: () => {},
      updateTag: () => {},
    },
  });

  const res = await createZiinaPaymentIntent(
    'booking-uuid-777',
    1200,
    'deposit',
    'YAS-BK-777'
  );

  assert.equal(res.success, true);
  assert.equal(res.paymentStatus, 'deposit_paid');
  assert.ok(res.transactionId.startsWith('ZIINA_SIM_'));
  assert.equal(updatedBooking.paymentStatus, 'deposit_paid');
  assert.equal(updatedBooking.paymentReference, res.transactionId);
});

test('createZiinaPaymentIntent returns error and does NOT update database in production without key', async () => {
  let dbUpdateCalled = false;

  const mockDb = {
    update: () => {
      dbUpdateCalled = true;
      return { set: () => ({ where: () => Promise.resolve() }) };
    },
  };

  const { createZiinaPaymentIntent } = loadSource(
    'src/lib/ziina.ts',
    {
      '@/db': { db: mockDb },
      '@/db/schema': { bookings: { id: Symbol('id'), referenceCode: Symbol('referenceCode') } },
      'drizzle-orm': { eq: () => {} },
      'next/cache': { revalidatePath: () => {}, updateTag: () => {} },
    },
    {
      process: { env: { NODE_ENV: 'production', DATABASE_URL: 'postgresql://real@host/db' } },
    }
  );

  const res = await createZiinaPaymentIntent('booking-123', 500, 'full', 'YAS-BK-123');
  assert.equal(res.success, false);
  assert.match(res.error, /configuration is missing/i);
  assert.equal(dbUpdateCalled, false);
});
