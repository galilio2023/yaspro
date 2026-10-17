import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

const require = createRequire(import.meta.url);
function loadSource(file, mocks = {}, globals = {}) {
  if (!fs.existsSync(file) && file.endsWith(".ts")) file += "x";
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, console: { error() {} }, Date, Error,
    require: (name) => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.endsWith('.json')) {
        const parsed = JSON.parse(fs.readFileSync(path.resolve(path.dirname(file), name), 'utf8'));
        return { default: parsed, ...parsed };
      }
      if (name.startsWith('.')) return loadSource(path.resolve(path.dirname(file), `${name}.ts`), mocks, globals);
      if (name.startsWith('@/')) return loadSource(`src/${name.slice(2)}.ts`, mocks, globals);
      return require(name);
    },
    process: { env: { DATABASE_URL: 'postgresql://synthetic/fixture' } },
    ...globals,
  });
  return exports;
}
const session = { date: '2026-11-20', timeSlot: '5:30 PM', durationHours: 2, headcount: 2,
  studioKey: 'nature-grid', serviceKey: 'recording', addons: {} };
const input = { sessions: [session], fullName: 'Test Guest', email: 'guest@example.com', phone: '+971500000000' };
function fixture({ missingStudio, studioCapacity = 10, payment = { success: true }, failSchedule = false, failPrimary = false, failBlackout = false, catalogStudios, catalogAddons, promoRow, used = 0 } = {}) {
  const bookings = { id: 'id', promoCode: 'promoCode' }, bookingSessions = {}, promoCodes = { code: 'code' };
  const writes = [], payments = [], capabilities = [], lookups = [];
  let transactions = 0;
  const tx = { insert: (table) => ({ values: (values) => {
    if ((table === bookingSessions && failSchedule) || (table === bookings && failPrimary)) throw new Error('no_overlapping_booking_sessions');
    writes.push({ table, values });
    return { returning: async () => [{ id: 'checkout-id' }] };
  } }) };
  const data = loadSource('src/features/podcast-booking/data.ts');
  const { createPodcastBooking } = loadSource('src/features/podcast-booking/actions.ts', {
    '@/db/schema': { bookings, bookingSessions, promoCodes, studioBlackouts: {}, studios: { slug: 'slug' } },
    '@/lib/actions/podcast-operations': {
      getCmsPodcastSets: async () => catalogStudios ?? data.PODCAST_STUDIOS,
      getCmsPodcastAddons: async () => catalogAddons ?? data.PODCAST_ADDONS,
    },
    'drizzle-orm': { ...require('drizzle-orm'), eq: (column, value) => ({ column, value }), or() {}, isNull() {} },
    '@/db': { db: {
      $count: async () => used,
      select: () => ({ from: (table) => ({ where: async () => { if (table === promoCodes) return promoRow ? [promoRow] : []; if (failBlackout) throw new Error('Blackout read failure'); return []; } }) }),
      query: { studios: { findFirst: async ({ where }) => {
        lookups.push(where.value);
        return where.value === missingStudio ? null : { id: `db-${where.value}`, isActive: true, capacity: studioCapacity };
      } } },
      transaction: async (callback) => {
        transactions++;
        try { return await callback(tx); } catch (error) { writes.length = 0; throw error; }
      },
    } },
    '@/lib/booking-payment-capability': { issueBookingPaymentCapability: async (id) => capabilities.push(id) },
    '@/lib/ziina': {
      getBookingPaymentQuote: async () => ({ quote: { paymentStatus: 'unpaid', options: [
        { type: 'full', amountAed: Number(writes[0].values.totalAmount) },
      ] } }),
      createZiinaPaymentIntent: async (...args) => { payments.push(args); return payment; } },
  });
  return { createPodcastBooking, writes, payments, capabilities, lookups, bookings, bookingSessions, get transactions() { return transactions; } };
}

test('podcast rejects unknown keys, unsafe quantities, toggle quantities, and insufficient capacity before DB or payment', async () => {
  const f = fixture();
  for (const invalid of [
    { studioKey: 'not-a-studio' }, { serviceKey: 'not-a-service' }, { addons: { unknown: 1 } },
    ...[-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1].map((quantity) => ({ addons: { 'standard-reel': quantity } })),
    { addons: { teleprompter: 2 } }, { studioKey: 'dark-walnut', headcount: 3 },
  ]) {
    assert.equal((await f.createPodcastBooking({ ...input, initiatePayment: true, sessions: [{ ...session, ...invalid }] })).success, false);
  }
  assert.equal(f.lookups.length, 0);
  assert.equal(f.transactions, 0);
  assert.equal(f.payments.length, 0);
});

