import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { NextRequest, NextResponse } from 'next/server.js';

const exports = {};
const { outputText } = ts.transpileModule(fs.readFileSync('src/proxy.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
vm.runInNewContext(outputText, { exports, Headers, require: () => ({ NextResponse }) });

test('proxy protects enterprise routes and only strips complete locale segments', () => {
  for (const path of ['/enterprise/portal', '/enterprise/portal/reports', '/en/enterprise/portal', '/ar/admin', '/en/portal']) {
    const response = exports.proxy(new NextRequest(`https://example.com${path}`));
    const redirect = new URL(response.headers.get('location'));
    assert.equal(redirect.pathname, '/login');
    assert.equal(redirect.searchParams.get('callbackUrl'), path);
  }
  for (const path of ['/enterprise', '/english', '/arena', '/ar', '/en']) {
    assert.equal(exports.proxy(new NextRequest(`https://example.com${path}`)).headers.get('location'), null);
  }
  const authenticated = new NextRequest('https://example.com/enterprise/portal', { headers: { cookie: 'better-auth.session_token=test' } });
  assert.equal(exports.proxy(authenticated).headers.get('location'), null);
});
