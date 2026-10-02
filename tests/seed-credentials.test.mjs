import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

for (const [env, expectedPassword] of [
  [{}, undefined],
  [{ INITIAL_ADMIN_PASSWORD: '', ADMIN_SEED_PASSWORD: '' }, undefined],
  [{ INITIAL_ADMIN_PASSWORD: 'synthetic-primary', ADMIN_SEED_PASSWORD: 'synthetic-secondary' }, 'synthetic-primary'],
  [{ ADMIN_SEED_PASSWORD: 'synthetic-secondary' }, 'synthetic-secondary'],
]) {
  test(`seed requires explicit credentials and preserves precedence (${Object.keys(env).join(',') || 'missing'})`, async () => {
    let writes = 0;
    const hashes = [];
    const errors = [];
    const exits = [];
    const mocks = {
      '@neondatabase/serverless': { neon: () => ({}) },
      'drizzle-orm/neon-http': { drizzle: () => ({ insert: () => {
        writes++;
        return { values: () => ({ onConflictDoNothing: async () => {} }) };
      } }) },
      './schema': {},
      'drizzle-orm': {},
      dotenv: { config() {} },
      'better-auth/crypto': { hashPassword: async (password) => {
        hashes.push(password);
        throw new Error('Stop fixture before account writes');
      } },
      '../features/projects/data': { PROJECTS_DATA: [] },
      '../features/influencers/data': { INFLUENCERS_DATA: [] },
      '../features/gear/data': { GEAR_DATA: [] },
    };
    const { outputText } = ts.transpileModule(fs.readFileSync('src/db/seed.ts', 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    });
    vm.runInNewContext(outputText, {
      exports: {}, require: (name) => {
        assert.ok(Object.hasOwn(mocks, name), `Unexpected dependency: ${name}`);
        return mocks[name];
      },
      process: { env: { DATABASE_URL: 'postgresql://test:local@localhost/db', ...env }, exit: (code) => exits.push(code) },
      console: { log() {}, error: (...args) => errors.push(args.map(String).join(' ')) },
    });
    await new Promise(setImmediate);
    assert.deepEqual(exits, [1]);
    if (expectedPassword === undefined) {
      assert.equal(writes, 0);
      assert.deepEqual(hashes, []);
      assert.match(errors[0], /INITIAL_ADMIN_PASSWORD or ADMIN_SEED_PASSWORD must be set/);
    } else {
      assert.deepEqual(hashes, [expectedPassword]);
    }
  });
}