test('all sessions resolve exact studios and persist atomically, retaining one discounted checkout charge', async () => {
  const f = fixture();
  const result = await f.createPodcastBooking({ ...input, initiatePayment: true, promoCode: 'YAS10', sessions: [
    { ...session, addons: { 'standard-reel': 2, teleprompter: 0 } },
    { ...session, studioKey: 'dark-walnut', date: '2026-11-21', durationHours: 1 },
  ] });
  assert.equal(result.success, true);
  assert.equal(f.transactions, 1);
  assert.deepEqual(f.lookups, ['nature-grid', 'dark-walnut']);
  assert.equal(f.writes.length, 2);
  const checkout = f.writes[0].values;
  assert.equal(checkout.totalAmount, '1267.00');
  assert.equal(checkout.promoCode, 'YAS10');
  assert.equal(checkout.scheduledAt.toISOString(), '2026-11-20T13:30:00.000Z');
  const additional = f.writes[1].values[0];
  assert.equal(additional.bookingId, 'checkout-id');
  assert.equal(additional.studioId, 'db-dark-walnut');
  assert.equal(additional.position, 2);
  assert.equal(additional.scheduledAt.toISOString(), '2026-11-21T13:30:00.000Z');
  assert.equal(f.payments.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(f.payments[0][1])), { paymentStatus: 'unpaid', amountAed: 1267 });
});

test('unresolved secondary studio prevents the entire insert; schedule errors roll back before payment', async () => {
  const sessions = [session, { ...session, studioKey: 'dark-walnut' }];
  const missing = fixture({ missingStudio: 'dark-walnut' });
  const result = await missing.createPodcastBooking({ ...input, sessions });
  assert.equal(result.success, false);
  assert.match(result.message, /studio is unavailable/);
  assert.equal(missing.transactions, 0);
  const undersized = fixture({ studioCapacity: 1 });
  assert.equal((await undersized.createPodcastBooking(input)).success, false);
  assert.equal(undersized.transactions, 0);
  const conflict = fixture({ failSchedule: true });
  assert.equal((await conflict.createPodcastBooking({ ...input, sessions, initiatePayment: true })).success, false);
  assert.equal(conflict.writes.length, 0);
  assert.equal(conflict.payments.length, 0);
});

test('podcast blackout query failure prevents reservation writes and payment', async () => {
  const f = fixture({ failBlackout: true });
  const response = await f.createPodcastBooking({ ...input, initiatePayment: true });
  assert.equal(response.success, false);
  assert.match(response.message, /Unable to verify studio availability/);
  assert.equal(f.writes.length, 0);
  assert.equal(f.payments.length, 0);
});

test('Dubai midnight/noon conversion and invalid-date fallback return finite instants', async () => {
  for (const [timeSlot, expected] of [['12:00 AM', '2026-11-19T20:00:00.000Z'], ['12:00 PM', '2026-11-20T08:00:00.000Z']]) {
    const f = fixture();
    await f.createPodcastBooking({ ...input, sessions: [{ ...session, timeSlot }] });
    assert.equal(f.writes[0].values.scheduledAt.toISOString(), expected);
  }
  for (const changes of [{ date: 'invalid' }, { timeSlot: 'bad time' }]) {
    const start = Date.now() + 86400000;
    const f = fixture();
    await f.createPodcastBooking({ ...input, sessions: [{ ...session, ...changes }] });
    const actual = f.writes[0].values.scheduledAt.getTime();
    assert.ok(actual >= start && actual <= Date.now() + 86400000);
  }
});

test('Ziina failure returns saved unpaid reservation; successful simulation needs no redirect URL', async () => {
  const failed = fixture({ payment: { success: false, error: 'Gateway unavailable' } });
  const result = await failed.createPodcastBooking({ ...input, initiatePayment: true });
  assert.equal(result.success, false);
  assert.equal(result.paymentFailed, true);
  assert.equal(result.bookingId, 'checkout-id');
  assert.match(result.message, /saved but unpaid.*Gateway unavailable/);
  const simulated = fixture({ payment: { success: true, paymentStatus: 'paid' } });
  assert.equal((await simulated.createPodcastBooking({ ...input, initiatePayment: true })).success, true);
});

