import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const dependency = createRequire(import.meta.url);
const { outputText } = ts.transpileModule(fs.readFileSync('src/app/(public)/services/ServicesPageClient.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
});

function nodes(element) {
  if (!element || typeof element !== 'object') return [];
  if (Array.isArray(element)) return element.flatMap(nodes);
  return [element, ...nodes(element.props?.children)];
}

function fixture(submitInquiry = async () => ({ success: true }), isArabic = false) {
  const states = [];
  let cursor = 0;
  let trap;
  const mocks = {
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [states[index], (value) => { states[index] = value; }];
      },
      useRef(initial) {
        const index = cursor++;
        if (!(index in states)) states[index] = { current: initial };
        return states[index];
      },
      useId: () => 'inquiry-test',
    },
    'next/image': { default: 'img' },
    'next/link': { default: 'a' },
    'framer-motion': { motion: { article: 'article', div: 'div' }, AnimatePresence: 'presence' },
    '@/components/providers/LanguageProvider': {
      useLanguage: () => {
        const dict = JSON.parse(fs.readFileSync(isArabic ? 'messages/ar.json' : 'messages/en.json', 'utf8'));
        return {
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
        };
      },
    },
    '@/lib/studio-motion': { studioSprings: { cinematic: {} } },
    '@/lib/actions': { submitInquiry },
    '@/hooks/useFocusTrap': { useFocusTrap: (options) => { trap = options; } },
    '@/lib/utils': { cn: (...values) => values.filter((value) => typeof value === 'string').join(' ') },
  };
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : dependency(name),
  });
  const render = () => { cursor = 0; return nodes(exports.ServicesPageClient()); };
  const find = (predicate) => {
    const element = render().find(predicate);
    assert.ok(element, 'Expected control to be rendered');
    return element;
  };
  return {
    render, find,
    open: (index = 0) => render().filter((node) => node.type === 'button' && nodes(node).some((child) =>
      ['Request Filming Quote', 'Request OB-VAN Dispatch', 'طلب استشارة وعرض سعر', 'طلب حجز عربة البث'].includes(child.props?.children)
    ))[index].props.onClick(),
    close: () => { render(); trap.onClose(); },
    fill: (type, value) => find((node) => node.type === type || node.props?.type === type).props.onChange({ target: { value } }),
    submit: () => find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} }),
    submitting: () => find((node) => node.props?.type === 'submit').props.disabled,
  };
}

test('Escape uses the reset path and clears contact fields, requirements and errors', async () => {
  const f = fixture();
  f.open();
  for (const type of ['text', 'email', 'tel', 'textarea']) f.fill(type, 'draft');
  await f.submit();
  assert.ok(f.render().some((node) => node.props?.children === 'Please describe your project requirements in at least 10 characters.'));
  f.close();
  assert.equal(f.render().some((node) => node.props?.role === 'dialog'), false);
  f.open();
  for (const type of ['text', 'email', 'tel', 'textarea']) {
    assert.equal(f.find((node) => node.type === type || node.props?.type === type).props.value, '');
  }
  assert.equal(f.submitting(), false);
  assert.equal(f.render().some((node) => node.props?.children === 'Please describe your project requirements in at least 10 characters.'), false);
});

test('preset subjects cannot satisfy the trimmed description minimum', async () => {
  const calls = [];
  const f = fixture(async (input) => { calls.push(input); return { success: true }; });
  f.open();
  for (const description of ['', '   \n\t  ', '123456789', ' 123456789 ']) {
    f.fill('textarea', description);
    await f.submit();
    assert.equal(calls.length, 0);
    assert.equal(f.submitting(), false);
  }
  f.fill('textarea', '  1234567890  ');
  await f.submit();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].message, `[Subject: ${calls[0].subject}]\n\n1234567890`);
  assert.ok(f.render().some((node) => ['Inquiry Received Successfully!', 'Message Received Successfully', 'تم استلام طلبك بنجاح'].includes(node.props?.children)));
});

for (const outcome of ['success', 'failure', 'exception']) {
  for (const closeFirst of [true, false]) {
    test(`stale ${outcome} cannot update a new inquiry (${closeFirst ? 'close then reopen' : 'open another service'})`, async () => {
      const requests = [];
      const f = fixture(() => new Promise((resolve, reject) => { requests.push({ resolve, reject }); }));
      f.open();
      f.fill('textarea', 'A live production with multiple cameras.');
      const oldSubmission = f.submit();
      assert.equal(f.submitting(), true);
      if (closeFirst) f.close();
      f.open(1);
      assert.equal(f.submitting(), false);
      f.fill('textarea', 'An outdoor shoot with a full camera crew.');
      const newSubmission = f.submit();
      if (outcome === 'exception') requests[0].reject(new Error('old failure'));
      else requests[0].resolve({ success: outcome === 'success', message: 'old failure' });
      await oldSubmission;
      assert.equal(f.submitting(), true, 'stale completion must not clear current loading state');
      assert.equal(f.render().some((node) => ['old failure', 'An unexpected error occurred. Please try again.', 'Inquiry Received Successfully!', 'Message Received Successfully', 'تم استلام طلبك بنجاح'].includes(node.props?.children)), false);
      requests[1].resolve({ success: true });
      await newSubmission;
      assert.ok(f.render().some((node) => ['Inquiry Received Successfully!', 'Message Received Successfully', 'تم استلام طلبك بنجاح'].includes(node.props?.children)));
    });
  }
}

test('current failures clear loading and allow retry', async () => {
  let attempts = 0;
  const f = fixture(async () => {
    attempts += 1;
    if (attempts === 1) throw new Error('network');
    return { success: false, message: 'Please retry this request.' };
  });
  f.open();
  f.fill('textarea', 'A live production with multiple cameras.');
  await f.submit();
  assert.equal(f.submitting(), false);
  assert.ok(f.render().some((node) => node.props?.children === 'An unexpected error occurred. Please try again.'));
  await f.submit();
  assert.equal(f.submitting(), false);
  assert.ok(f.render().some((node) => node.props?.children === 'Please retry this request.'));
});

test('close has a localized accessible name and visible labels match stable control IDs', () => {
  for (const isArabic of [false, true]) {
    const f = fixture(undefined, isArabic);
    f.open();
    assert.ok(f.find((node) => node.type === 'button' && node.props['aria-label'] === (isArabic ? 'إغلاق' : 'Close')));
    const labels = f.render().filter((node) => node.type === 'label');
    assert.equal(labels.length, 6);
    const ids = labels.map((label) => label.props.htmlFor);
    assert.equal(new Set(ids).size, 6);
    for (const id of ids) {
      assert.ok(id);
      const control = f.find((node) => node.props?.id === id);
      assert.ok(['input', 'textarea', 'select'].includes(control.type));
    }
    f.close();
    f.open();
    assert.deepEqual(f.render().filter((node) => node.type === 'label').map((label) => label.props.htmlFor), ids);
  }
});
