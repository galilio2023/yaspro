import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
function sourceLoader(mocks = {}, globals = {}) {
  const cache = new Map();
  function load(file) {
    if (!fs.existsSync(file) && file.endsWith('.ts')) file += 'x';
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file);
    const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    });
    const exports = {};
    cache.set(file, exports);
    vm.runInNewContext(outputText, {
      exports, Date, process: { env: {} }, console: { error() {}, warn() {} },
      require: (name) => {
        if (Object.hasOwn(mocks, name)) return mocks[name];
        if (name === 'server-only') return {};
        if (name.startsWith('.')) return load(path.resolve(path.dirname(file), `${name}.ts`));
        if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`);
        return require(name);
      },
      ...globals,
    });
    return exports;
  }
  return load;
}
const NOW = Date.parse('2026-10-14T21:00:00Z'); // Already Thursday in Dubai.
class FixtureDate extends Date {
  constructor(...args) { super(...(args.length ? args : [NOW])); }
  static now() { return NOW; }
}
const input = {
  offerId: '5-hour-bundles', date: '2026-10-19', timeSlot: '9:00 AM',
  firstName: 'Test', lastName: 'Guest', email: 'guest@example.com', phone: '+971500000000',
};
function fixture({ failInsert = false, emptyInsert = false, payment = { success: true, paymentUrl: 'https://payments.example.test/pay' }, failCapability = false } = {}) {
  const writes = [], payments = [], capabilities = [], locks = [];
  let counts = 0;
  const tx = {
    execute: async (query) => locks.push(query),
    $count: async (_table, condition) => {
      counts++;
      return writes.filter((booking) => booking.promoCode === condition.value).length;
    },
    insert: () => ({ values: (values) => ({ returning: async () => {
      if (failInsert) throw new Error('Database unavailable');
      if (emptyInsert) return [];
      writes.push(values);
      return [{ id: `booking-${writes.length}` }];
    } }) }),
  };
  let transactionQueue = Promise.resolve();
  const load = sourceLoader({
    '@/db': { db: {
      query: { studios: { findFirst: async () => ({ id: 'studio-id' }) } },
      $count: tx.$count,
      transaction: (callback) => {
        // Model the transaction serialization provided by the advisory lock.
        const transaction = transactionQueue.then(() => callback(tx));
        transactionQueue = transaction.catch(() => {});
        return transaction;
      },
    } },
    '@/db/schema': { bookings: { id: 'id', promoCode: 'promoCode' } },
    'drizzle-orm': { eq: (column, value) => ({ column, value }), sql: (parts, ...params) => ({ parts, params }) },
    '@/lib/booking-payment-capability': { issueBookingPaymentCapability: async (id) => {
      capabilities.push(id);
      if (failCapability) throw new Error('Capability unavailable');
    } },
    '@/lib/ziina': { createZiinaPaymentIntent: async (...args) => {
      payments.push(args);
      if (payment instanceof Error) throw payment;
      return payment;
    } },
  }, { Date: FixtureDate });
  return {
    ...load('src/features/offers/actions.ts'),
    rules: load('src/features/offers/promo-codes.ts').OFFERS_PROMO_CODES,
    offers: load('src/features/offers/data.ts').OFFERS_AND_BUNDLES,
    slots: load('src/features/offers/data.ts').STANDARD_TIME_SLOTS,
    writes, payments, capabilities, locks, get counts() { return counts; },
  };
}

test('offer action rejects invalid dates, past Dubai dates, malformed and unlisted slots before inserting', async () => {
  const f = fixture();
  for (const changes of [
    { date: '' }, { date: '19-10-2026' }, { date: '2026-2-01' }, { date: '2026-02-30' },
    { date: '2026-10-14' }, { date: '2025-10-19' }, { offerId: 'unknown' },
    { timeSlot: '13:00 PM' }, { timeSlot: '0:00 AM' }, { timeSlot: '9:60 AM' },
    { timeSlot: '09:00' }, { timeSlot: '9:00 am' }, { timeSlot: '9:30 AM' },
  ]) {
    assert.equal((await f.submitOffersBooking({ ...input, ...changes, initiatePayment: true })).success, false, JSON.stringify(changes));
  }
  assert.equal(f.writes.length, 0);
  assert.equal(f.payments.length, 0);
  assert.equal((await f.submitOffersBooking({ ...input, date: '2026-10-15' })).success, true);
});

test('server enforces each offer day, slot list, and restricted hour window', async () => {
  const f = fixture();
  for (const changes of [
    { offerId: 'lunch-break-special', date: '2026-10-16', timeSlot: '1:00 PM' },
    { offerId: 'lunch-break-special', timeSlot: '9:00 AM' },
    { offerId: 'student-fund', date: '2026-10-22', timeSlot: '3:00 PM' },
  ]) assert.equal((await f.submitOffersBooking({ ...input, ...changes })).success, false);
  assert.equal(f.writes.length, 0);
  const lunch = f.offers.find((offer) => offer.id === 'lunch-break-special');
  lunch.restrictedHours.slots.push('4:00 PM');
  assert.equal((await f.submitOffersBooking({ ...input, offerId: lunch.id, timeSlot: '4:00 PM' })).success, false);
  assert.equal((await f.submitOffersBooking({ ...input, offerId: lunch.id, timeSlot: '1:30 PM' })).success, true);
  assert.equal(f.writes[0].scheduledAt.toISOString(), '2026-10-19T09:30:00.000Z');
});

test('Dubai scheduling converts AM, PM, noon and midnight and uses a UUID reference', async () => {
  const f = fixture();
  f.slots.push('12:00 AM'); // Synthetic allowed midnight slot exercises the conversion boundary.
  for (const [timeSlot, expected] of [
    ['9:00 AM', '2026-10-19T05:00:00.000Z'], ['5:00 PM', '2026-10-19T13:00:00.000Z'],
    ['12:00 PM', '2026-10-19T08:00:00.000Z'], ['12:00 AM', '2026-10-18T20:00:00.000Z'],
  ]) {
    const result = await f.submitOffersBooking({ ...input, timeSlot });
    assert.equal(result.success, true);
    assert.equal(f.writes.at(-1).scheduledAt.toISOString(), expected);
    assert.match(result.referenceCode, /^YAS-OFR-[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/);
    assert.equal(f.writes.at(-1).status, 'pending');
    assert.equal(f.writes.at(-1).paymentStatus, 'unpaid');
  }
  assert.equal(new Set(f.writes.map((booking) => booking.referenceCode)).size, 4);
});

test('failed or empty inserts return failure without a booking or payment fallback', async () => {
  for (const options of [{ failInsert: true }, { emptyInsert: true }]) {
    const f = fixture(options);
    const result = await f.submitOffersBooking({ ...input, initiatePayment: true, promoCode: 'YAS10' });
    assert.equal(result.success, false);
    assert.equal(result.bookingId, undefined);
    assert.equal(result.referenceCode, undefined);
    assert.equal(f.writes.length, 0);
    assert.equal(f.payments.length, 0);
    assert.equal(f.capabilities.length, 0);
  }
});

test('payment failures preserve the pending booking and surface paymentFailed', async () => {
  for (const options of [
    { payment: { success: false, error: 'Provider unavailable' } }, { payment: { success: true } },
    { payment: new Error('Provider unavailable') }, { failCapability: true },
  ]) {
    const f = fixture(options);
    const result = await f.submitOffersBooking({ ...input, initiatePayment: true });
    assert.equal(result.success, true);
    assert.equal(result.bookingId, 'booking-1');
    assert.equal(result.paymentFailed, true);
    assert.equal(result.paymentUrl, undefined);
    assert.equal(f.writes[0].paymentStatus, 'unpaid');
  }
  const f = fixture();
  const paid = await f.submitOffersBooking({ ...input, initiatePayment: true });
  assert.equal(paid.paymentUrl, 'https://payments.example.test/pay');
  assert.equal(paid.paymentFailed, false);
  assert.deepEqual(f.payments[0].slice(0, 3), ['booking-1', 4410, 'full']);
  const studio = await f.submitOffersBooking(input);
  assert.equal(studio.paymentFailed, false);
  assert.equal(f.payments.length, 1);
});

test('server previews only the entered promo and recomputes discounts at checkout', async () => {
  const f = fixture();
  const preview = await f.validateOffersPromoCode(' yas10 ', input.offerId);
  assert.equal(preview.success, true);
  assert.equal(preview.promo.code, 'YAS10');
  assert.equal(preview.promo.discountPercent, 10);
  assert.equal(preview.promo.VIP50, undefined);
  for (const code of ['invalid', 'constructor', '__proto__']) {
    assert.equal((await f.validateOffersPromoCode(code, input.offerId)).success, false);
    assert.equal((await f.submitOffersBooking({ ...input, promoCode: code })).success, false);
  }
  assert.equal((await f.validateOffersPromoCode('YAS10', 'unknown')).success, false);
  const result = await f.submitOffersBooking({ ...input, promoCode: ' yas10 ' });
  assert.equal(result.totalAmount, 3969);
  assert.equal(f.writes[0].promoCode, 'YAS10');
  assert.equal(f.writes[0].totalAmount, '3969.00');
  f.rules.FIXED = { discountAmount: 10000 };
  assert.equal((await f.submitOffersBooking({ ...input, promoCode: 'FIXED' })).totalAmount, 0);
});

test('server revalidates promo eligibility, expiry, and atomic usage limits before checkout', async () => {
  const f = fixture();
  f.rules.RESTRICTED = { discountPercent: 10, eligibleOfferIds: ['student-fund'] };
  f.rules.EXPIRED = { discountPercent: 10, expiresAt: new Date(NOW).toISOString() };
  f.rules.INVALID_EXPIRY = { discountPercent: 10, expiresAt: 'invalid' };
  f.rules.CAPPED = { discountPercent: 10, maxUses: 1, expiresAt: '2027-01-01T00:00:00+04:00' };
  for (const code of ['RESTRICTED', 'EXPIRED', 'INVALID_EXPIRY']) {
    assert.equal((await f.validateOffersPromoCode(code, input.offerId)).success, false);
    assert.equal((await f.submitOffersBooking({ ...input, promoCode: code })).success, false);
  }
  assert.equal((await f.validateOffersPromoCode('CAPPED', input.offerId)).success, true);
  const results = await Promise.all([1, 2].map(() => f.submitOffersBooking({ ...input, promoCode: 'CAPPED' })));
  assert.equal(results.filter((result) => result.success).length, 1);
  assert.equal(f.writes.length, 1);
  assert.equal((await f.validateOffersPromoCode('CAPPED', input.offerId)).success, false);
  assert.ok(f.counts >= 4);
  assert.ok(f.locks.every((lock) => lock.parts.join('').includes('pg_advisory_xact_lock')));
  assert.equal(f.locks.at(-1).params[0], 'offers-promo:CAPPED');
});

function hookFixture(validate = async (code) => ({ success: true, promo: { code, discountPercent: 10 } })) {
  const states = [];
  let cursor = 0;
  const load = sourceLoader({
    react: {
      useState: (initial) => {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [states[index], (value) => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
      },
      useRef: (initial) => {
        const index = cursor++;
        if (!(index in states)) states[index] = { current: initial };
        return states[index];
      },
      useMemo: (fn) => fn(), useCallback: (fn) => fn, useEffect: (fn) => fn(),
    },
    '../actions': { validateOffersPromoCode: validate, submitOffersBooking: async () => ({ success: true }) },
    'next/navigation': { useSearchParams: () => new URLSearchParams() },
  });
  const { useOffersBooking } = load('src/features/offers/hooks/useOffersBooking.ts');
  return () => { cursor = 0; return useOffersBooking(); };
}

test('offer changes reset scheduling and recalculate percentage or capped fixed discounts', async () => {
  for (const [rule, expected] of [[{ discountPercent: 10 }, 39], [{ discountAmount: 500 }, 390]]) {
    const render = hookFixture(async (code) => ({ success: true, promo: { code, ...rule } }));
    let hook = render();
    await hook.applyPromo(' test ');
    hook = render();
    assert.equal(hook.appliedPromo, 'TEST');
    assert.equal(hook.breakdown.discount, rule.discountPercent ? 420 : 500);
    hook.setDate('2026-10-19');
    hook.setTimeSlot('9:00 AM');
    hook = render();
    hook.setSelectedOfferId('student-fund');
    hook = render();
    assert.equal(hook.date, '');
    assert.equal(hook.timeSlot, '');
    assert.equal(hook.canProceedToStep3, false);
    assert.equal(hook.breakdown.discount, expected);
    hook.removePromo();
    assert.equal(render().breakdown.discount, 0);
  }
});

test('promo validation responses cannot restore a removed promo or apply it to a different offer', async () => {
  let finish;
  const render = hookFixture(() => new Promise((resolve) => { finish = resolve; }));
  let hook = render();
  let pending = hook.applyPromo('YAS10');
  hook.removePromo();
  finish({ success: true, promo: { code: 'YAS10', discountPercent: 10 } });
  await pending;
  assert.equal(render().appliedPromo, null);
  hook = render();
  pending = hook.applyPromo('YAS10');
  hook.setSelectedOfferId('student-fund');
  finish({ success: true, promo: { code: 'YAS10', discountPercent: 10 } });
  await pending;
  assert.equal(render().appliedPromo, null);
});

function uiFixture(isArabic) {
  return sourceLoader({
    '@/components/providers/LanguageProvider': { useLanguage: () => ({ isArabic }) },
    '@/features/booking/components/ui/BookingKit': {
      formatAED: (amount) => `AED ${amount}`, studioSprings: { cinematic: {} },
      Panel: ({ children }) => createElement('section', null, children),
      Field: ({ children }) => createElement('label', null, children),
      StepIntro: () => null,
    },
    'framer-motion': { motion: { div: ({ children, className }) => createElement('div', { className }, children) } },
  });
}

test('terms start unchecked and both checkout buttons require consent', () => {
  const load = uiFixture(false);
  const { Step3Checkout } = load('src/features/offers/components/Step3Checkout.tsx');
  const offer = load('src/features/offers/data.ts').OFFERS_AND_BUNDLES[0];
  const html = renderToStaticMarkup(createElement(Step3Checkout, {
    offer, date: input.date, timeSlot: input.timeSlot, contact: input,
    breakdown: { basePrice: 4200, discount: 0, subtotal: 4200, vatAmount: 210, grandTotal: 4410 },
    promoInput: '', appliedPromo: null,
  }));
  const checkbox = html.match(/<input[^>]*type="checkbox"[^>]*>/)[0];
  assert.doesNotMatch(checkbox, /checked/);
  assert.match(html, /<button[^>]*disabled=""[^>]*>[\s\S]*?Complete &amp; Pay/);
  assert.match(html, /<button[^>]*disabled=""[^>]*>[\s\S]*?Pay at Studio/);
});

test('English and Arabic confirmation copy describes pending bookings and payment fallback', () => {
  for (const isArabic of [false, true]) {
    const { OffersConfirmation } = uiFixture(isArabic)('src/features/offers/components/OffersConfirmation.tsx');
    const props = { referenceCode: 'YAS-OFR-TEST', offerName: 'Test Offer', email: input.email, date: input.date, timeSlot: input.timeSlot };
    const html = renderToStaticMarkup(createElement(OffersConfirmation, props));
    assert.match(html, isArabic ? /قيد التأكيد/ : /Pending Confirmation/);
    assert.doesNotMatch(html, /Reservation Confirmed|Stage is Locked In|call sheet|أرسلنا|تم حجز/);
    const fallback = renderToStaticMarkup(createElement(OffersConfirmation, { ...props, paymentFailed: true }));
    assert.match(fallback, /role="alert"/);
    assert.match(fallback, isArabic ? /يمكنك الدفع في الاستوديو/ : /pay at the studio/);
    assert.doesNotMatch(html, /role="alert"/);
  }
});
