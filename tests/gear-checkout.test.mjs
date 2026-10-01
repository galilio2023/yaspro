import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function loadSource(file, mocks = {}, globals = {}) {
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, console,
    require: (name) => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.startsWith('.')) return loadSource(path.resolve(path.dirname(file), `${name}.ts`), mocks, globals);
      return require(name);
    },
    ...globals,
  });
  return exports;
}
const pricing = loadSource('src/features/gear/lib/cart-pricing.ts');
const { parseCartStorage } = loadSource('src/features/gear/lib/cart-storage.ts');
const item = { id: 'camera', name: 'Camera', category: 'cameras', categoryLabel: 'Cameras', dailyRate: 101.25, specs: [], description: '' };
const dateRange = { pickupDate: '2026-10-01', returnDate: '2026-10-08', totalDays: 7, billingMultiplier: 4, discountPercentage: 43 };

test('cart storage restores valid fields, drops malformed items and optional fields, and canonicalizes pricing', () => {
  const restored = parseCartStorage(JSON.stringify({
    items: [null, { ...item, id: 'bad', dailyRate: '100' }, { ...item, id: 'negative', dailyRate: -1 },
      { ...item, specs: [3] }, { ...item, securityDeposit: 'broken', isKit: 'yes', image: {} }, item],
    dateRange: { ...dateRange, billingMultiplier: 1, discountPercentage: 99 },
    deliveryMethod: 'courier_dubai',
  }));
  assert.equal(restored.items.length, 1);
  assert.equal(restored.items[0].securityDeposit, undefined);
  assert.equal(restored.items[0].image, undefined);
  assert.equal(restored.items[0].isKit, undefined);
  assert.equal(restored.dateRange.billingMultiplier, 4);
  assert.equal(restored.dateRange.discountPercentage, 43);
  assert.equal(pricing.calculateGearCartTotals(restored.items, restored.dateRange, restored.deliveryMethod).grandTotal, 655);
});

test('cart storage handles removal, malformed JSON, invalid dates and delivery without leaking invalid values', () => {
  for (const raw of [null, '{', 'null', '[]', '42']) {
    const restored = parseCartStorage(raw);
    assert.equal(restored.items.length, 0);
    assert.equal(restored.dateRange.totalDays, 1);
    assert.equal(restored.deliveryMethod, 'studio_delivery');
  }
  for (const dates of [null, {}, { ...dateRange, pickupDate: '2026-02-30' },
    { ...dateRange, totalDays: 500 }, { ...dateRange, returnDate: '2025-01-01' },
    { ...dateRange, billingMultiplier: '4' }, { ...dateRange, totalDays: 3 }]) {
    const restored = parseCartStorage(JSON.stringify({ items: [item], dateRange: dates, deliveryMethod: 'invalid' }));
    assert.equal(restored.items.length, 1);
    assert.equal(restored.dateRange.totalDays, 1);
    assert.equal(restored.deliveryMethod, 'studio_delivery');
  }
});

function orderFixture(session = null) {
  const equipment = {};
  const bookings = {};
  const writes = [];
  let reads = 0;
  const limits = loadSource('src/lib/rate-limit.ts', { 'next/headers': { headers: async () => new Map() } });
  const { createGearBookingOrder } = loadSource('src/lib/actions/equipment-gear.ts', {
    '../rate-limit': limits,
    '@/db': { db: {
      select: () => ({ from: (table) => {
        assert.equal(table, equipment);
        reads++;
        return { where: () => ({ limit: async () => [{ ...item, dailyRate: '101.25' }] }) };
      } }),
      insert: (table) => {
        assert.equal(table, bookings, 'guest requests must never create users');
        return { values: (row) => { writes.push(row); return { returning: async () => [{ id: 'booking-id', ...row }] }; } };
      },
      query: { users: { findFirst: () => assert.fail('guest requests must never look up users by email') } },
    } },
    '@/db/schema': { equipment, bookings },
    'drizzle-orm': { eq: () => ({}), desc: () => ({}) },
    'next/cache': { revalidatePath() {} },
    '@/features/gear/data': { GEAR_DATA: [item] },
    '@/lib/utils': { generateBookingReference: () => 'GEAR-TEST' },
    './shared': { isDbAvailable: () => true, isUuid: () => false, getCurrentSession: async () => session },
  });
  const input = { gearIds: ['camera'], customerName: 'Guest User', email: 'existing@example.com', phone: '12345678' };
  return { submit: (overrides = {}) => createGearBookingOrder({ ...input, ...overrides }), writes, reads: () => reads };
}

test('server charges the shared cart price for all duration tiers and delivery methods', async () => {
  for (const days of [1, 2, 3, 4, 6, 7, 8, 10, 14, 365]) {
    for (const method of ['studio_delivery', 'courier_dubai', 'pickup_hub']) {
      const h = orderFixture();
      const result = await h.submit({ durationDays: days, deliveryMethod: method });
      assert.equal(result.success, true);
      const expected = pricing.calculateGearCartTotals([item], { totalDays: days }, method).grandTotal;
      assert.equal(result.data.totalAmount, expected);
      assert.equal(h.writes[0].totalAmount, expected.toFixed(2));
      assert.equal(h.writes[0].userId, null);
    }
  }
});

test('gear orders link only the authenticated session, preserve defaults, and throttle before DB work', async () => {
  const h = orderFixture({ user: { id: 'session-owner' } });
  for (let attempt = 0; attempt < 5; attempt++) assert.equal((await h.submit()).success, true);
  assert.equal(h.writes[0].userId, 'session-owner');
  assert.equal(h.writes[0].durationHours, 24);
  assert.equal(h.writes[0].propsNotes, 'Gear Delivery: studio_delivery');
  assert.equal((await h.submit()).success, false);
  assert.equal(h.writes.length, 5);
  assert.equal(h.reads(), 5);
});

test('gear order rejects unbounded input, unsupported delivery and invalid calendar dates before DB access', async () => {
  for (const input of [
    { durationDays: 0 }, { durationDays: 366 }, { durationDays: Infinity }, { durationDays: 1.5 },
    { gearIds: [] }, { gearIds: Array(101).fill('camera') }, { deliveryMethod: 'dubai_courier' },
    { startDate: '2026-02-30' }, { startDate: 'tomorrow' }, { startDate: '2026-10-01T00:00:00Z' },
  ]) {
    const h = orderFixture();
    assert.equal((await h.submit(input)).success, false);
    assert.equal(h.reads(), 0);
    assert.equal(h.writes.length, 0);
  }
  assert.equal((await orderFixture().submit({ startDate: '2028-02-29' })).success, true);
});
