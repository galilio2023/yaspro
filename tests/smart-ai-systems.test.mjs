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
    process: { env: {} },
    ...globals,
  });
  return exports;
}

const sanitizeModule = loadSource('src/lib/ai/sanitize.ts');

const wpInventoryModule = loadSource('src/features/gear/wordpress-inventory.ts', { './types': {} });
const gearDataModule = loadSource('src/features/gear/data.ts', {
  './types': {},
  './wordpress-inventory': wpInventoryModule,
});
const compatibilityModule = loadSource('src/features/gear/lib/compatibility.ts', {
  '../data': gearDataModule,
  '../types': {},
});

const mawthooqAuditorModule = loadSource('src/lib/ai/mawthooq-auditor.ts', {
  './sanitize': sanitizeModule,
  '@ai-sdk/google': { google: () => ({}) },
  'ai': { generateObject: async () => ({}) },
  'zod': loadDependency('zod'),
});

const aiKitMatcherModule = loadSource('src/lib/ai/ai-kit-matcher.ts', {
  '@/features/gear/data': gearDataModule,
  '@/features/gear/types': {},
  '@/features/gear/lib/compatibility': compatibilityModule,
  './sanitize': sanitizeModule,
  '@ai-sdk/google': { google: () => ({}) },
  'ai': { generateObject: async () => ({}) },
  'zod': loadDependency('zod'),
});

// Tests for Mawthooq Auditor
test('Mawthooq Auditor: clears fully compliant ad copy with #إعلان and Mawthooq license', async () => {
  const report = await mawthooqAuditorModule.auditMawthooqCompliance({
    scriptOrCopy: '#إعلان - احجز تصوير إعلانك التجاري في استوديوهات Yas Pro المتطورة في الرياض بأفضل تقنيات الإنتاج الافتراضي.',
    targetMarket: 'KSA',
    creatorMawthooqNumber: 'GAMR-MWQ-882910-KSA',
  });

  assert.equal(report.status, 'compliant');
  assert.ok(report.complianceScore >= 85, `Score should be >= 85, got ${report.complianceScore}`);
  assert.equal(report.disclosureStatus.hasMandatoryDisclosure, true);
  assert.ok(report.disclosureStatus.detectedDisclosureTags.includes('#إعلان'));
  assert.equal(report.flaggedTerms.length, 0, 'No phrases should be flagged');
});

test('Mawthooq Auditor: flags prohibited crypto/forex claims and missing ad disclosure', async () => {
  const report = await mawthooqAuditorModule.auditMawthooqCompliance({
    scriptOrCopy: 'تداول فوركس وعملات رقمية وحقق أرباح مضمونة 100% مع أفضل منصة بدون شروط.',
    targetMarket: 'KSA',
  });

  assert.equal(report.status, 'non_compliant');
  assert.ok(report.complianceScore < 60, `Score should reflect critical violations, got ${report.complianceScore}`);
  assert.equal(report.disclosureStatus.hasMandatoryDisclosure, false);
  assert.ok(report.flaggedTerms.length >= 2, 'Should flag financial trading and unverified guarantee claims');
  assert.ok(report.regulatoryChecks.some((c) => !c.passed && c.severity === 'critical'));
});

// Tests for AI Kit Matcher
test('AI Kit Matcher: configures prestige anamorphic cinema package with discount', async () => {
  const kit = await aiKitMatcherModule.matchGearPackage(
    'Anamorphic commercial cinema shoot with large format camera and anamorphic glass'
  );

  assert.ok(kit.packageTitle.toLowerCase().includes('anamorphic') || kit.packageTitle.toLowerCase().includes('cinema'));
  assert.ok(kit.items.length >= 2, 'Should recommend at least camera/bundle and lenses/lights');
  assert.ok(kit.packageDailyRate < kit.totalDailyRate, 'Package bundle discount must reduce total daily rate');
  assert.equal(kit.packageSavings, kit.totalDailyRate - kit.packageDailyRate);

  // Check anti-hallucination: all items must exist in GEAR_DATA
  for (const item of kit.items) {
    assert.ok(gearDataModule.GEAR_DATA.some((g) => g.id === item.item.id), `Item ${item.item.id} must be in catalog`);
  }
});

test('AI Kit Matcher: configures run & gun documentary kit with mobile camera and wireless audio', async () => {
  const kit = await aiKitMatcherModule.matchGearPackage(
    'Fast run and gun documentary interview on location'
  );

  assert.ok(kit.packageTitle.toLowerCase().includes('run') || kit.packageTitle.toLowerCase().includes('operator') || kit.packageTitle.toLowerCase().includes('doc'));
  assert.ok(kit.items.some((i) => i.item.id.includes('fx6') || i.item.category === 'bundles' || i.item.category === 'cameras'));
  assert.ok(kit.items.some((i) => i.item.category === 'audio' || i.item.category === 'bundles'));
});

test('AI Kit Matcher: respects max daily budget constraints', async () => {
  const maxBudget = 2500;
  const kit = await aiKitMatcherModule.matchGearPackage('commercial video', maxBudget);

  assert.ok(kit.totalDailyRate <= maxBudget || kit.items.length === 1, 'Total rate should respect budget ceiling');
});
