import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const noop = () => null;
const wrapper = ({ children }) => React.createElement('div', null, children);
function fixture({ tab = 'catalog', stats = {} } = {}) {
  const cache = new Map();
  let filterOptions;
  const mocks = {
    react: { ...React, useState: (initial) => [initial === 'catalog' ? tab : initial, noop] },
    '@/components/admin': {
      AdminPageHeader: noop, AdminStatsGrid: noop, AdminConfirmModal: noop,
      AdminFilterBar: ({ secondaryFilters }) => secondaryFilters || null,
    },
    '@/components/ui/data-table': {
      DataTable: wrapper, DataTableHeader: noop, DataTableBody: ({ children }) => children,
      DataTableRow: ({ children }) => React.createElement('table', null, React.createElement('tbody', null, React.createElement('tr', null, children))),
      DataTableEmpty: noop,
    },
    '@/components/admin/shared/AdminModal': { AdminModal: noop },
    '@/components/ui/pagination-controls': { PaginationControls: noop },
    '@/hooks/useFeedbackAlert': { useFeedbackAlert: () => ({}) },
    '../hooks/useAdminFilter': { useAdminFilter: (options) => {
      filterOptions = options;
      return { filteredData: [], pagination: { paginatedItems: [] } };
    } },
    './BookingCallSheetModal': { BookingCallSheetModal: noop },
    '@/lib/actions/bookings-rfp-operations': {},
    '@/lib/actions/inquiries-leads-operations': {},
    '@/lib/actions/broadcast-telemetry-dispatcher': {},
    '@/features/admin': { OffersManager: noop },
    '@/lib/cms-actions': { getCmsOverviewStats: async () => stats, getCmsBookings: async () => [] },
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
    'next/image': { default: noop },
    'server-only': {},
  };
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    });
    vm.runInNewContext(outputText, {
      exports, Date, process: { env: {} }, console,
      require: (name) => {
        if (Object.hasOwn(mocks, name)) return mocks[name];
        if (name.startsWith('.') || name.startsWith('@/')) {
          const target = name.startsWith('@/') ? path.resolve('src', name.slice(2)) : path.resolve(path.dirname(file), name);
          return load([`${target}.ts`, `${target}.tsx`].find(fs.existsSync));
        }
        return require(name);
      },
    });
    return exports;
  }
  return { load, get filter() { return filterOptions; } };
}
const inquiry = { id: 'open', name: 'Open client', email: 'open@example.com', phone: '+971500000000', inquiryType: 'general', message: '[Outdoor Filming Request]', createdAt: '2026-10-15T10:00:00Z', isResolved: false };

test('booking search finds displayed package labels and preserves status/payment filtering', () => {
  const f = fixture();
  const { BookingsManager } = f.load('src/features/admin/components/BookingsManager.tsx');
  renderToStaticMarkup(React.createElement(BookingsManager, { initialBookings: [] }));
  const booking = { referenceCode: 'YAS-OFR-1', sessionType: 'video', packageName: 'Creator Package', status: 'pending', paymentStatus: 'unpaid' };
  assert.equal(f.filter.predicate(booking, 'creator package', 'all', 'all'), true);
  assert.equal(f.filter.predicate(booking, 'creator package', 'confirmed', 'all'), false);
  assert.equal(f.filter.predicate(booking, 'creator package', 'all', 'paid'), false);
});

test('inquiries match resolved categories and offer a live broadcast filter', () => {
  const f = fixture();
  const { InquiriesManager } = f.load('src/features/admin/components/InquiriesManager.tsx');
  const html = renderToStaticMarkup(React.createElement(InquiriesManager, { initialInquiries: [] }));
  assert.equal(f.filter.initialSecondaryFilter, 'all');
  assert.equal(f.filter.predicate(inquiry, '', 'all', 'outdoor_filming'), true);
  assert.equal(f.filter.predicate(inquiry, '', 'all', 'general'), false);
  assert.equal(f.filter.predicate({ ...inquiry, message: '', inquiryType: 'live_broadcast' }, '', 'open', 'live_broadcast'), true);
  assert.match(html, /value="live_broadcast"/);
});

test('broadcast cards omit resolved RFPs before limiting and reuse resolved labels in follow-ups', () => {
  const f = fixture();
  const { BroadcastManager } = f.load('src/features/admin/components/BroadcastManager.tsx');
  const inquiries = [
    ...Array.from({ length: 4 }, (_, id) => ({ ...inquiry, id: `resolved-${id}`, name: 'Resolved client', isResolved: true })),
    ...Array.from({ length: 5 }, (_, id) => ({ ...inquiry, id: `open-${id}`, name: `Open client ${id}` })),
  ];
  const html = renderToStaticMarkup(React.createElement(BroadcastManager, { initialBroadcastInquiries: inquiries }));
  assert.match(html, /Production RFPs \(5\)/);
  assert.doesNotMatch(html, /Resolved client|Open client 4/);
  assert.match(html, /Open client 3/);
  assert.match(html, />Outdoor Filming<\/span>/);
  assert.match(html, /href="\/admin\/inquiries"/);
  const url = new URL(html.match(/href="(https:\/\/wa.me\/[^\"]+)"/)[1]);
  assert.match(url.searchParams.get('text'), /your Outdoor Filming inquiry/);
});

test('offers log omits podcast packages and formats dates on the Dubai calendar', () => {
  const f = fixture({ tab: 'bookings' });
  const { OffersManager } = f.load('src/features/admin/components/OffersManager.tsx');
  const booking = { id: 'offer', referenceCode: 'YAS-OFR-1', packageName: 'Offer Bundle', scheduledAt: '2026-10-14T21:00:00Z', totalAmount: '100', status: 'pending', paymentStatus: 'unpaid' };
  const html = renderToStaticMarkup(React.createElement(OffersManager, {
    initialBookings: [booking, { ...booking, id: 'podcast', referenceCode: 'POD-1', packageName: 'Podcast Bundle' }], promoCodes: [],
  }));
  assert.match(html, /YAS-OFR-1/);
  assert.doesNotMatch(html, /POD-1|Podcast Bundle/);
  assert.match(html, /Oct 15, 2026/);
});

test('admin promo eligibility follows shared checkout rules', async () => {
  const f = fixture();
  const { OFFERS_PROMO_CODES } = f.load('src/features/offers/promo-codes.ts');
  const { default: Page } = f.load('src/app/(admin)/admin/offers/page.tsx');
  let result = await Page();
  assert.equal(result.props.promoCodes.length, 3);
  assert.ok(result.props.promoCodes.every((promo) => promo.eligibility === 'All valid offers & bundles'));
  OFFERS_PROMO_CODES.CREATOR20.eligibleOfferIds = ['student-fund'];
  result = await Page();
  const restricted = result.props.promoCodes.find((promo) => promo.code === 'CREATOR20');
  const offer = f.load('src/features/offers/data.ts').OFFERS_AND_BUNDLES.find((item) => item.id === 'student-fund');
  assert.equal(restricted.eligibility, offer.name);
});
