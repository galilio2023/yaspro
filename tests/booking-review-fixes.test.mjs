import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import * as React from 'react';
import { PgDialect } from 'drizzle-orm/pg-core';

const require = createRequire(import.meta.url);
function fixture(mocks = {}, env = {}) {
  const cache = new Map(), states = [];
  let cursor = 0;
  const react = {
    ...React, useEffect() {}, useMemo: (fn) => fn(),
    useState: (initial) => {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
      return [states[index], (value) => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    },
  };
  function load(file) {
    file = [file, `${file}.ts`, `${file}.tsx`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    assert.ok(file, 'Source exists');
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    });
    vm.runInNewContext(outputText, {
      exports, Date, console: { warn() {}, error() {} }, process: { env },
      require: (name) => {
        if (name === 'react') return react;
        if (Object.hasOwn(mocks, name)) return mocks[name];
        if (name === 'server-only') return {};
        if (name.endsWith('.json')) return { default: JSON.parse(fs.readFileSync(path.resolve(path.dirname(file), name), 'utf8')) };
        if (name.startsWith('@/')) return load(`src/${name.slice(2)}`);
        if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name));
        return require(name);
      },
    });
    return exports;
  }
  return { load, render: (fn) => { cursor = 0; return fn(); } };
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
const stub = () => null;
const enMessages = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const uiMocks = {
  '@/components/providers/LanguageProvider': {
    useLanguage: () => ({
      language: 'en',
      isArabic: false,
      direction: 'ltr',
      dir: 'ltr',
      setLanguage() {},
      t: (key, params) => {
        const val = key.split('.').reduce((acc, part) => acc?.[part], enMessages);
        if (typeof val !== 'string') return key;
        return params ? val.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`)) : val;
      },
    }),
  },
  '@/components/animations/MotionWrappers': { StaggerContainer: stub, StaggerItem: stub, FadeUp: stub },
  '@/components/admin/shared/AdminModal': { AdminModal: stub },
  '../shared/AdminModal': { AdminModal: stub },
  '../shared/AdminFormFields': { AdminInput: stub, AdminSwitch: stub, AdminSelect: stub },
  '@/features/projects/components/ProjectCard': { ProjectCard: stub },
  '@/features/influencers/components/InfluencerCard': { InfluencerCard: stub },
  '@/components/common/CinemaVideoModal': { CinemaVideoModal: stub },
};

test('featured sections preserve empty CMS selections and retain omitted-data fallbacks', async () => {
  const f = fixture(uiMocks);
  const { PortfolioSection } = f.load('src/components/sections/PortfolioSection');
  const { default: InfluencersSection } = f.load('src/components/sections/InfluencersSection');
  assert.equal(f.render(() => PortfolioSection({ initialProjects: [] })), null);
  assert.equal(f.render(() => InfluencersSection({ initialInfluencers: [] })), null);
  assert.ok(f.render(() => PortfolioSection({})));
  assert.ok(f.render(() => InfluencersSection({})));
  const { default: HomePage } = fixture({ ...uiMocks,
    '@/lib/cached-queries': { getCachedProjects: async () => [{ isFeatured: false }], getCachedInfluencers: async () => [{ isFeatured: false }] },
    '@/components/sections/HeroSection': { default: stub },
    '@/components/sections/OffersPreviewSection': { OffersPreviewSection: stub },
    '@/components/sections/GearPreviewSection': { GearPreviewSection: stub },
    '@/components/sections/PartnersMarquee': { PartnersMarquee: stub },
    '@/components/sections/VirtualStudioSection': { VirtualStudioSection: stub },
  }).load('src/app/(public)/page');
  const tree = await HomePage();
  const selections = nodes(tree).filter((node) => node.props?.initialProjects || node.props?.initialInfluencers);
  assert.equal(selections.length, 2);
  assert.equal(selections[0].props.initialProjects.length, 0);
  assert.equal(selections[1].props.initialInfluencers.length, 0);
});

test('studio-scoped blackout requires a selected studio and disables an empty studio scope', async () => {
  const f = fixture(uiMocks), saves = [];
  const { BlackoutFormModal } = f.load('src/components/admin/forms/BlackoutFormModal');
  let studiosList = [{ id: 'studio', name: 'Studio' }];
  const render = () => f.render(() => {
    const modal = BlackoutFormModal({ isOpen: true, studiosList, onSave: async (data) => saves.push(data) });
    return modal.type(modal.props);
  });
  nodes(render()).find((node) => node.props?.children === 'Specific Soundstage').props.onClick();
  let tree = render();
  await nodes(tree).find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(saves.length, 0);
  assert.match(nodes(render()).find((node) => node.props?.label === 'Select Soundstage').props.error, /Select/);
  nodes(render()).find((node) => node.props?.label === 'Select Soundstage').props.onChange({ target: { value: 'studio' } });
  tree = render();
  await nodes(tree).find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(saves[0].studioId, 'studio');
  studiosList = [];
  assert.equal(nodes(render()).find((node) => node.props?.children === 'Specific Soundstage').props.disabled, true);
  await nodes(render()).find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(saves.length, 1);
});

test('offer weekday toggles start unrestricted and retain the offer studio assignment', async () => {
  const f = fixture(uiMocks), saves = [];
  const { OfferFormModal } = f.load('src/components/admin/forms/OfferFormModal');
  const render = () => f.render(() => {
    const modal = OfferFormModal({ isOpen: true, initialOffer: { id: 'offer', name: 'Title', nameAr: 'Arabic', studioId: 'studio' }, onSave: async (data) => saves.push(data) });
    return modal.type(modal.props);
  });
  const clickDay = (label) => nodes(render()).find((node) => node.type === 'button' && node.props.children === label).props.onClick();
  clickDay('Mon');
  await render().props.onSubmit({ preventDefault() {} });
  assert.deepEqual(Array.from(saves[0].restrictedDays), [0, 2, 3, 4, 5, 6]);
  assert.equal(saves[0].studioId, 'studio');
  clickDay('Tue');
  await render().props.onSubmit({ preventDefault() {} });
  assert.deepEqual(Array.from(saves[1].restrictedDays), [0, 3, 4, 5, 6]);
  clickDay('Mon'); clickDay('Tue');
  await render().props.onSubmit({ preventDefault() {} });
  assert.equal(saves[2].restrictedDays, null);
});

test('duration buttons and counter clear call times beyond 21:00 and retain exact boundary times', () => {
  const updates = [], f = fixture({ '@/lib/actions/availability-operations': {} });
  const { StepDatetime } = f.load('src/features/booking/components/steps/StepDatetime');
  const render = (time) => f.render(() => StepDatetime({ state: { time, date: '2026-12-01', durationHours: 1 }, update: (data) => updates.push(data) }));
  let tree = render('8:00 PM');
  nodes(tree).find((node) => node.props?.incLabel === 'Increase duration').props.onChange(2);
  assert.equal(updates.at(-1).time, '');
  tree = render('7:00 PM');
  nodes(tree).find((node) => node.props?.incLabel === 'Increase duration').props.onChange(2);
  assert.equal(updates.at(-1).time, undefined);
  nodes(tree).find((node) => node.type === 'button' && node.props.children?.[0] === 4 && node.props.children?.[1] === 'h').props.onClick();
  assert.equal(updates.at(-1).durationHours, 4);
  assert.equal(updates.at(-1).time, '');
});

test('server submission schema rejects a duration crossing 21:00 before any booking write', () => {
  const { bookingSubmissionSchema } = fixture().load('src/lib/validations');
  const input = { firstName: 'Test', lastName: 'Guest', email: 'guest@example.com', phone: '123456', studioId: 'studio', sessionType: 'podcast', scheduledAt: '2026-12-01T19:00', durationHours: 2 };
  assert.equal(bookingSubmissionSchema.safeParse(input).success, true);
  assert.equal(bookingSubmissionSchema.safeParse({ ...input, durationHours: 3 }).success, false);
});

test('static service matrix excludes unknown tiers regardless of price or best status', () => {
  const f = fixture();
  const { Step3Service } = f.load('src/features/podcast-booking/components/Step3Service');
  const props = { session: {}, onChange() {}, services: [{ key: 'custom', title: 'Custom', price: 9999, best: true }, { key: 'recording', title: 'Known', price: 100 }] };
  let tree = f.render(() => Step3Service(props));
  nodes(tree).find((node) => node.type === 'button').props.onClick();
  tree = f.render(() => Step3Service(props));
  const table = nodes(tree).find((node) => node.type === 'table');
  assert.equal(nodes(table).filter((node) => node.type === 'th').length, 2);
  assert.equal(nodes(table).filter((node) => node.type === 'td').length, 22);
});

test('database promo query retains tombstones for inactive, expired, and offer-scoped codes', async () => {
  const f = fixture({ '@/db': { isDatabaseConfigured: () => true, db: { select: () => ({ from: async () => [
    { code: 'yas10', isActive: false }, { code: 'YASPRO', expiresAt: new Date('2000-01-01') },
    { code: 'WELCOME50', eligibleOfferIds: ['offer'] }, { code: 'studio20', discountPercent: 20 },
  ] }) } } });
  const { getStudioPromoRules } = f.load('src/lib/queries/studio-promo-rules');
  const rules = await getStudioPromoRules();
  const { calculateBookingPrice } = f.load('src/features/booking/constants');
  for (const code of ['YAS10', 'YASPRO', 'WELCOME50']) {
    assert.equal(rules[code], null);
    assert.equal(calculateBookingPrice({ promoCode: code }, undefined, { promoRules: rules }).discount, 0);
  }
  assert.ok(calculateBookingPrice({ promoCode: 'DUBAI2026' }, undefined, { promoRules: rules }).discount > 0);
  assert.equal(rules.STUDIO20.discountPercent, 20);
});

function bookingFixture(promoRow) {
  const writes = [], schema = { bookings: {}, studios: {}, studioBlackouts: {}, bookingSessions: {}, promoCodes: { code: 'code' } };
  let query;
  const f = fixture({
    '@/db/schema': schema,
    '@/db': { db: {
      query: { studios: { findFirst: async () => ({ id: 'studio', name: 'Studio', hourlyRate: '100', isActive: true }) }, promoCodes: { findFirst: async ({ where }) => { query = new PgDialect().sqlToQuery(where); return promoRow; } } },
      select: () => ({ from: () => ({ innerJoin: () => ({ where: async () => [] }), where: async () => [] }) }),
      insert: () => ({ values: (data) => { writes.push(data); return { returning: async () => [{ id: 'booking' }] }; } }),
    } },
    '@/lib/booking-payment-capability': { issueBookingPaymentCapability: async () => {} },
    '@/lib/rate-limit': { getClientIdentifier: async () => 'fixture', checkRateLimit: () => ({ allowed: true }), checkIdempotency: () => true },
    '@/lib/actions/platform-settings-operations': { getPlatformSettings: async () => ({}) },
    '@/lib/notifications': { sendBookingConfirmationNotification: async () => {} },
    '@/lib/auth': { auth: { api: { getSession: async () => null } } },
    'next/headers': { headers: async () => ({}) }, 'next/cache': { revalidatePath() {} },
  }, { DATABASE_URL: 'postgresql://synthetic/fixture' });
  return { ...f, writes, get query() { return query; } };
}
const studioBooking = { firstName: 'Test', lastName: 'Guest', email: 'guest@example.com', phone: '123456', studioId: 'studio', sessionType: 'podcast', scheduledAt: '2099-12-01T12:00', durationHours: 1 };

test('studio action looks up mixed-case database promos and blocks invalid overrides of static codes', async () => {
  for (const [promoRow, code, discounted] of [
    [{ code: 'studio20', discountPercent: 20 }, 'STUDIO20', true],
    [{ code: 'YAS10', isActive: false }, 'YAS10', false],
    [{ code: 'YAS10', expiresAt: new Date('2000-01-01') }, 'YAS10', false],
    [{ code: 'YAS10', eligibleOfferIds: ['offer'], discountPercent: 50 }, 'YAS10', false],
    [undefined, 'YAS10', true],
  ]) {
    const f = bookingFixture(promoRow);
    const { createBooking } = f.load('src/lib/actions');
    assert.equal((await createBooking({ ...studioBooking, promoCode: code })).success, true);
    assert.match(f.query.sql, /lower\(/);
    assert.equal(f.query.params.at(-1), code.toLowerCase());
    const price = f.load('src/features/booking/constants').calculateBookingPrice({ durationHours: 1 }).total;
    assert.equal(Number(f.writes[0].totalAmount) < price, discounted);
  }
});

test('fleet mutations fail on read errors and use a parameterized JSONB entry update on success', async () => {
  let failRead = true, inserts = 0, conflict;
  const f = fixture({
    './shared': { requireAdmin: async () => {}, isDbAvailable: () => true },
    'next/cache': { revalidatePath() {} },
    '@/db': { db: {
      select: () => ({ from: () => ({ where: () => ({ limit: async () => {
        if (failRead) throw new Error('read failed');
        return [];
      } }) }) }),
      insert: () => { inserts++; return { values: (values) => ({ onConflictDoUpdate: (update) => {
        conflict = update;
        return { returning: async () => [{ value: values.value }] };
      } }) }; },
    } },
  });
  const api = f.load('src/lib/actions/broadcast-telemetry-dispatcher');
  assert.equal((await api.updateBroadcastFleetUnitStatus('unit', 'Maintenance')).success, false);
  assert.equal(inserts, 0);
  failRead = false;
  const result = await api.updateBroadcastFleetUnitStatus('unit', 'Maintenance', 'Location');
  assert.equal(result.success, true);
  assert.equal(result.data.unit.location, 'Location');
  assert.ok(result.data['DUBAI STAGE A']);
  const query = new PgDialect().sqlToQuery(conflict.set.value);
  assert.match(query.sql, /^jsonb_set\(/);
  assert.equal(query.params[0], 'unit');
  assert.equal(JSON.parse(query.params[1]).status, 'Maintenance');
});

test('offer updates preserve omitted studio IDs while inserts still default to null', async () => {
  let values, patch;
  const f = fixture({
    './shared': { requireAdmin: async () => {}, isDbAvailable: () => true },
    'next/cache': { revalidatePath() {} },
    '@/db': { db: { insert: () => ({ values: (input) => {
      values = input;
      return { onConflictDoUpdate: async ({ set }) => { patch = set; }, onConflictDoNothing: () => ({ returning: async () => [{ id: 'new-offer' }] }) };
    } }) } },
  });
  const api = f.load('src/lib/actions/offers-packages-operations');
  const input = { name: 'New Offer', nameAr: 'Arabic', category: 'offer', price: 100, hours: 1, features: [] };
  assert.equal((await api.upsertCmsOffer({ ...input, id: 'offer' })).success, true);
  assert.equal(patch.studioId, undefined);
  assert.equal((await api.upsertCmsOffer({ ...input, id: 'offer', studioId: null })).success, true);
  assert.equal(patch.studioId, null);
  assert.equal((await api.upsertCmsOffer(input)).success, true);
  assert.equal(values.studioId, null);
});