function hookFixture(response, onSubmit = () => {}, studios, addons, resolvePromo = async () => null) {
  const states = [];
  let cursor = 0;
  const { usePodcastBooking } = loadSource('src/features/podcast-booking/hooks/usePodcastBooking.ts', {
    react: { useMemo: (fn) => fn(), useState: (initial) => {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], (value) => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    } },
    '../actions': { resolvePodcastPromoRule: resolvePromo, createPodcastBooking: async (input) => { onSubmit(input); return response; } },
  });
  return () => { cursor = 0; return usePodcastBooking(studios, addons); };
}

test('wizard blocks capacity bypass and confirms saved reservation on payment failure without resubmitting', async () => {
  const response = { success: false, paymentFailed: true, bookingId: 'saved', message: 'Saved but unpaid' };
  const render = hookFixture(response);
  let hook = render();
  hook.updateCurrentSession({ studioKey: 'dark-walnut', headcount: 4 });
  hook.setStep(2);
  render().nextStep();
  hook = render();
  assert.equal(hook.step, 2);
  assert.match(hook.errorMessage, /enough seats/);
  hook.setContact({ fullName: 'Test Guest', email: 'guest@example.com', phone: '+971500000000' });
  hook.setIsAgreedToTerms(true);
  hook.updateCurrentSession({ headcount: 2 });
  await render().submitBooking(true);
  assert.equal(render().confirmedResult, response);
});

test('calendar defaults and date cards retain local calendar day on both sides of UTC', () => {
  const originalTimezone = process.env.TZ;
  try {
    for (const timezone of ['Pacific/Kiritimati', 'America/Los_Angeles']) {
      process.env.TZ = timezone;
      const render = hookFixture({ success: true });
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      const expected = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`;
      assert.equal(render().currentSession.date, expected);
      const { getLocalCalendarDate } = loadSource('src/features/gear/lib/rental-schedule.ts');
      for (const hour of [0, 23]) {
        assert.equal(getLocalCalendarDate(new Date(2026, 0, 1, hour, 30)), '2026-01-01');
      }
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ; else process.env.TZ = originalTimezone;
  }
});

test('studio selection preserves headcount; confirmation announces payment error', () => {
  const updates = [];
  const { Step2Setup } = loadSource('src/features/podcast-booking/components/Step2Setup.tsx', { 'next/image': { default: () => null } });
  const tree = Step2Setup({ session: { ...session, headcount: 4 }, onChange: (update) => updates.push(update) });
  const cards = tree.props.children[1].props.children;
  const tooSmall = cards.find((card) => card.key === 'dark-walnut');
  tooSmall.props.onSelect();
  assert.equal(updates.length, 1);
  assert.deepEqual(Object.keys(updates[0]), ['studioKey']);
  assert.equal(updates[0].studioKey, 'dark-walnut');
  assert.doesNotMatch(renderToStaticMarkup(tooSmall), /disabled=""/);
  assert.match(renderToStaticMarkup(tooSmall), /Needs 4 seats/);
  cards.find((card) => card.key === 'nature-grid').props.onSelect();
  assert.equal(updates[1].studioKey, 'nature-grid');
  const { PodcastConfirmation } = loadSource('src/features/podcast-booking/components/PodcastConfirmation.tsx', { 'next/link': { default: ({ children }) => children } });
  const html = renderToStaticMarkup(createElement(PodcastConfirmation, { result: { success: false, paymentFailed: true, message: 'Gateway unavailable' }, onBookAnother() {} }));
  assert.match(html, /Unpaid/);
  assert.match(html, /role="alert"[^>]*>Gateway unavailable/);
  assert.doesNotMatch(html, /Booking Confirmed/);
});

test('accessories URL and category card select the same counted items, with cart persistence', () => {
  const gearData = loadSource('src/features/gear/data.ts');
  const accessories = gearData.GEAR_DATA.filter((gear) => gear.category === 'accessories');
  assert.ok(accessories.length > 0);
  const { parseCartStorage } = loadSource('src/features/gear/lib/cart-storage.ts');
  assert.equal(parseCartStorage(JSON.stringify({ items: accessories })).items.length, accessories.length);
  const Stub = () => null;
  const Grid = () => null;
  const Card = () => null;
  let categoryParam = null, cursor = 0;
  const state = [];
  const { GearExplorer } = loadSource('src/features/gear/components/GearExplorer.tsx', {
    react: {
      useMemo: (fn) => fn(),
      useEffect: () => {},
      useState: (initial) => {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [state[index], (value) => { state[index] = value; }];
      },
    },
    'next/navigation': { useSearchParams: () => new URLSearchParams(categoryParam ? `category=${categoryParam}` : '') },
    '@/components/animations/MotionWrappers': { FadeUp: Stub, StaggerContainer: Stub, StaggerItem: Stub },
    '@/components/ui/empty-state': { EmptyState: Stub }, '@/components/ui/button': { Button: Stub },
    '@/components/ui/category-filter': { CategoryFilterBar: Stub },
    './GearCard': { GearCard: Card }, './RentalDateSelector': { RentalDateSelector: Stub },
    './ProductsCategoriesGrid': { ProductsCategoriesGrid: Grid },
    '@/lib/utils': { formatCurrency: String },
    '@/components/providers/LanguageProvider': {
      useLanguage: () => {
        const dict = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
        return {
          language: 'en',
          isArabic: false,
          direction: 'ltr',
          dir: 'ltr',
          setLanguage() {},
          t: (key, params) => {
            const val = key.split('.').reduce((acc, part) => acc?.[part], dict);
            if (typeof val !== 'string') return key;
            return params ? val.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`)) : val;
          },
        };
      },
    },
    '@/components/providers/CartProvider': { useCart: () => ({ isInCart: () => false }) },
  });
  const render = () => { cursor = 0; return GearExplorer({ initialGear: gearData.GEAR_DATA }); };
  function find(tree, type) {
    if (!tree) return [];
    if (Array.isArray(tree)) return tree.flatMap((child) => find(child, type));
    return [...(tree.type === type ? [tree] : []), ...find(tree.props?.children, type)];
  }
  const grid = find(render(), Grid)[0];
  assert.equal(grid.props.counts.accessories, accessories.length);
  grid.props.onSelectCategory('accessories');
  const fromCard = find(render(), Card).map((node) => node.props.item.id);
  assert.deepEqual(fromCard, Array.from(accessories.slice(0, 12), (gear) => gear.id));
  // A fresh URL selection uses validUrlCategory and the same filter predicate.
  state.length = 0;
  categoryParam = 'accessories';
  assert.deepEqual(find(render(), Card).map((node) => node.props.item.id), fromCard);
  const { ProductsCategoriesGrid } = loadSource('src/features/gear/components/ProductsCategoriesGrid.tsx', {
    'next/image': { default: Stub }, 'next/link': { default: ({ href, children }) => createElement('a', { href }, children) },
  });
  assert.match(renderToStaticMarkup(createElement(ProductsCategoriesGrid)), /href="\/shop\?category=accessories"/);
});

