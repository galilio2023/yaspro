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
