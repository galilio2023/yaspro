import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';
const dependency = createRequire(import.meta.url);
function load(file, mocks = {}, env = {}, globals = {}) {
  const exports = {};
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  vm.runInNewContext(outputText, { exports, Buffer, require: (name) => name in mocks ? mocks[name] : dependency(name),
    process: { env }, console: { error() {} }, ...globals });
  return exports;
}

test('guest capability is signed, booking bound, expiring and stored in an HttpOnly cookie', async () => {
  const jar = new Map();
  let time = Date.now();
  const capability = load('src/lib/booking-payment-capability.ts', {
    'server-only': {}, '@/lib/deployment-environment': {},
    'next/headers': { cookies: async () => ({ set: (key, value, options) => jar.set(key, { value, options }), get: (key) => jar.get(key) }) },
  }, { NODE_ENV: 'production', BETTER_AUTH_SECRET: 'synthetic-secret-for-capability-tests' }, { Date: { now: () => time } });
  assert.equal(await capability.hasBookingPaymentCapability('one'), false);
  await capability.issueBookingPaymentCapability('one');
  assert.equal(await capability.hasBookingPaymentCapability('one'), true);
  const cookie = jar.get('booking-payment-one');
  assert.equal(cookie.options.httpOnly, true);
  assert.equal(cookie.options.secure, true);
  assert.equal(cookie.options.sameSite, 'strict');
  jar.set('booking-payment-two', cookie);
  assert.equal(await capability.hasBookingPaymentCapability('two'), false);
  jar.set('booking-payment-one', { value: cookie.value + '0' });
  assert.equal(await capability.hasBookingPaymentCapability('one'), false);
  jar.set('booking-payment-one', cookie);
  time += 86400001;
  assert.equal(await capability.hasBookingPaymentCapability('one'), false);
});