test('booking management receives every persisted schedule under its single financial booking', async () => {
  const bookings = {}, bookingSessions = {};
  const records = [{ booking: { id: 'checkout', totalAmount: '780.00' }, studioName: 'Primary' }];
  const schedule = [
    { session: { id: 'first', bookingId: 'checkout', position: 1 }, studioName: 'Primary' },
    { session: { id: 'second', bookingId: 'checkout', position: 2 }, studioName: 'Secondary' },
  ];
  const { getCmsBookings } = loadSource('src/lib/actions/bookings-rfp-operations.ts', {
    '@/lib/auth': { auth: {} }, 'next/headers': {}, 'next/cache': {},
    './shared': { requireAdmin: async () => {}, isDbAvailable: () => true },
    '@/db/schema': { bookings, bookingSessions, users: {}, studios: {}, enterpriseRfps: {} },
    'drizzle-orm': { eq() {}, desc() {}, asc() {}, inArray() {} },
    '@/db': { db: { select: () => ({ from: (table) => {
      const builder = { leftJoin: () => builder, where: () => builder,
        orderBy: async () => table === bookings ? records : schedule };
      return builder;
    } }) } },
  });
  const result = await getCmsBookings();
  assert.equal(result.length, 1);
  assert.equal(result[0].totalAmount, '780.00');
  assert.equal(result[0].schedule.length, 2);
  assert.equal(result[0].schedule[1].studioName, 'Secondary');
});

function findNodes(tree, predicate) {
  if (!tree) return [];
  if (Array.isArray(tree)) return tree.flatMap((child) => findNodes(child, predicate));
  return [...(predicate(tree) ? [tree] : []), ...findNodes(tree.props?.children, predicate)];
}

