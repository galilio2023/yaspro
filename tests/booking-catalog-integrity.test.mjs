import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import * as React from 'react';

const require = createRequire(import.meta.url);
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
      exports, Date, console: { error() {}, warn() {} }, process: { env: {} },
      require: (name) => {
        if (Object.hasOwn(mocks, name)) return mocks[name];
        if (name === 'server-only') return {};
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
      return { onConflictDoNothing: () => run(), onConflictDoUpdate: (update) => run(update) };
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
  return { load, schema, tables, get seedTransactions() { return seedTransactions; } };
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
    else assert.equal(row, undefined);
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
    '../shared/AdminFormFields': { AdminInput: Input, AdminSwitch: Switch, AdminSelect: Input },
  });
  const Component = Object.values(load(file))[0];
  const render = () => {
    cursor = 0;
    const outer = Component({ isOpen: true, onClose() {}, ...props });
    return outer.type(outer.props);
  };
  return { render, Input, Switch, Modal };
}

test('blackout wall times and all-day boundaries serialize local instants in east/west time zones and DST', async () => {
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
      assert.equal(saves[0].startTime, new Date(2026, 2, 8, 9, 30).toISOString());
      assert.equal(saves[0].endTime, new Date(2026, 2, 8, 18, 15).toISOString());
      find(f.render(), (node) => node.type === f.Switch)[0].props.onChange(true);
      await find(f.render(), (node) => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
      assert.equal(saves[1].startTime, new Date(2026, 2, 8).toISOString());
      assert.equal(saves[1].endTime, new Date(2026, 2, 8, 23, 59, 59).toISOString());
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

test('checkout loads platform settings when omitted, merges defaults, and respects caller overrides', async () => {
  const effects = [];
  const states = [];
  let cursor = 0, reads = 0;
  const load = loader({
    react: { ...React, useEffect: (effect) => effects.push(effect), useRef: () => ({ current: null }), useState: (initial) => {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], (value) => { states[index] = value; }];
    } },
    'react-dom': { createPortal: (tree) => tree },
    '@/hooks/useFocusTrap': { useFocusTrap() {} },
    '@/lib/payment-actions': {}, '@/lib/ziina': {},
    '@/lib/actions/platform-settings-operations': { getPlatformSettings: async () => { reads++; return { bankName: 'CMS Bank', iban: 'CMS IBAN', depositPercent: 25 }; } },
    '@/components/providers/LanguageProvider': { useLanguage: () => ({ isArabic: false }) },
    '@/lib/utils': { cn: (...values) => values.join(' '), formatCurrency: String },
  }, { document: { body: {} } });
  const { BookingPaymentModal } = load('src/features/booking/components/BookingPaymentModal.tsx');
  const render = (props = {}) => {
    cursor = 0;
    effects.length = 0;
    return BookingPaymentModal({ isOpen: true, totalAmount: 1000, onClose() {}, ...props });
  };
  render();
  const cleanup = effects[0]();
  await Promise.resolve();
  let tree = render();
  find(tree, (node) => node.type === 'button' && typeof node.props.children === 'object' && find(node, (child) => child.type === 'span' && child.props.children === 'Bank').length > 0)[0].props.onClick();
  tree = render();
  assert.ok(find(tree, (node) => node.props?.children === 'CMS IBAN').length > 0);
  assert.ok(find(tree, (node) => node.props?.children === 'YAS PRO MEDIA PRODUCTION LLC').length > 0);
  assert.ok(find(tree, (node) => node.props?.children === '250').length > 0);
  cleanup();
  tree = render({ paymentSettings: { iban: 'Caller IBAN' } });
  effects[0]();
  assert.equal(reads, 1);
  assert.ok(find(tree, (node) => node.props?.children === 'Caller IBAN').length > 0);
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
