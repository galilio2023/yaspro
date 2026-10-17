import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import * as React from 'react';

const require = createRequire(import.meta.url);
const enMessages = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const arMessages = JSON.parse(fs.readFileSync('messages/ar.json', 'utf8'));
function mockLanguageProvider(isArabic = false) {
  const dict = isArabic ? arMessages : enMessages;
  return {
    useLanguage: () => ({
      language: isArabic ? 'ar' : 'en',
      isArabic,
      direction: isArabic ? 'rtl' : 'ltr',
      dir: isArabic ? 'rtl' : 'ltr',
      setLanguage() {},
      t: (key, params) => {
        const val = key.split('.').reduce((acc, part) => acc?.[part], dict);
        if (typeof val !== 'string') return key;
        return params ? val.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`)) : val;
      },
    }),
  };
}
function loader(mocks = {}, globals = {}) {
  const cache = new Map();
  function load(file) {
    if (!fs.existsSync(file) && file.endsWith('.ts')) file += 'x';
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    });
    vm.runInNewContext(outputText, {
      exports, Date, Error, console: { error() {}, warn() {} }, process: { env: {} },
      require: (name) => {
        if (Object.hasOwn(mocks, name)) return mocks[name];
        if (name === 'server-only') return {};
        if (name.endsWith('.json')) {
          const parsed = JSON.parse(fs.readFileSync(path.resolve(path.dirname(file), name), 'utf8'));
          return { default: parsed, ...parsed };
        }
        if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`);
        if (name.startsWith('.')) return load(path.resolve(path.dirname(file), `${name}.ts`));
        return require(name);
      }, ...globals,
    });
    return exports;
  }
  return load;
}

function databaseFixture({ available = true } = {}) {
  const schema = Object.fromEntries(['podcastSets', 'podcastAddons', 'studios', 'platformSettings', 'offers'].map((name) => [name, { id: `${name}.id`, key: `${name}.key`, slug: `${name}.slug` }]));
  const tables = new Map(Object.values(schema).map((table) => [table, new Map()]));
  let queue = Promise.resolve();
  let seedTransactions = 0;
  const db = {
    select: () => ({ from: (table) => {
      let condition;
      const rows = () => Array.from(tables.get(table).values()).filter((row) => !condition || (row.id ?? row.key ?? row.slug) === condition.value);
      const builder = {
        where: (where) => { condition = where; return builder; },
        limit: async (limit) => rows().slice(0, limit),
        orderBy: async () => rows(),
        then: (resolve, reject) => Promise.resolve(rows()).then(resolve, reject),
      };
      return builder;
    } }),
    insert: (table) => ({ values: (values) => {
      const run = (update) => {
        const created = [];
        for (const value of Array.isArray(values) ? values : [values]) {
          const key = value.id ?? value.key ?? value.slug;
          if (tables.get(table).has(key)) {
            if (update && (!update.setWhere || tables.get(table).get(key).category === update.setWhere.value)) {
              const row = { ...tables.get(table).get(key), ...update.set };
              tables.get(table).set(key, row);
              created.push(row);
            }
          } else {
            const row = { ...value };
            if (table === schema.studios) row.id = `db-${value.slug}`;
            tables.get(table).set(key, row);
            created.push(row);
          }
        }
        return { returning: async () => created, then: (resolve, reject) => Promise.resolve(created).then(resolve, reject) };
      };
      return { onConflictDoNothing: () => run(), onConflictDoUpdate: (update) => run(update), then: (resolve, reject) => run().then(resolve, reject) };
    } }),
    update: (table) => ({ set: (patch) => ({ where: async ({ value }) => {
      if (tables.get(table).has(value)) Object.assign(tables.get(table).get(value), patch);
    } }) }),
    delete: (table) => ({ where: async ({ value }) => { tables.get(table).delete(value); } }),
    execute: async () => { seedTransactions++; },
    transaction: (callback) => {
      const result = queue.then(() => callback(db));
      queue = result.catch(() => {});
      return result;
    },
  };
  const load = loader({
    '@/db': { db }, '@/db/schema': schema,
    'drizzle-orm': { eq: (column, value) => ({ column, value }), asc() {}, desc() {}, sql: () => ({}) },
    'next/cache': { revalidatePath() {} },
    './shared': { isDbAvailable: () => available, requireAdmin: async () => {} },
  });
  return { load, schema, tables, db, get seedTransactions() { return seedTransactions; } };
}

test('podcast first reads seed both tables once without overwriting existing CMS data', async () => {
  const f = databaseFixture();
  f.tables.get(f.schema.podcastSets).set('nature-grid', { id: 'nature-grid', name: 'Edited', seats: 8, isAvailable: false });
  f.tables.get(f.schema.podcastSets).set('custom-set', { id: 'custom-set', name: 'Custom', seats: 3 });
  f.tables.get(f.schema.podcastAddons).set('standard-reel', { id: 'standard-reel', title: 'Edited reel', priceNum: 700, isActive: false });
  const api = f.load('src/lib/actions/podcast-operations.ts');
  const [sets, addons] = await Promise.all([api.getCmsPodcastSets(), api.getCmsPodcastAddons()]);
  assert.equal(sets.find((s) => s.key === 'nature-grid').name, 'Edited');
  assert.equal(sets.find((s) => s.key === 'nature-grid').isAvailable, false);
  assert.equal(addons.find((a) => a.key === 'standard-reel').priceNum, 700);
  assert.equal(addons.find((a) => a.key === 'standard-reel').isActive, false);
  assert.equal(f.tables.get(f.schema.studios).get('custom-set').capacity, 3);
  assert.ok(sets.length > 2 && addons.length > 1);
  // A concurrent initial read rechecks the marker inside its transaction.
  assert.ok(f.seedTransactions <= 2);
  const transactions = f.seedTransactions;
  f.tables.get(f.schema.podcastSets).clear();
  f.tables.get(f.schema.podcastAddons).clear();
  assert.equal((await api.getCmsPodcastSets()).length, 0);
  assert.equal((await api.getCmsPodcastAddons()).length, 0);
  assert.equal(f.seedTransactions, transactions);
});