test('review and submission validate inactive sessions and return to the first invalid entry', async () => {
  for (const [updates, step, error] of [
    [{ date: '' }, 1, /session date/],
    [{ timeSlot: '' }, 1, /time slot/],
    [{ studioKey: 'missing' }, 2, /studio setup/],
    [{ studioKey: 'dark-walnut', headcount: 4 }, 2, /enough seats/],
  ]) {
    for (const submit of [false, true]) {
      const calls = [];
      const render = hookFixture({ success: true }, (input) => calls.push(input));
      render().updateCurrentSession(updates);
      render().addNewSession();
      render().updateCurrentSession({ date: '' });
      render().addNewSession();
      render().setContact(input);
      render().setIsAgreedToTerms(true);
      render().setStep(submit ? 5 : 4);
      if (submit) await render().submitBooking(true);
      else render().nextStep();
      assert.equal(render().activeSessionIndex, 0);
      assert.equal(render().step, step);
      assert.match(render().errorMessage, error);
      assert.equal(render().confirmedResult, null);
      assert.equal(render().isSubmitting, false);
      assert.equal(calls.length, 0);
      // Repair the first entry; the next invalid session must now be selected.
      render().updateCurrentSession(session);
      render().setStep(4);
      render().nextStep();
      assert.equal(render().activeSessionIndex, 1);
      assert.equal(render().step, 1);
      render().updateCurrentSession(session);
      render().setStep(4);
      render().nextStep();
      assert.equal(render().step, 5);
      assert.equal(render().errorMessage, null);
      await render().submitBooking();
      assert.equal(calls.length, 1);
      assert.equal(calls[0].sessions.length, 3);
      assert.equal(render().confirmedResult.success, true);
    }
  }
});

test('review Edit selects its own session and errors have one display on every step', () => {
  const render = hookFixture({ success: true });
  render().addNewSession();
  render().setStep(5);
  // Trigger a checkout error without calling the server.
  render().submitBooking();
  const Stub = () => null;
  const Banner = () => null;
  const Review = () => null;
  const { PodcastBookingWizard } = loadSource('src/features/podcast-booking/components/PodcastBookingWizard.tsx', {
    react: { useEffect() {}, useState: (initial) => [initial, () => {}] },
    '../hooks/usePodcastBooking': { usePodcastBooking: render },
    './Step1DateTime': { Step1DateTime: Stub }, './Step2Setup': { Step2Setup: Stub },
    './Step3Service': { Step3Service: Stub }, './Step4Addons': { Step4Addons: Stub },
    './Step5ReviewCheckout': { Step5ReviewCheckout: Review },
    './PodcastQuoteRail': { PodcastQuoteRail: Stub }, './PodcastConfirmation': { PodcastConfirmation: Stub },
    '@/features/booking/components/ui/BookingKit': { BookingStepper: Stub, ErrorBanner: Banner, formatAED: String, studioSprings: {} },
  }, { requestAnimationFrame() {} });
  const tree = PodcastBookingWizard();
  assert.equal(findNodes(tree, (node) => node.type === Banner).length, 0);
  const reviewProps = findNodes(tree, (node) => node.type === Review)[0].props;
  assert.equal(reviewProps.errorMessage, 'Full name is required.');
  const { Step5ReviewCheckout } = loadSource('src/features/podcast-booking/components/Step5ReviewCheckout.tsx', {
    react: { useState: (initial) => [initial, () => {}] },
    'next/image': { default: Stub },
  });
  const reviewTree = Step5ReviewCheckout(reviewProps);
  assert.equal(findNodes(reviewTree, (node) => node.props?.role === 'alert').length, 1);
  const edits = findNodes(reviewTree, (node) => node.type === 'button' && node.props.children?.includes(' Edit'));
  assert.equal(edits.length, 2);
  for (const index of [0, 1]) {
    render().setActiveSessionIndex(1 - index);
    render().setStep(5);
    edits[index].props.onClick();
    assert.equal(render().activeSessionIndex, index);
    assert.equal(render().step, 1);
  }
  for (const step of [1, 2, 3, 4]) {
    render().setStep(step);
    assert.equal(findNodes(PodcastBookingWizard(), (node) => node.type === Banner).length, 1);
  }
});

