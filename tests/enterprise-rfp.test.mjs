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
    console: { error() {} },
    process: { env: { DATABASE_URL: 'postgresql://test:local@localhost/rfp' } },
    ...globals,
  });
  return exports;
}

const { enterpriseRfpSchema } = loadSource('src/lib/validations.ts');
const validInput = {
  organizationName: 'Example Organization', organizationType: 'government_ministry',
  contactName: 'Test Contact', workEmail: 'test@example.com', phone: '+971500000000',
  country: 'UAE', projectScope: 'virtual_production_xr', estimatedBudget: '150k_to_500k',
};

function actionHarness(results, env = { DATABASE_URL: 'postgresql://test:local@localhost/rfp' }) {
  const inserts = [];
  const revalidated = [];
  const table = { referenceCode: Symbol('referenceCode') };
  const db = {
    insert(target) {
      assert.equal(target, table);
      return { values(value) {
        inserts.push(value);
        return { onConflictDoNothing({ target }) {
          assert.equal(target, table.referenceCode);
          return { async returning() {
            const result = results.shift();
            if (result instanceof Error) throw result;
            if (typeof result === 'function') return result(value);
            return result === 'success' ? [{ referenceCode: value.referenceCode }] : [];
          } };
        } };
      } };
    },
  };
  let random = 0;
  const { submitEnterpriseRfp } = loadSource('src/lib/actions.ts', {
    '@/db': { db }, '@/db/schema': { enterpriseRfps: table }, '@/lib/utils': {},
    'next/cache': { revalidatePath: (value) => revalidated.push(value) },
    './validations': { enterpriseRfpSchema }, '@/features/booking/constants': {},
    '@/lib/auth': { auth: { api: { getSession: async () => null } } },
    'next/headers': { headers: async () => new Headers() },
  }, { process: { env }, Math: { floor: Math.floor, random: () => (random++ % 10) / 10 } });
  return { submit: submitEnterpriseRfp, inserts, revalidated };
}

test('payload bounds accept limits, reject oversize entries and preserve defaults', () => {
  const parsed = enterpriseRfpSchema.parse(validInput);
  assert.deepEqual(parsed.targetLocations, []);
  assert.deepEqual(parsed.selectedCreators, []);
  assert.equal(parsed.digitalTwinEnvironment, '');
  for (const field of ['targetLocations', 'selectedCreators']) {
    assert.equal(enterpriseRfpSchema.safeParse({ ...validInput, [field]: Array(20).fill('x'.repeat(100)) }).success, true);
    assert.equal(enterpriseRfpSchema.safeParse({ ...validInput, [field]: Array(21).fill('x') }).success, false);
    assert.equal(enterpriseRfpSchema.safeParse({ ...validInput, [field]: ['x'.repeat(101)] }).success, false);
  }
  assert.equal(enterpriseRfpSchema.safeParse({ ...validInput, digitalTwinEnvironment: 'x'.repeat(200) }).success, true);
  assert.equal(enterpriseRfpSchema.safeParse({ ...validInput, digitalTwinEnvironment: 'x'.repeat(201) }).success, false);
});

test('invalid input and missing configuration never insert or issue a receipt', async () => {
  for (const [input, env] of [[{}, { DATABASE_URL: 'configured' }], [validInput, {}], [validInput, { DATABASE_URL: 'ep-xxx' }]]) {
    const h = actionHarness([], env);
    const result = await h.submit(input);
    assert.equal(result.success, false);
    assert.equal(result.referenceCode, undefined);
    assert.equal(result.data, undefined);
    assert.equal(h.inserts.length, 0);
    assert.equal(h.revalidated.length, 0);
  }
});

test('failed inserts and exhausted reference retries return failure without a receipt', async () => {
  for (const results of [[new Error('database unavailable')], Array(10).fill([])]) {
    const expectedAttempts = results.length;
    const h = actionHarness(results);
    const result = await h.submit(validInput);
    assert.equal(result.success, false);
    assert.equal(result.referenceCode, undefined);
    assert.equal(result.data, undefined);
    assert.doesNotMatch(result.message, /received/i);
    assert.equal(h.inserts.length, expectedAttempts);
    assert.equal(h.revalidated.length, 0);
  }
});

test('reference collisions retry and return only the persisted code with country suffix', async () => {
  for (const [country, suffix] of [['Saudi Arabia', 'KSA'], ['Egypt', 'CAI'], ['UAE', 'DXB'], ['International', 'DXB']]) {
    const h = actionHarness([[], 'success']);
    const result = await h.submit({ ...validInput, country, targetLocations: ['Cairo'] });
    assert.equal(result.success, true);
    assert.equal(h.inserts.length, 2);
    assert.notEqual(h.inserts[0].referenceCode, result.referenceCode);
    assert.equal(result.referenceCode, h.inserts[1].referenceCode);
    assert.equal(result.data.referenceCode, result.referenceCode);
    assert.match(result.referenceCode, new RegExp(`^EXP-[1-9][0-9]{3}-${suffix}$`));
    assert.deepEqual(h.inserts[1].targetLocations, ['Cairo']);
    assert.deepEqual(h.revalidated, ['/enterprise']);
  }
});

test('success waits for the insert to finish', async () => {
  let finish;
  const h = actionHarness([(value) => new Promise((resolve) => { finish = () => resolve([value]); })]);
  let returned = false;
  const pending = h.submit(validInput).then((value) => { returned = true; return value; });
  await Promise.resolve();
  assert.equal(returned, false);
  assert.equal(h.revalidated.length, 0);
  finish();
  assert.equal((await pending).success, true);
});

test('database configuration is lazy and initialization errors stay catchable', () => {
  let attempts = 0;
  const { db } = loadSource('src/db/index.ts', {
    'server-only': {}, './schema': {}, 'drizzle-orm/neon-http': {},
    '@neondatabase/serverless': { neon() { attempts++; throw new Error('invalid database URL'); } },
  }, { process: { env: {} } });
  assert.equal(attempts, 0);
  assert.throws(() => db.insert, /invalid database URL/);
  assert.equal(attempts, 1);
});