test('podcast toggles, deletes, and edits persist defaults even before the first catalog read', async () => {
  for (const [operation, table, key, property] of [
    ['togglePodcastSetAvailability', 'podcastSets', 'nature-grid', 'isAvailable'],
    ['togglePodcastAddonStatus', 'podcastAddons', 'standard-reel', 'isActive'],
    ['deleteCmsPodcastSet', 'podcastSets', 'nature-grid'],
    ['deleteCmsPodcastAddon', 'podcastAddons', 'standard-reel'],
  ]) {
    const f = databaseFixture();
    const api = f.load('src/lib/actions/podcast-operations.ts');
    assert.equal((await api[operation](key, false)).success, true);
    await api.getCmsPodcastSets();
    await api.getCmsPodcastAddons();
    const row = f.tables.get(f.schema[table]).get(key);
    if (property) assert.equal(row[property], false);
    else {
      assert.equal(row, undefined);
      if (table === 'podcastSets') assert.equal(f.tables.get(f.schema.studios).get(key).isActive, false);
    }
    assert.ok(f.tables.get(f.schema[table]).size > 0);
  }
  const f = databaseFixture();
  f.tables.get(f.schema.studios).set('nature-grid', { slug: 'nature-grid', name: 'Flagship stage', capacity: 25 });
  const api = f.load('src/lib/actions/podcast-operations.ts');
  assert.equal((await api.upsertCmsPodcastSet({ id: 'nature-grid', name: 'Podcast set', seats: 4 })).success, true);
  assert.equal(f.tables.get(f.schema.studios).get('nature-grid').name, 'Flagship stage');
  assert.equal(f.tables.get(f.schema.studios).get('nature-grid').capacity, 25);
  assert.equal((await api.upsertCmsPodcastSet({ id: 'cms-key', name: 'CMS', seats: 5 })).success, true);
  assert.equal(f.tables.get(f.schema.studios).get('cms-key').capacity, 5);
  assert.equal((await api.upsertCmsPodcastSet({ id: 'cms-key', name: 'Renamed', seats: 6 })).success, true);
  assert.equal(f.tables.get(f.schema.studios).get('cms-key').capacity, 6);
  assert.equal((await api.upsertCmsPodcastAddon({ id: 'standard-reel', title: 'New title', priceNum: 432 })).success, true);
  assert.equal((await api.getCmsPodcastAddons()).find((a) => a.key === 'standard-reel').priceNum, 432);
});

test('catalogs fall back without a database, while offer overrides preserve restrictions and paused status', async () => {
  const offline = databaseFixture({ available: false });
  const podcast = offline.load('src/lib/actions/podcast-operations.ts');
  assert.ok((await podcast.getCmsPodcastSets()).length > 0);
  assert.ok((await podcast.getCmsPodcastAddons()).length > 0);
  assert.equal(offline.tables.get(offline.schema.podcastSets).size, 0);
  const f = databaseFixture();
  f.tables.get(f.schema.offers).set('lunch-break-special', { id: 'lunch-break-special', price: '123.00', isActive: false, restrictedDays: [1], features: [] });
  f.tables.get(f.schema.offers).set('custom', { id: 'custom', price: '234.00', isActive: true, features: [] });
  const offers = await f.load('src/lib/actions/offers-packages-operations.ts').getBookingOffers();
  const lunch = offers.find((o) => o.id === 'lunch-break-special');
  assert.equal(lunch.price, 123);
  assert.equal(lunch.isActive, false);
  assert.ok(lunch.restrictedHours.slots.length > 0);
  assert.equal(offers.filter((o) => o.id === lunch.id).length, 1);
  assert.equal(offers.find((o) => o.id === 'custom').price, 234);
});

test('generated offer slug collisions cannot overwrite a package; explicit IDs retain update behavior', async () => {
  const f = databaseFixture();
  const api = f.load('src/lib/actions/offers-packages-operations.ts');
  const input = { name: 'Custom Package', nameAr: 'باقة', category: 'bundle', price: 100, hours: 2, features: [] };
  assert.equal((await api.upsertCmsOffer(input)).success, true);
  assert.equal((await api.upsertCmsOffer({ ...input, price: 999 })).success, false);
  assert.equal(f.tables.get(f.schema.offers).get('custom-package').price, '100.00');
  assert.equal((await api.upsertCmsOffer({ ...input, id: 'custom-package', price: 222 })).success, true);
  assert.equal(f.tables.get(f.schema.offers).get('custom-package').price, '222.00');
  assert.equal((await api.upsertCmsOffer({ ...input, name: '5 hour bundles' })).success, false);
});

