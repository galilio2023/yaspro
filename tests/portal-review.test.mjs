import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';

const loadDependency = createRequire(import.meta.url);
function loadSource(file, mocks) {
  const { outputText } = ts.transpileModule(
    fs.readFileSync(path.join(import.meta.dirname, '..', file), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } },
  );
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : loadDependency(name),
    console: { error() {} },
    process: { env: { DATABASE_URL: 'postgresql://test:local@localhost/portal' } },
  });
  return exports;
}

const authMocks = (user) => ({
  '@/lib/auth': { auth: { api: { getSession: async () => user ? { user } : null } } },
  'next/headers': { headers: async () => new Headers() },
});
const rfp = {
  referenceCode: 'EXP-1234-DXB', userId: 'owner', workEmail: ' Owner@Example.com ',
  organizationName: 'Example Organization', createdAt: new Date(),
};

async function lookupAs(user) {
  const { lookupEnterpriseRfp } = loadSource('src/lib/portal-actions.ts', {
    ...authMocks(user),
    '@/db': { db: { query: { enterpriseRfps: { findFirst: async () => rfp } } } },
    '@/db/schema': { enterpriseRfps: { referenceCode: 'referenceCode' } },
    'drizzle-orm': { eq() {} },
  });
  return lookupEnterpriseRfp('EXP-1234-DXB');
}

test('RFP ownership rejects an unverified matching email and an editable matching company', async () => {
  for (const user of [
    { id: 'other', email: 'owner@example.com', emailVerified: false },
    { id: 'other', email: 'owner@example.com' },
    { id: 'other', email: 'other@example.com', emailVerified: true, company: 'Example Organization', role: 'enterprise' },
  ]) {
    const result = await lookupAs(user);
    assert.equal(result.found, false);
    assert.equal(result.rfp, undefined);
    assert.match(result.message, /access denied/i);
  }
});

test('RFP ownership preserves the user ID, verified email, and admin access paths', async () => {
  for (const user of [
    { id: 'owner', email: 'changed@example.com', emailVerified: false },
    { id: 'other', email: 'OWNER@example.com', emailVerified: true },
    { id: 'other', email: 'other@example.com', emailVerified: false, role: 'admin' },
  ]) {
    const result = await lookupAs(user);
    assert.equal(result.found, true);
    assert.equal(result.rfp.referenceCode, rfp.referenceCode);
  }
  assert.equal((await lookupAs(null)).found, false);
});

function profileHarness() {
  const updates = [];
  const revalidated = [];
  const { syncUserProfile } = loadSource('src/lib/actions.ts', {
    ...authMocks({ id: 'owner' }),
    '@/db': { db: { update: () => ({ set: (payload) => ({ where: async () => { updates.push(payload); } }) }) } },
    '@/db/schema': { users: { id: 'id' } },
    'drizzle-orm': { eq() {} },
    'next/cache': { revalidatePath: (route) => revalidated.push(route) },
    '@/lib/utils': {}, '@/lib/rate-limit': {}, '@/lib/notifications': {},
    './validations': {}, '@/features/booking/constants': {},
  });
  return { syncUserProfile, updates, revalidated };
}

test('empty or whitespace-only names fail before updating or revalidating the profile', async () => {
  for (const name of ['', '  \t\n ']) {
    const h = profileHarness();
    const result = await h.syncUserProfile({ name, phone: '+971500000000', company: 'Example Organization' });
    assert.equal(result.success, false);
    assert.match(result.message, /name/i);
    assert.equal(h.updates.length, 0);
    assert.equal(h.revalidated.length, 0);
  }
});

test('profile updates keep trimmed names non-null and allow phone/company-only updates', async () => {
  const h = profileHarness();
  assert.equal((await h.syncUserProfile({ name: '  Owner  ', phone: ' +971500000000 ', company: ' Example ' })).success, true);
  assert.equal(h.updates[0].name, 'Owner');
  assert.equal(h.updates[0].phone, '+971500000000');
  assert.equal(h.updates[0].company, 'Example');
  assert.equal((await h.syncUserProfile({ phone: ' ', company: '' })).success, true);
  assert.equal(Object.hasOwn(h.updates[1], 'name'), false);
  assert.equal(h.updates[1].phone, null);
  assert.equal(h.updates[1].company, null);
});

async function invoiceMarkup(bookings) {
  const { default: InvoicesPage } = loadSource('src/app/(portal)/portal/invoices/page.tsx', {
    ...authMocks({ id: 'owner' }),
    '@/lib/cms-actions': { getClientBookings: async () => bookings },
    'next/navigation': { redirect() { throw new Error('Unexpected redirect'); } },
    'next/link': { default: 'a' },
  });
  return renderToStaticMarkup(await InvoicesPage());
}
const booking = (paymentStatus, totalAmount) => ({
  id: paymentStatus, referenceCode: paymentStatus, paymentStatus,
  totalAmount, currency: 'AED', scheduledAt: null,
});

test('billing summaries disclose missing deposit amounts and show only known totals', async () => {
  const markup = await invoiceMarkup([
    booking('paid', '100'), booking('unpaid', '80'), booking('deposit_paid', '200'),
  ]);
  assert.match(markup, /Known Paid/);
  assert.match(markup, /Known Outstanding/);
  assert.match(markup, /100 AED/);
  assert.match(markup, /80 AED/);
  assert.match(markup, /summaries are incomplete/);
  assert.match(markup, /exclude those bookings/);
  assert.match(markup, /Deposit Paid/);
});

test('billing summaries remain complete when there are no deposit-paid bookings', async () => {
  const markup = await invoiceMarkup([booking('paid', '100'), booking('unpaid', '80')]);
  assert.match(markup, /Total Paid/);
  assert.doesNotMatch(markup, /summaries are incomplete|Known Paid|Known Outstanding/);
});