test('inquiry escapes all submitted HTML values and preserves N/A fallbacks', async () => {
  let payload;
  const { sendInquiryNotification } = load('src/lib/notifications.ts', {}, { RESEND_API_KEY: 'synthetic-key' }, {
    fetch: async (_url, options) => { payload = JSON.parse(options.body); return { ok: true }; },
  });
  const malicious = `<img src="x" onerror='bad()'>&`;
  const inquiry = Object.fromEntries(['name', 'email', 'phone', 'company', 'inquiryType', 'message'].map(key => [key, malicious]));
  assert.equal((await sendInquiryNotification(inquiry)).sent, true);
  assert.equal(payload.html.includes('<img'), false);
  assert.equal((payload.html.match(/&lt;img src=&quot;x&quot; onerror=&#39;bad\(\)&#39;&gt;&amp;/g) || []).length, 6);
  await sendInquiryNotification({ ...inquiry, phone: null, company: '' });
  assert.equal((payload.html.match(/N\/A/g) || []).length, 2);
});

for (const mode of ['http', 'exception', 'unconfigured']) {
  test(`inquiry delivery reports ${mode} honestly`, async () => {
    const errors = [];
    const { sendInquiryNotification } = load('src/lib/notifications.ts', {}, mode === 'unconfigured' ? {} : { RESEND_API_KEY: 'synthetic-key' }, {
      console: { error: (...args) => errors.push(args.join(' ')) },
      fetch: async () => { if (mode === 'exception') throw new Error('offline'); return { ok: false, status: 429, text: async () => 'quota exceeded' }; },
    });
    const result = await sendInquiryNotification({ name: 'Test', email: 'test@example.test', inquiryType: 'general', message: 'hello' });
    assert.equal(result.sent, mode === 'unconfigured');
    assert.equal(result.channel, mode === 'unconfigured' ? 'log' : 'email');
    if (mode === 'http') assert.match(errors[0], /429.*quota exceeded/);
  });
}

test('production auth fails closed except during build; development has its own fallback', () => {
  const mocks = { '@/lib/deployment-environment': {}, 'better-auth': { betterAuth: config => config },
    'better-auth/adapters/drizzle': { drizzleAdapter: () => ({}) }, '@/db': {}, '@/db/schema': {} };
  assert.throws(() => load('src/lib/auth.ts', mocks, { NODE_ENV: 'production' }), /BETTER_AUTH_SECRET/);
  assert.match(load('src/lib/auth.ts', mocks, { NODE_ENV: 'production', NEXT_PHASE: 'phase-production-build' }).auth.secret, /build-phase/);
  assert.match(load('src/lib/auth.ts', mocks, { NODE_ENV: 'development' }).auth.secret, /dev-secret/);
  assert.equal(load('src/lib/auth.ts', mocks, { NODE_ENV: 'production', BETTER_AUTH_SECRET: 'synthetic-live-secret' }).auth.secret, 'synthetic-live-secret');
});

test('preview credentials fail closed and override inherited deployment defaults', () => {
  const apply = env => load('src/lib/deployment-environment.ts', { 'server-only': {} }, env);
  assert.throws(() => apply({ VERCEL_ENV: 'preview', DATABASE_URL: 'production', BETTER_AUTH_SECRET: 'production-secret' }), /Preview requires/);
  assert.throws(() => apply({ VERCEL_ENV: 'preview', DATABASE_URL: 'same', PREVIEW_DATABASE_URL: 'same', PREVIEW_BETTER_AUTH_SECRET: 'new' }), /must differ/);
  const env = { VERCEL_ENV: 'preview', DATABASE_URL: 'production', BETTER_AUTH_SECRET: 'production-secret', PREVIEW_DATABASE_URL: 'preview', PREVIEW_BETTER_AUTH_SECRET: 'preview-secret' };
  apply(env);
  assert.equal(env.DATABASE_URL, 'preview');
  assert.equal(env.BETTER_AUTH_SECRET, 'preview-secret');
});

test('production metrics fallback is unavailable and dashboard hides its numbers', async () => {
  const { getCmsOverviewStats } = load('src/lib/actions/metrics-overview.ts', {
    '@/db': {}, '@/db/schema': {}, './shared': { requireAdmin: async () => {}, isDbAvailable: () => false },
    '@/features/projects/data': { PROJECTS_DATA: [1] }, '@/features/influencers/data': { INFLUENCERS_DATA: [1] },
    '@/features/gear/data': { GEAR_DATA: [1] }, '@/features/booking/constants': { STUDIOS: [1] },
  }, { NODE_ENV: 'production' });
  const stats = await getCmsOverviewStats();
  assert.equal(stats.status, 'unavailable');
  const { default: Page } = load('src/app/(admin)/admin/page.tsx', {
    '@/lib/cms-actions': { getCmsOverviewStats: async () => ({ ...stats, totalUsers: 1234567 }) },
    '@/lib/utils': { cn: (...args) => args.filter(Boolean).join(' '), formatCurrency: (v) => `${v} SAR` },
    'next/link': { default: ({ children, ...props }) => dependency('react').createElement('a', props, children) },
  });
  const html = renderToStaticMarkup(await Page());
  assert.match(html, /role="status"/);
  assert.match(html, /Current metrics are unavailable/);
  assert.equal(html.includes('1234567'), false);
});

test('database transaction adapter commits or rolls back and closes its connection', async () => {
  const { Pool: ActualPool } = dependency('@neondatabase/serverless');
  for (const fail of [false, true]) {
    const statements = [];
    let closed = false;
    class TestPool extends ActualPool {
      async connect() {
        return { query: async (query) => { statements.push((query.text || query).trim()); return { rows: [] }; }, release() {} };
      }
      async end() { closed = true; }
    }
    const { db } = load('src/db/index.ts', {
      'server-only': {}, '@/lib/deployment-environment': {}, './schema': {},
      '@neondatabase/serverless': { Pool: TestPool },
    }, { DATABASE_URL: 'postgresql://test:local@localhost/db' });
    const result = db.transaction(async (tx) => {
      await tx.execute(dependency('drizzle-orm').sql`select 1`);
      if (fail) throw new Error('write failed');
    });
    if (fail) await assert.rejects(result, /write failed/); else await result;
    assert.deepEqual(statements, ['begin', 'select 1', fail ? 'rollback' : 'commit']);
    assert.equal(closed, true);
  }
});