function find(tree, predicate) {
  if (!tree) return [];
  if (Array.isArray(tree)) return tree.flatMap((node) => find(node, predicate));
  return [...(predicate(tree) ? [tree] : []), ...find(tree.props?.children, predicate)];
}
function formFixture(file, props) {
  let cursor = 0;
  const state = [];
  const Modal = () => null, Input = () => null, Switch = () => null;
  const load = loader({
    react: { ...React, useState: (initial) => {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
      return [state[index], (value) => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
    } },
    '../shared/AdminModal': { AdminModal: Modal },
    '../shared/AdminFormFields': { AdminInput: Input, AdminSwitch: Switch, AdminSelect: Input, AdminTextarea: Input },
  });
  const Component = Object.entries(load(file)).find(([name]) => name.endsWith("Modal"))[1];
  const render = () => {
    cursor = 0;
    const outer = Component({ isOpen: true, onClose() {}, ...props });
    return outer.type(outer.props);
  };
  return { render, Input, Switch, Modal };
}

test('blackout wall times and all-day boundaries serialize Dubai instants across browser time zones and DST', async () => {
  const original = process.env.TZ;
  try {
    for (const timezone of ['Pacific/Kiritimati', 'America/Los_Angeles']) {
      process.env.TZ = timezone;
      const saves = [];
      const f = formFixture('src/components/admin/forms/BlackoutFormModal.tsx', { onSave: async (value) => saves.push(value) });
      function set(label, value) { find(f.render(), (node) => node.type === f.Input && node.props.label === label)[0].props.onChange({ target: { value } }); }
      set('Start Date', '2026-03-08'); set('End Date', '2026-03-08');
      set('Start Time', '09:30'); set('End Time', '18:15');
      await find(f.render(), (node) => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
      assert.equal(saves[0].startTime, '2026-03-08T05:30:00.000Z');
      assert.equal(saves[0].endTime, '2026-03-08T14:15:00.000Z');
      find(f.render(), (node) => node.type === f.Switch)[0].props.onChange(true);
      await find(f.render(), (node) => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
      assert.equal(saves[1].startTime, '2026-03-07T20:00:00.000Z');
      assert.equal(saves[1].endTime, '2026-03-08T19:59:59.000Z');
      set('Start Date', '');
      await find(f.render(), (node) => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
      assert.equal(saves.length, 2);
    }
  } finally { if (original === undefined) delete process.env.TZ; else process.env.TZ = original; }
});

test('saving an offer preserves existing restricted days and defaults absent restrictions to null', async () => {
  for (const restrictedDays of [[0, 1, 2, 3], undefined]) {
    const saves = [];
    const f = formFixture('src/components/admin/forms/OfferFormModal.tsx', {
      initialOffer: { id: 'test', name: 'Test', nameAr: 'باقة', restrictedDays },
      onSave: async (value) => saves.push(value),
    });
    await f.render().props.onSubmit({ preventDefault() {} });
    assert.deepEqual(saves[0].restrictedDays, restrictedDays ?? null);
  }
});

test('checkout displays server options, ignores caller pricing, and refreshes stale payments', async () => {
  const effects = [], states = [], attempts = [];
  let cursor = 0, reads = 0;
  const quote = { paymentStatus: 'unpaid', depositPercent: 25, vatRatePercent: 0, options: [
    { type: 'deposit', amountAed: 250, targetStatus: 'deposit_paid' },
    { type: 'full', amountAed: 1000, targetStatus: 'paid' },
  ] };
  const balanceQuote = { ...quote, paymentStatus: 'deposit_paid', options: [
    { type: 'full', amountAed: 750, targetStatus: 'paid' },
  ] };
  const load = loader({
    react: { ...React, useEffect: (effect) => effects.push(effect), useRef: () => ({ current: null }), useState: (initial) => {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], (value) => { states[index] = value; }];
    } },
    'react-dom': { createPortal: (tree) => tree },
    '@/hooks/useFocusTrap': { useFocusTrap() {} },
    '@/lib/ziina': {
      getBookingPaymentQuote: async () => { reads++; return { quote }; },
      createZiinaPaymentIntent: async (...args) => {
        attempts.push(args);
        return { success: false, quote: balanceQuote, error: 'Booking payment changed.' };
      },
    },
    '@/components/providers/LanguageProvider': mockLanguageProvider(false),
    '@/lib/utils': { cn: (...values) => values.join(' '), formatCurrency: String },
  }, { document: { body: {} } });
  const { BookingPaymentModal } = load('src/features/booking/components/BookingPaymentModal.tsx');
  const render = () => {
    cursor = 0;
    return BookingPaymentModal({ isOpen: true, bookingId: 'booking', referenceCode: 'REF', totalAmount: 1,
      paymentSettings: { depositPercent: 30 }, onClose() {} });
  };
  assert.equal(find(render(), (node) => node.type === 'form').length, 0);
  const cleanup = effects[0]();
  await Promise.resolve();
  let tree = render();
  assert.equal(reads, 1);
  for (const label of ['25% Booking Deposit', 'Includes 0% UAE VAT', 'UAE VAT (0% FTA):', '250', '0']) {
    assert.ok(find(tree, (node) => node.props?.children === label).length > 0, label);
  }
  await find(tree, (node) => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
  assert.deepEqual(JSON.parse(JSON.stringify(attempts[0])), ['booking', { paymentStatus: 'unpaid', amountAed: 250 }, 'deposit', 'REF']);
  tree = render();
  assert.ok(find(tree, (node) => node.props?.children === 'Remaining Balance').length > 0);
  assert.ok(find(tree, (node) => node.props?.children === '750').length > 0);
  assert.equal(find(tree, (node) => node.props?.children === '25% Booking Deposit').length, 0);
  await find(tree, (node) => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
  assert.deepEqual(JSON.parse(JSON.stringify(attempts[1])), ['booking', { paymentStatus: 'deposit_paid', amountAed: 750 }, 'full', 'REF']);
  cleanup();
});

test('public booking pages pass current catalogs into their client wizards', async () => {
  const OffersClient = () => null, PodcastWizard = () => null;
  const catalog = [{ id: 'cms', name: 'CMS package', price: 123, isActive: true }, { id: 'paused', isActive: false }];
  const studios = [{ key: 'cms-set', name: 'CMS set' }], addons = [{ key: 'cms-addon', priceNum: 456 }];
  let requestConnections = 0;
  const load = loader({
    'next/server': { connection: async () => { requestConnections++; } },
    './OffersPageClient': { OffersPageClient: OffersClient },
    '@/features/podcast-booking/components/PodcastBookingWizard': { PodcastBookingWizard: PodcastWizard },
    '@/lib/actions/offers-packages-operations': { getBookingOffers: async () => catalog },
    '@/lib/actions/podcast-operations': { getCmsPodcastSets: async () => studios, getCmsPodcastAddons: async () => addons },
    '@/features/booking/components/ui/BookingKit': { BookingHero: () => null },
  });
  const offers = await load('src/app/(public)/offers/page.tsx').default();
  assert.equal(find(offers, (node) => node.type === OffersClient)[0].props.catalog, catalog);
  const schema = find(offers, (node) => node.props?.data?.hasOfferCatalog)[0].props.data;
  assert.equal(schema.hasOfferCatalog.itemListElement.length, 1);
  assert.equal(schema.hasOfferCatalog.itemListElement[0].price, '123');
  const podcast = await load('src/app/(public)/podcast-booking/page.tsx').default();
  const wizard = find(podcast, (node) => node.type === PodcastWizard)[0];
  assert.equal(wizard.props.studios, studios);
  assert.equal(wizard.props.addons, addons);
  assert.equal(requestConnections, 2);
});

test('promo expiry uses Dubai end of day and displays the Dubai calendar date', async () => {
  const saves = [];
  const f = formFixture('src/components/admin/forms/PromoCodeFormModal.tsx', {
    initialPromo: { code: 'LOCAL', expiresAt: '2026-11-19T21:00:00.000Z' }, offerOptions: [],
    onSave: async (value) => saves.push(value),
  });
  const dateInput = () => find(f.render(), (node) => node.props?.label === 'Expires On')[0];
  assert.equal(dateInput().props.value, '2026-11-20');
  dateInput().props.onChange({ target: { value: '2026-11-21' } });
  await f.render().props.onSubmit({ preventDefault() {} });
  assert.equal(saves[0].expiresAt, '2026-11-21T19:59:59.999Z');
  assert.equal(dateInput().props.value, '2026-11-21');
  dateInput().props.onChange({ target: { value: '' } });
  await f.render().props.onSubmit({ preventDefault() {} });
  assert.equal(saves[1].expiresAt, null);
});

test('built-in offer deletion preserves the full disabled override, including repeat deletions', async () => {
  const f = databaseFixture();
  const api = f.load('src/lib/actions/offers-packages-operations.ts');
  const original = f.load('src/features/offers/data.ts').OFFERS_AND_BUNDLES.find((o) => o.id === 'lunch-break-special');
  assert.equal((await api.deleteCmsOffer(original.id)).success, true);
  let offer = (await api.getBookingOffers()).find((o) => o.id === original.id);
  for (const field of ['image', 'originalPrice', 'badge', 'savings', 'restrictedDays']) assert.deepEqual(offer[field], original[field]);
  assert.equal(offer.isActive, false);
  assert.equal((await api.deleteCmsOffer(original.id)).success, true);
  offer = (await api.getBookingOffers()).find((o) => o.id === original.id);
  assert.equal(offer.isActive, false);
  assert.equal((await api.toggleOfferStatus(original.id, true)).success, true);
  assert.equal((await api.getBookingOffers()).find((o) => o.id === original.id).isActive, true);
});

test('manual booking validation rejects invalid enums and studio IDs before writes', async () => {
  let writes = 0;
  const bookingId = '11111111-1111-4111-8111-111111111111';
  const load = loader({
    '@/db': { db: { insert() { writes++; }, update() { writes++; } } },
    '@/lib/auth': {}, 'next/headers': {}, 'next/cache': {}, '@/lib/utils': {},
    './shared': { requireAdmin: async () => {}, isDbAvailable: () => true, isUuid: (id) => id === bookingId },
  });
  const api = load('src/lib/actions/bookings-rfp-operations.ts');
  const input = { sessionType: 'podcast', scheduledAt: '2026-11-20T09:00:00+04:00', durationHours: 2, headcount: 2, totalAmount: '100', contactName: 'Guest' };
  for (const invalid of [{ status: 'bogus' }, { paymentStatus: 'bogus' }, { sessionType: 'bogus' }, { studioId: 'bogus' }, { studioId: '' }, { status: null }]) {
    for (const action of [() => api.createCmsBooking({ ...input, ...invalid }), () => api.updateCmsBookingDetails(bookingId, { ...input, ...invalid })]) {
      const response = await action();
      assert.equal(response.success, false);
      assert.match(response.error, /Invalid/);
    }
  }
  assert.equal(writes, 0);
});

test('booking editing exposes only the notes body and server saves preserve stored metadata', async () => {
  const original = '[Contact URI: Guest | guest%40example.com | %2B971500000000] | Package: Creator (5 hrs) | Slot: 09:00 AM | Special Requests: Original notes';
  const f = formFixture('src/components/admin/forms/BookingFormModal.tsx', {
    initialBooking: { id: 'booking', notes: original }, studios: [],
  });
  assert.equal(find(f.render(), (node) => node.props?.label === 'Notes')[0].props.value, 'Original notes');
  let patch;
  const load = loader({
    '@/db': { db: {
      select: () => ({ from: () => ({ where: () => ({ limit: async () => [{ specialRequests: original }] }) }) }),
      update: () => ({ set: (value) => { patch = value; return { where: async () => {} }; } }),
    } },
    '@/lib/auth': {}, 'next/headers': {}, 'next/cache': { revalidatePath() {} }, '@/lib/utils': {},
    './shared': { requireAdmin: async () => {}, isDbAvailable: () => true, isUuid: () => true },
  });
  const api = load('src/lib/actions/bookings-rfp-operations.ts');
  const input = { sessionType: 'podcast', scheduledAt: '2026-11-20T09:00:00+04:00', durationHours: 2, headcount: 2, totalAmount: '100' };
  for (const notes of ['Revised notes', '[Contact: Forged] | Package: Fake | Special Requests: Revised notes', '']) {
    assert.equal((await api.updateCmsBookingDetails('booking', { ...input, notes })).success, true);
    assert.ok(patch.specialRequests.includes('[Contact URI: Guest | guest%40example.com | %2B971500000000]'));
    assert.ok(patch.specialRequests.includes('Package: Creator (5 hrs) | Slot: 09:00 AM'));
    assert.doesNotMatch(patch.specialRequests, /Forged|Fake|Original notes/);
    assert.equal(load('src/lib/booking-notes.ts').splitBookingNotes(patch.specialRequests).body, notes ? 'Revised notes' : '');
  }
});

test('platform settings defaults require a successful empty read and malformed IBANs never reach the upsert', async () => {
  let failRead = false, rows = [], writes = 0;
  const load = loader({
    '@/db': { db: {
      select: () => ({ from: () => ({ where: () => ({ limit: async () => { if (failRead) throw new Error('private database failure'); return rows; } }) }) }),
      insert: () => ({ values: () => ({ onConflictDoUpdate: async () => { writes++; } }) }),
    } },
    'next/cache': { revalidatePath() {} },
    './shared': { requireAdmin: async () => {}, isDbAvailable: () => true },
  });
  const api = load('src/lib/actions/platform-settings-operations.ts');
  const defaults = await api.getPlatformSettings();
  assert.equal(defaults.depositPercent, 50);
  rows = [{ value: { bankName: 'Configured bank', vatRatePercent: 0 } }];
  assert.equal((await api.getPlatformSettings()).bankName, 'Configured bank');
  assert.equal((await api.getPlatformSettings()).vatRatePercent, 0);
  failRead = true;
  await assert.rejects(api.getPlatformSettings(), /Payment settings are unavailable/);
  assert.equal((await api.updatePlatformSettings({ bankName: 'Other' })).success, false);
  failRead = false;
  for (const iban of ['', 'not-an-iban', 'AE080331234567890123456', null]) {
    const response = await api.updatePlatformSettings({ iban });
    assert.equal(response.success, false);
    assert.match(response.error, /valid IBAN/);
  }
  assert.equal(writes, 0);
  assert.equal((await api.updatePlatformSettings({ iban: 'AE07 0331 2345 6789 0123 456' })).success, true);
  assert.equal(writes, 1);
});

test('checkout blocks failed quote reads even when callers provide payment settings', async () => {
  const state = [], effects = [];
  let cursor = 0, rejectRead;
  const load = loader({
    react: { ...React, useEffect: (effect) => effects.push(effect), useRef: () => ({ current: null }), useState: (initial) => {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], (value) => { state[index] = value; }];
    } },
    'react-dom': { createPortal: (tree) => tree }, '@/hooks/useFocusTrap': { useFocusTrap() {} },
    '@/lib/ziina': { getBookingPaymentQuote: () => new Promise((_, reject) => { rejectRead = reject; }) },
    '@/components/providers/LanguageProvider': mockLanguageProvider(false),
    '@/lib/utils': { cn: (...values) => values.join(' '), formatCurrency: String },
  }, { document: { body: {} } });
  const { BookingPaymentModal } = load('src/features/booking/components/BookingPaymentModal.tsx');
  const render = () => { cursor = 0; return BookingPaymentModal({ isOpen: true, totalAmount: 1000,
    paymentSettings: { depositPercent: 25 }, onClose() {} }); };
  let tree = render();
  assert.equal(find(tree, (node) => node.type === 'form').length, 0);
  effects[0]();
  rejectRead(new Error('read failure'));
  await new Promise((resolve) => setImmediate(resolve));
  tree = render();
  assert.equal(find(tree, (node) => node.type === 'form').length, 0);
  assert.match(find(tree, (node) => node.props?.role === 'alert')[0].props.children, /Unable to load booking payment/);
});

test('podcast and blackout managers restore optimistic changes and display action errors', async () => {
  for (const operation of ['toggleSet', 'deleteSet', 'toggleAddon', 'deleteAddon', 'deleteBlackout']) {
    const state = [];
    let cursor = 0, resolveAction;
    const result = () => new Promise((resolve) => { resolveAction = resolve; });
    const load = loader({
      react: { ...React, useState: (initial) => {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [state[index], (value) => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
      } },
      'next/link': { default: () => null },
      '@/lib/actions/podcast-operations': { togglePodcastSetAvailability: result, deleteCmsPodcastSet: result, togglePodcastAddonStatus: result, deleteCmsPodcastAddon: result },
      '@/lib/actions/blackout-operations': { deleteStudioBlackout: result },
      '@/components/admin/forms/PodcastSetFormModal': {}, '@/components/admin/forms/PodcastAddonFormModal': {}, '@/components/admin/forms/BlackoutFormModal': {},
      '@/components/ui/pagination-controls': {},
    }, { confirm: () => true });
    const blackout = operation === 'deleteBlackout';
    const Component = Object.values(load(blackout ? 'src/features/admin/components/BlackoutManager.tsx' : 'src/features/admin/components/PodcastManager.tsx'))[0];
    const props = blackout ? { initialBlackouts: [{ id: 'blackout', title: 'Test lockout', startTime: '2026-11-20T00:00:00Z', endTime: '2026-11-21T00:00:00Z' }], podcastSets: [] } : {
      initialSets: [{ key: 'set', name: 'Test set', isAvailable: true }],
      initialAddons: [{ key: 'addon', title: 'Test addon', isActive: true }],
    };
    const render = () => { cursor = 0; return Component(props); };
    let tree = render();
    if (operation.includes('Addon')) {
      find(tree, (node) => node.type === 'button' && find(node, (child) => Array.isArray(child.props?.children) && child.props.children[0] === 'Post-Production Add-ons (').length > 0)[0].props.onClick();
      tree = render();
    }
    const button = find(tree, (node) => node.type === 'button' && (
      operation === 'deleteSet' ? node.props.title === 'Delete Set' :
      operation === 'deleteAddon' ? node.props.title === 'Delete Add-on' :
      blackout ? find(node, (child) => child.props?.children === 'Lift Lockout').length > 0 :
      find(node, (child) => child.props?.children === 'Pause').length > 0
    ))[0];
    const before = JSON.stringify(state);
    const pending = button.props.onClick();
    assert.notEqual(JSON.stringify(state), before);
    resolveAction({ success: false, error: 'Persist failed' });
    await pending;
    tree = render();
    assert.ok(find(tree, (node) => node.props?.role === 'alert' && node.props.children === 'Persist failed').length > 0);
    const items = state.find((value) => Array.isArray(value) && value[0]?.[blackout ? 'id' : 'key'] === (blackout ? 'blackout' : operation.includes('Addon') ? 'addon' : 'set'));
    assert.equal(items.length, 1);
    if (operation.startsWith('toggle')) assert.equal(items[0][operation === 'toggleSet' ? 'isAvailable' : 'isActive'], true);
  }
});

test('studio wizard catalog CRUD persists in platform_settings and calculateBookingPrice honors custom catalog overrides', async () => {
  const f = databaseFixture();
  const catalogApi = f.load('src/lib/actions/studio-wizard-catalog-operations.ts');
  const initial = await catalogApi.getStudioWizardCatalog();
  assert.ok(initial.sessionTypes.length > 0);
  assert.ok(initial.props.length > 0);
  assert.ok(initial.addons.length > 0);

  await catalogApi.upsertStudioSessionType({
    id: 'podcast',
    title: 'Custom Podcast',
    description: 'Custom desc',
    price: 1500,
    imageUrl: '/images/studios/nature-grid.jpg',
  });
  await catalogApi.upsertStudioPropItem({
    id: 'rgb-tubes',
    title: 'Custom RGB Tubes',
    category: 'Decor',
    price: 500,
    priceType: 'flat',
    imageUrl: '/images/studios/nature-grid.jpg',
  });
  await catalogApi.upsertStudioAddonItem({
    id: 'full-edit',
    title: 'Custom Full Edit',
    description: 'Full edit',
    price: 3000,
    priceType: 'flat',
    imageUrl: '/images/studios/nature-grid.jpg',
  });

  const updated = await catalogApi.getStudioWizardCatalog();
  assert.equal(updated.sessionTypes.find((s) => s.id === 'podcast').price, 1500);
  assert.equal(updated.props.find((p) => p.id === 'rgb-tubes').price, 500);
  assert.equal(updated.addons.find((o) => o.id === 'full-edit').price, 3000);

  const constants = f.load('src/features/booking/constants.ts');
  const pricing = constants.calculateBookingPrice(
    {
      durationHours: 2,
      sessionTypeId: 'podcast',
      selectedPropIds: ['rgb-tubes'],
      selectedAddonIds: ['full-edit'],
    },
    undefined,
    updated
  );
  // Session (1500 * 2 hrs = 3000) + prop (500) + addon (3000)
  assert.equal(pricing.sessionCost, 3000);
  assert.equal(pricing.propsCost, 500);
  assert.equal(pricing.addonsCost, 3000);
});

test('podcast services catalog CRUD and social media packages catalog CRUD persist in platform_settings', async () => {
  const f = databaseFixture();
  const podcastApi = f.load('src/lib/actions/podcast-operations.ts');
  const services = await podcastApi.getCmsPodcastServices();
  assert.equal(services.length, 3);

  assert.equal(
    (
      await podcastApi.upsertCmsPodcastService({
        key: 'recording-editing',
        title: 'Custom Edit Tier',
        sub: 'Custom sub',
        price: 2100,
        badge: 'VIP',
        best: true,
        isActive: true,
        highlights: ['4K Master'],
      })
    ).success,
    true
  );
  const updatedServices = await podcastApi.getCmsPodcastServices();
  assert.equal(updatedServices.find((s) => s.key === 'recording-editing').price, 2100);
  assert.equal((await podcastApi.togglePodcastServiceStatus('recording', false)).success, true);
  assert.equal((await podcastApi.getCmsPodcastServices()).find((s) => s.key === 'recording').isActive, false);

  const socialApi = f.load('src/lib/actions/social-packages-operations.ts');
  const socialPkgs = await socialApi.getCmsSocialPackages();
  assert.equal(socialPkgs.length, 4);
  assert.equal(
    (
      await socialApi.upsertCmsSocialPackage({
        id: 'growth',
        nameEn: 'Growth Custom',
        nameAr: 'نمو مخصص',
        taglineEn: 'Tag',
        taglineAr: 'شعار',
        monthlyPrice: 19500,
        yearlyPricePerMonth: 16500,
        isPopular: true,
        isActive: true,
        specsHighlights: { reels: '12', posts: '15', stories: '30', filming: '2 Days' },
        features: [{ labelEn: '12 Reels', labelAr: '12 ريلز', included: true }],
      })
    ).success,
    true
  );
  assert.equal((await socialApi.getCmsSocialPackages()).find((p) => p.id === 'growth').monthlyPrice, 19500);
  assert.equal((await socialApi.toggleSocialPackageStatus('starter', false)).success, true);
  assert.equal((await socialApi.getCmsSocialPackages()).find((p) => p.id === 'starter').isActive, false);
});

test('broadcast telemetry feed persists and dispatches in platform_settings', async () => {
  const f = databaseFixture();
  const broadcastApi = f.load('src/lib/actions/broadcast-telemetry-dispatcher.ts');
  const initialFeed = await broadcastApi.getTelemetryFeed();
  assert.equal(initialFeed.length, 0);

  const dispatched = await broadcastApi.dispatchTelemetryEvent({
    source: 'OB-VAN MERCEDES 01',
    type: 'GENLOCK_SYNC',
    level: 'success',
    summary: 'SMPTE Genlock synchronized across all 4K cameras',
  });
  assert.equal(dispatched.success, true);
  const feedAfter = await broadcastApi.getTelemetryFeed();
  assert.equal(feedAfter.length, 1);
  assert.equal(feedAfter[0].type, 'GENLOCK_SYNC');
});


test('catalog mutations fail without writes on read errors or invalid saved values; public readers still fall back', async () => {
  const f = databaseFixture();
  const settings = f.tables.get(f.schema.platformSettings);
  settings.set('unrelated', { key: 'unrelated', value: ['preserve'] });
  const wizard = f.load('src/lib/actions/studio-wizard-catalog-operations.ts');
  const podcast = f.load('src/lib/actions/podcast-operations.ts');
  const social = f.load('src/lib/actions/social-packages-operations.ts');
  const operations = [
    () => wizard.upsertStudioSessionType({ id: 'new', title: 'New', price: 1 }),
    () => wizard.deleteStudioSessionType('video'),
    () => wizard.upsertStudioCrewItem({ id: 'new', title: 'New', price: 1 }),
    () => wizard.deleteStudioCrewItem('crew'),
    () => wizard.upsertStudioPropItem({ id: 'new', title: 'New', price: 1 }),
    () => wizard.deleteStudioPropItem('prop'),
    () => wizard.upsertStudioAddonItem({ id: 'new', title: 'New', price: 1 }),
    () => wizard.deleteStudioAddonItem('addon'),
    () => podcast.upsertCmsPodcastService({ key: 'new', title: 'New', price: 1 }),
    () => podcast.togglePodcastServiceStatus('recording', false),
    () => podcast.deleteCmsPodcastService('recording'),
    () => social.upsertCmsSocialPackage({ id: 'new', nameEn: 'New' }),
    () => social.toggleSocialPackageStatus('starter', false),
    () => social.deleteCmsSocialPackage('starter'),
  ];
  const originalSelect = f.db.select;
  for (const brokenRead of [true, false]) {
    if (brokenRead) f.db.select = () => { throw new Error('Synthetic read failure'); };
    else {
      f.db.select = originalSelect;
      for (const key of ['studio_wizard_catalog', 'podcast_services_catalog', 'social_media_packages_catalog']) {
        settings.set(key, { key, value: null });
      }
    }
    const before = JSON.stringify([...settings]);
    for (const operation of operations) {
      const result = await operation();
      assert.equal(result.success, false);
      assert.match(result.error, brokenRead ? /Synthetic read failure/ : /catalog is invalid/);
      assert.equal(JSON.stringify([...settings]), before);
    }
    assert.ok((await wizard.getStudioWizardCatalog()).sessionTypes.length > 0);
    assert.ok((await podcast.getCmsPodcastServices()).length > 0);
    assert.ok((await social.getCmsSocialPackages()).length > 0);
  }
});

test('strict catalog mutations respect saved empty arrays instead of resurrecting defaults', async () => {
  const f = databaseFixture();
  const settings = f.tables.get(f.schema.platformSettings);
  settings.set('podcast_services_catalog', { key: 'podcast_services_catalog', value: [] });
  const podcast = f.load('src/lib/actions/podcast-operations.ts');
  assert.equal((await podcast.upsertCmsPodcastService({ key: 'new', title: 'New', price: 0 })).success, true);
  assert.equal(settings.get('podcast_services_catalog').value.length, 1);
  settings.set('social_media_packages_catalog', { key: 'social_media_packages_catalog', value: [] });
  const social = f.load('src/lib/actions/social-packages-operations.ts');
  assert.equal((await social.upsertCmsSocialPackage({ id: 'new', nameEn: 'New' })).success, true);
  assert.equal(settings.get('social_media_packages_catalog').value.length, 1);
});

test('podcast tier input rejects missing text and non-finite or negative prices without changing the catalog', async () => {
  const f = databaseFixture();
  const { upsertCmsPodcastService } = f.load('src/lib/actions/podcast-operations.ts');
  for (const change of [
    { key: undefined }, { key: null }, { key: 123 }, { key: ' ' },
    { title: undefined }, { title: null }, { title: {} }, { title: ' ' },
    ...[NaN, Infinity, -Infinity, -1, 'invalid', '', ' ', undefined, null, true].map((price) => ({ price })),
  ]) {
    const result = await upsertCmsPodcastService({ key: 'new', title: 'New', price: 100, ...change });
    assert.equal(result.success, false);
    assert.equal(result.error, 'Valid tier key, title, and price are required.');
    assert.equal(f.tables.get(f.schema.platformSettings).size, 0);
  }
  const result = await upsertCmsPodcastService({ key: ' New Tier ', title: ' New ', price: 0 });
  assert.equal(result.success, true);
  assert.equal(result.data.at(-1).key, 'new-tier');
  assert.equal(result.data.at(-1).title, 'New');
  assert.equal(result.data.at(-1).price, 0);
});

test('social package JSON-LD follows active CMS names, descriptions, prices, and custom quotes', async () => {
  let packages = [
    { id: 'cms', nameEn: 'CMS package', taglineEn: 'Updated description', monthlyPrice: 4321 },
    { id: 'paused', nameEn: 'Paused', monthlyPrice: 1, isActive: false },
    { id: 'custom', nameEn: 'Custom', taglineEn: 'Contact sales', monthlyPrice: null },
  ];
  const Grid = () => null;
  const load = loader({
    'next-intl/server': {},
    '@/lib/actions/social-packages-operations': { getCmsSocialPackages: async () => packages },
    '@/features/social-media-packages/components/PackagesGrid': { PackagesGrid: Grid },
    ...Object.fromEntries(['SocialMediaPackagesHero', 'SocialMediaDeliverablesShowcase', 'PackageComparisonTable', 'PackageFaqSection'].map((name) => [
      `@/features/social-media-packages/components/${name}`, { [name]: () => null },
    ])),
  });
  const Page = load('src/app/(public)/social-media-packages/page.tsx').default;
  let tree = await Page();
  const getSchema = (tree) => find(tree, (node) => node.props?.data?.hasOfferCatalog)[0].props.data;
  let schema = getSchema(tree);
  assert.equal(find(tree, (node) => node.type === Grid)[0].props.packages, packages);
  assert.equal(schema.priceRange, 'AED 4321 - AED 4321 / month');
  const offers = schema.hasOfferCatalog.itemListElement;
  assert.equal(offers.length, 2);
  assert.equal(offers[0].price, '4321');
  assert.equal(offers[0].priceCurrency, 'AED');
  assert.equal(offers[0].itemOffered.name, 'CMS package');
  assert.equal(offers[0].itemOffered.description, 'Updated description');
  assert.equal('price' in offers[1], false);
  for (const next of [[packages[2]], [], [{ ...packages[0], isActive: false }]]) {
    packages = next;
    schema = getSchema(await Page());
    assert.equal(schema.priceRange, undefined);
  }
});

function hookState() {
  const state = [], effects = [];
  let cursor = 0;
  return {
    state, effects, reset: () => { cursor = 0; },
    react: { ...React,
      useEffect: (effect) => effects.push(effect),
      useRef: (current) => ({ current }),
      useMemo: (calculate) => calculate(),
      useState: (initial) => {
        const index = cursor++;
        if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
        return [state[index], (value) => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
      },
    },
  };
}

test('server telemetry including an empty array overrides stale local storage; omitted feed restores it', () => {
  for (const feed of [undefined, [], [{ id: 'server', summary: 'Authoritative' }]]) {
    const hooks = hookState();
    let storageReads = 0;
    const saved = [{ id: 'stale', summary: 'Stale' }];
    const load = loader({
      react: hooks.react,
      '@/components/admin': {},
      '@/lib/actions/broadcast-telemetry-dispatcher': {},
      '@/hooks/useFeedbackAlert': { useFeedbackAlert: () => ({}) },
      './InquiriesManager': { resolveInquiryCategory: () => 'general' },
    }, { window: {}, localStorage: { getItem: () => { storageReads++; return JSON.stringify(saved); } } });
    load('src/features/admin/components/BroadcastManager.tsx').BroadcastManager({ initialTelemetryFeed: feed });
    assert.equal(storageReads, feed === undefined ? 1 : 0);
    assert.deepEqual(JSON.parse(JSON.stringify(hooks.state.find(Array.isArray))), feed ?? saved);
  }
});

test('podcast availability clears a selected unavailable slot, retains free slots, and ignores cancelled requests', async () => {
  for (const mode of ['unavailable', 'free', 'cancelled']) {
    const hooks = hookState(), updates = [];
    let resolve;
    const load = loader({
      react: hooks.react,
      '@/lib/actions/availability-operations': { getStudioSlotAvailability: () => new Promise((done) => { resolve = done; }) },
    });
    const { Step1DateTime } = load('src/features/podcast-booking/components/Step1DateTime.tsx');
    Step1DateTime({ session: { date: '2027-01-01', durationHours: 1, studioKey: 'studio', timeSlot: '5:30 PM' }, onChange: (value) => updates.push(value) });
    const cleanup = hooks.effects[0]();
    if (mode === 'cancelled') cleanup();
    resolve({ unavailableSlots: mode === 'free' ? ['6:00 PM'] : ['5:30 PM'] });
    await Promise.resolve();
    assert.deepEqual(JSON.parse(JSON.stringify(updates)), mode === 'unavailable' ? [{ timeSlot: '' }] : []);
  }
});

test('every studio subcatalog delete confirms first, catches throws, and preserves result feedback', async () => {
  for (const [tab, action] of [
    ['sessions', 'deleteStudioSessionType'], ['crew', 'deleteStudioCrewItem'],
    ['props', 'deleteStudioPropItem'], ['addons', 'deleteStudioAddonItem'],
  ]) {
    for (const mode of ['cancel', 'throw', 'failure', 'success']) {
      const hooks = hookState(), feedback = [], calls = [];
      hooks.react.default = hooks.react;
      const initial = { id: 'first', title: 'First', price: 10 };
      const catalog = { sessionTypes: [initial, { ...initial, id: 'second' }], crewEquipment: [initial], props: [initial], addons: [initial] };
      const updated = { ...catalog, crewEquipment: [], props: [], addons: [], sessionTypes: [catalog.sessionTypes[1]] };
      let confirmations = 0;
      const load = loader({
        react: hooks.react,
        '@/components/admin': {},
        '@/lib/actions/studios-soundstages-operations': {},
        '@/lib/actions/studio-wizard-catalog-operations': { [action]: async (id) => {
          assert.equal(confirmations, 1);
          calls.push(id);
          if (mode === 'throw') throw new Error('Synthetic delete error');
          return mode === 'failure' ? { success: false, error: 'Delete denied' } : { success: true, data: updated, message: 'Removed' };
        } },
        '../hooks/useAdminCrud': { useAdminCrud: () => ({ items: [], showFeedback: (message) => feedback.push(message) }) },
        '../hooks/useAdminFilter': { useAdminFilter: () => ({ filteredData: [], pagination: { paginatedItems: [], totalItems: 0 } }) },
      }, { confirm: () => { confirmations++; return mode !== 'cancel'; } });
      const { StudiosManager } = load('src/features/admin/components/StudiosManager.tsx');
      const render = () => { hooks.reset(); return StudiosManager({ initialStudios: [], initialWizardCatalog: catalog }); };
      render();
      hooks.state[0] = tab;
      const button = find(render(), (node) => node.type === 'button' && node.props.title?.startsWith('Delete'))[0];
      assert.ok(button, tab);
      await button.props.onClick();
      assert.deepEqual(calls, mode === 'cancel' ? [] : ['first']);
      const alerts = find(render(), (node) => node.props?.role === 'alert');
      if (mode === 'throw' || mode === 'failure') {
        assert.equal(alerts.length, 1);
        assert.equal(alerts[0].props.children[0].props.children, mode === 'throw' ? 'Synthetic delete error' : 'Delete denied');
      } else assert.equal(alerts.length, 0);
      assert.deepEqual(feedback, mode === 'success' ? ['Removed'] : []);
      if (mode === 'success') assert.deepEqual(hooks.state.slice(1, 5), [updated.sessionTypes, [], [], []]);
    }
  }
});