test('CMS keys, add-on pricing, availability, and capacity govern podcast booking and client quotes', async () => {
  const data = loadSource('src/features/podcast-booking/data.ts');
  const catalogStudios = [{ ...data.PODCAST_STUDIOS[0], key: 'cms-studio', name: 'CMS studio', seats: 3 }];
  const catalogAddons = [{ ...data.PODCAST_ADDONS[0], key: 'cms-addon', priceNum: 250, unit: 'per reel' }];
  const cmsSession = { ...session, studioKey: 'cms-studio', addons: { 'cms-addon': 2 } };
  const f = fixture({ catalogStudios, catalogAddons });
  assert.equal((await f.createPodcastBooking({ ...input, sessions: [cmsSession] })).totalAmount, 1280);
  assert.equal(f.lookups[0], 'cms-studio');
  assert.match(f.writes[0].values.specialRequests, /CMS studio/);
  const render = hookFixture({ success: true }, () => {}, catalogStudios, catalogAddons);
  assert.equal(render().currentSession.studioKey, 'cms-studio');
  render().updateCurrentSession(cmsSession);
  assert.equal(render().grandTotal, 1280);
  for (const change of [() => { catalogStudios[0].isAvailable = false; }, () => { catalogStudios[0].isAvailable = true; catalogAddons[0].isActive = false; }]) {
    change();
    const invalid = fixture({ catalogStudios, catalogAddons });
    assert.equal((await invalid.createPodcastBooking({ ...input, sessions: [cmsSession] })).success, false);
    assert.equal(invalid.transactions, 0);
    render().setStep(4);
    render().nextStep();
    assert.notEqual(render().step, 5);
  }
  const { Step2Setup } = loadSource('src/features/podcast-booking/components/Step2Setup.tsx', { 'next/image': { default: () => null } });
  const { Step4Addons } = loadSource('src/features/podcast-booking/components/Step4Addons.tsx', { react: { useState: (initial) => [initial, () => {}] } });
  catalogStudios[0].isAvailable = false;
  assert.doesNotMatch(renderToStaticMarkup(createElement(Step2Setup, { session: cmsSession, studios: catalogStudios })), /CMS studio/);
  assert.doesNotMatch(renderToStaticMarkup(createElement(Step4Addons, { session: cmsSession, addons: catalogAddons })), /Standard Reel/);
});

// The database exclusion constraint also applies to the first session via bookings_sync_schedule.
test('primary-session database overlap rejection returns failure without payment or capability', async () => {
  const f = fixture({ failPrimary: true });
  const result = await f.createPodcastBooking({ ...input, initiatePayment: true });
  assert.equal(result.success, false);
  assert.match(result.message, /no_overlapping_booking_sessions/);
  assert.equal(f.writes.length, 0);
  assert.equal(f.payments.length, 0);
  assert.equal(f.capabilities.length, 0);
});


for (const promoRow of [
  { code: 'YAS10', isActive: false },
  { code: 'YAS10', isActive: true, expiresAt: new Date('2000-01-01') },
  { code: 'YAS10', isActive: true, eligibleOfferIds: ['offer-only'] },
  { code: 'YAS10', isActive: true, maxUses: 1 },
]) {
  test(`podcast rejects blocked database promo before saving: ${JSON.stringify(promoRow)}`, async () => {
    const f = fixture({ promoRow, used: 1 });
    const result = await f.createPodcastBooking({ ...input, promoCode: 'YAS10' });
    assert.equal(result.success, false);
    assert.match(result.message, /promo code/);
    assert.equal(f.writes.length, 0);
  });
}

test('podcast records an unrestricted database promo and rejects an unknown supplied code', async () => {
  const f = fixture({ promoRow: { code: 'YAS10', isActive: true, eligibleOfferIds: [], discountPercent: 30 } });
  const result = await f.createPodcastBooking({ ...input, promoCode: ' yas10 ' });
  assert.equal(result.success, true);
  assert.equal(f.writes[0].values.promoCode, 'YAS10');
  assert.equal(Number(f.writes[0].values.totalAmount), 546);
  const unknown = fixture();
  assert.equal((await unknown.createPodcastBooking({ ...input, promoCode: 'UNKNOWN' })).success, false);
  assert.equal(unknown.writes.length, 0);
});

test('podcast hook resolves static and database codes and displays the resolved discount', async () => {
  const calls = [];
  const render = hookFixture({}, () => {}, undefined, undefined, async (code) => {
    calls.push(code);
    return code === 'YAS10' ? { code, percent: 30 } : null;
  });
  await render().applyPromo(' yas10 ');
  assert.deepEqual(calls, ['YAS10']);
  assert.equal(render().appliedPromo, 'YAS10');
  assert.equal(render().promoDiscount, Math.round(render().subtotalAllSessions * 0.3));
  render().removePromo();
  await render().applyPromo('DBONLY');
  assert.deepEqual(calls, ['YAS10', 'DBONLY']);
  assert.equal(render().appliedPromo, null);
  assert.match(render().promoError, /Invalid or expired/);
});
