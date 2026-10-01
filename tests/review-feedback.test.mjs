import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function loadSource(file, mocks, globals = {}) {
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, Error, Date, setTimeout: () => 1, clearTimeout() {},
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    ...globals,
  });
  return exports;
}

// Keep hook state between explicit renders, with effects committed separately.
function hookHarness() {
  const slots = [];
  let cursor = 0;
  let effects = [];
  const cleanups = [];
  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], (next) => {
        slots[index] = typeof next === 'function' ? next(slots[index]) : next;
      }];
    },
    useRef(initial) {
      const index = cursor++;
      return slots[index] ??= { current: initial };
    },
    useCallback: (fn) => fn,
    useMemo: (fn) => fn(),
    useEffect(effect) { effects.push(effect); },
  };
  return {
    hooks,
    render(fn) { cursor = 0; effects = []; return fn(); },
    commit() { for (const effect of effects) cleanups.push(effect()); effects = []; },
    unmount() { for (const cleanup of cleanups) cleanup?.(); },
  };
}

function nodes(tree, predicate) {
  if (Array.isArray(tree)) return tree.flatMap((child) => nodes(child, predicate));
  if (!tree || typeof tree !== 'object') return [];
  return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}

const managers = [
  ['GearManager', 'initialEquipment', 'upsertCmsEquipment', 'Edit Equipment', { name: 'Camera', dailyRate: '10', category: 'cameras' }],
  ['InfluencersManager', 'initialInfluencers', 'upsertCmsInfluencer', 'Edit Creator', { name: 'Creator' }],
  ['ProjectsManager', 'initialProjects', 'upsertCmsProject', 'Edit Project', { title: 'Project' }],
  ['StudiosManager', 'initialStudios', 'upsertCmsStudio', undefined, { name: 'Studio', hourlyRate: '10' }],
];

function managerFixture([name, prop, action, editTitle, fields], save, rowOverrides = {}) {
  const harness = hookHarness();
  const alerts = [];
  const mocks = {
    react: harness.hooks,
    'next/image': 'Image',
    'lucide-react': new Proxy({}, { get: (_, key) => key }),
    '@/lib/cms-actions': { [action]: save },
    '@/lib/actions/equipment-gear': { [action]: save },
    '@/lib/actions/influencers': { [action]: save },
    '@/lib/actions/projects': { [action]: save },
    '@/lib/actions/studios-soundstages-operations': { [action]: save },
    '@/lib/utils': { formatCurrency: String },
    '@/components/ui/dialog': { Dialog: 'Dialog' },
    '@/components/ui/feedback-alert': { FeedbackAlert: 'FeedbackAlert' },
    '@/components/admin/AdminImageUploader': { AdminImageUploader: 'Uploader' },
  };
  mocks['@/hooks/useFeedbackAlert'] = loadSource('src/hooks/useFeedbackAlert.ts', mocks);
  mocks['@/hooks/useCrud'] = loadSource('src/hooks/useCrud.ts', mocks);
  const Component = loadSource(`src/features/admin/components/${name}.tsx`, mocks, {
    alert: (message) => alerts.push(message),
  })[name];
  const row = { id: 'existing', slug: 'old-slug', ...fields, ...rowOverrides };
  const render = () => harness.render(() => Component({ [prop]: [row] }));
  const tree = render();
  const edit = nodes(tree, (node) => node.type === 'button' && (
    editTitle ? node.props.title === editTitle : nodes(node, (n) => n.type === 'span' && n.props.children === 'Edit Stage Specs').length
  ))[0];
  assert.ok(edit, `edit button for ${name}`);
  edit.props.onClick();
  return { render, alerts };
}

for (const manager of managers) {
  for (const mode of ['returned', 'rejected']) {
    test(`${manager[0]} reports ${mode} save errors and allows retry`, async () => {
      let fail;
      const fixture = managerFixture(manager, () => new Promise((resolve, reject) => {
        fail = () => mode === 'returned'
          ? resolve({ success: false, error: 'Save failed' }) : reject(new Error('Save failed'));
      }));
      const submit = () => nodes(fixture.render(), (n) => n.type === 'button' && n.props.type === 'submit')[0];
      const form = nodes(fixture.render(), (n) => n.type === 'form')[0];
      const saving = form.props.onSubmit({ preventDefault() {} });
      assert.equal(submit().props.disabled, true);
      fail();
      await saving;
      assert.equal(submit().props.disabled, false);
      const feedback = nodes(fixture.render(), (n) => n.type === 'FeedbackAlert');
      if (manager[0] === 'StudiosManager') {
        assert.deepEqual(fixture.alerts, ['Save failed']);
        assert.equal(feedback.length, 0);
      } else {
        assert.equal(feedback.length, 1);
        assert.equal(feedback[0].props.type, 'error');
        assert.equal(feedback[0].props.message, 'Save failed');
      }
      assert.equal(nodes(fixture.render(), (n) => n.type === 'form').length, 1);
    });
  }
}

for (const manager of managers.slice(1, 3)) {
  for (const hasId of [true, false]) {
    test(`${manager[0]} updates one row using ${hasId ? 'ID after a slug edit' : 'slug without an ID'}`, async () => {
      const fixture = managerFixture(manager, async () => ({ success: true }), hasId ? {} : { id: undefined });
      if (hasId) {
        const input = nodes(fixture.render(), (n) => n.type === 'input' && n.props.value === 'old-slug')[0];
        input.props.onChange({ target: { value: 'new-slug' } });
      }
      await nodes(fixture.render(), (n) => n.type === 'form')[0].props.onSubmit({ preventDefault() {} });
      assert.equal(nodes(fixture.render(), (n) => n.type === 'tr').length, 2, 'header and one updated row');
    });
  }
}

function audioFixture(withSpeech = false) {
  const harness = hookHarness();
  const contexts = [];
  const oscillators = [];
  const utterances = [];
  class AudioContext {
    state = 'running';
    currentTime = 0;
    constructor() { contexts.push(this); }
    createOscillator() {
      const oscillator = {
        frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {}, disconnect() {}, start() {}, stops: [],
        stop(time) { this.stops.push(time); },
      };
      oscillators.push(oscillator);
      return oscillator;
    }
    createGain() {
      return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} };
    }
    async close() { this.state = 'closed'; }
  }
  const window = { AudioContext };
  if (withSpeech) window.speechSynthesis = {
    cancel() {}, getVoices: () => [], speak: (utterance) => utterances.push(utterance),
  };
  const { useDialectSpeechPlayer } = loadSource('src/features/enterprise/hooks/useDialectSpeechPlayer.ts', { react: harness.hooks }, {
    window, SpeechSynthesisUtterance: class {}, performance: { now: () => 0 },
    requestAnimationFrame: () => 1, cancelAnimationFrame() {},
  });
  const render = () => harness.render(useDialectSpeechPlayer);
  render();
  harness.commit();
  return { render, contexts, oscillators, utterances, unmount: harness.unmount };
}
const playback = { activeScript: 'Hello', langCode: 'en', selectedTone: 'Warm', words: ['Hello'] };

test('fallback playback reuses its context, stops oscillators, and closes on unmount', () => {
  const audio = audioFixture();
  audio.render().toggleAudio(playback);
  assert.equal(audio.contexts.length, 1);
  audio.render().stopAudio();
  assert.equal(audio.oscillators[0].stops.at(-1), undefined, 'immediate stop');
  audio.render().toggleAudio(playback);
  assert.equal(audio.contexts.length, 1);
  audio.oscillators[0].onended(); // Late cleanup must not clear the new oscillator.
  audio.render().stopAudio();
  assert.equal(audio.oscillators[1].stops.at(-1), undefined);
  audio.contexts[0].state = 'closed';
  audio.render().toggleAudio(playback);
  assert.equal(audio.contexts.length, 2);
  audio.unmount();
  assert.equal(audio.contexts[1].state, 'closed');
  assert.equal(audio.oscillators[2].stops.at(-1), undefined);
});

test('stale speech callbacks and cancellation errors cannot restart or stop playback', () => {
  const audio = audioFixture(true);
  audio.render().toggleAudio(playback);
  const stale = audio.utterances[0];
  audio.render().stopAudio();
  audio.render().toggleAudio(playback);
  stale.onerror({ error: 'network' });
  stale.onend();
  assert.equal(audio.render().isPlayingAudio, true);
  for (const error of ['canceled', 'interrupted']) audio.utterances[1].onerror({ error });
  assert.equal(audio.contexts.length, 0);
  audio.utterances[1].onerror({ error: 'network' });
  assert.equal(audio.contexts.length, 1);
});

test('previous page moves back from the rendered page after the list shrinks', () => {
  const harness = hookHarness();
  const { usePagination } = loadSource('src/hooks/usePagination.ts', { react: harness.hooks });
  let items = Array.from({ length: 100 }, (_, i) => i);
  const render = () => harness.render(() => usePagination(items, 10));
  render().setPage(9);
  items = items.slice(0, 30);
  assert.equal(render().currentPage, 2);
  render().prevPage();
  assert.equal(render().currentPage, 1);
  items = [];
  render().prevPage();
  assert.equal(render().currentPage, 0);
});

test('CRUD delete failures report feedback and preserve rows; success removes only the target', async () => {
  for (const outcome of ['rejected', 'unsuccessful', 'success', 'cancelled']) {
    const harness = hookHarness();
    const alerts = [];
    let calls = 0;
    const { useCrud } = loadSource('src/hooks/useCrud.ts', {
      react: harness.hooks,
      '@/hooks/useFeedbackAlert': { useFeedbackAlert: () => ({}) },
    }, { confirm: () => outcome !== 'cancelled', alert: (message) => alerts.push(message) });
    const initialData = [{ id: 'target' }, { id: 'other' }];
    const render = () => harness.render(() => useCrud({
      initialData, getId: (item) => item.id,
      deleteAction: async () => {
        calls++;
        if (outcome === 'rejected') throw new Error('Delete rejected');
        return { success: outcome === 'success', error: 'Delete unsuccessful' };
      },
    }));
    await render().handleDelete('target');
    assert.deepEqual(render().dataList, outcome === 'success' ? [initialData[1]] : initialData);
    assert.deepEqual(alerts, outcome === 'rejected' ? ['Delete rejected'] : outcome === 'unsuccessful' ? ['Delete unsuccessful'] : []);
    assert.equal(calls, outcome === 'cancelled' ? 0 : 1);
  }
});

function gearModalFixture(submit, isArabic = false, globals = {}) {
  const harness = hookHarness();
  const mocks = {
    react: { ...harness.hooks, useSyncExternalStore: (_subscribe, snapshot) => snapshot() },
    'react-dom': { createPortal: (content) => content },
    'next/image': 'Image',
    'lucide-react': new Proxy({}, { get: (_, key) => key }),
    '@/lib/utils': { formatCurrency: String, cn: (...classes) => classes.join(' ') },
    '@/components/providers/LanguageProvider': { useLanguage: () => ({ isArabic }) },
    '@/lib/actions/equipment-gear': {
      submitGearReservation: submit,
      createGearBookingOrder: submit ? async (input) => {
        const res = await submit(input);
        return {
          ...res,
          data: res?.data ? { ...res.data, bookingId: 'b_test_123', totalAmount: 100 } : undefined,
        };
      } : undefined,
    },
    '@/lib/auth-client': { useSession: () => ({ data: null }) },
    '@/features/booking/components/BookingPaymentModal': { BookingPaymentModal: () => null },
    'next/link': ({ children, ...props }) => ({ type: 'a', props: { ...props, children } }),
  };
  const { GearRentalModal } = loadSource('src/features/gear/components/GearRentalModal.tsx', mocks, {
    document: { body: {} }, ...globals,
  });
  const props = {
    item: { id: 'camera', name: 'Camera', category: 'cameras', categoryLabel: 'Cinema', dailyRate: 100, specs: [] },
    isOpen: true, onClose() {},
  };
  const render = () => harness.render(() => GearRentalModal(props));
  const openForm = () => {
    const button = nodes(render(), (node) => node.type === 'button' && String(node.props.onClick).includes('setViewMode("form")'))[0];
    assert.ok(button);
    button.props.onClick();
    return render();
  };
  return { harness, render, openForm, props };
}

function assertModalTitle(tree) {
  const dialog = nodes(tree, (node) => node.props.role === 'dialog')[0];
  const headings = nodes(tree, (node) => node.props.id === dialog.props['aria-labelledby']);
  assert.equal(headings.length, 1);
  assert.equal(headings[0].type, 'h2');
  assert.equal(headings[0].props.children, 'Camera');
}

test('gear modal preserves success and returned errors, localizes rejections, and unlocks submission', async () => {
  for (const isArabic of [false, true]) {
    for (const outcome of ['success', 'unsuccessful', 'rejected']) {
      let resolve;
      let reject;
      const response = new Promise((yes, no) => { resolve = yes; reject = no; });
      const fixture = gearModalFixture(() => response, isArabic);
      assertModalTitle(fixture.render());
      const formView = fixture.openForm();
      assertModalTitle(formView);
      const labels = nodes(formView, (node) => node.type === 'label');
      assert.equal(labels.length, 5);
      for (const label of labels) {
        assert.ok(label.props.htmlFor);
        assert.equal(nodes(formView, (node) => ['input', 'textarea'].includes(node.type) && node.props.id === label.props.htmlFor).length, 1);
      }
      for (const [field, value] of [['customerName', 'Customer'], ['phone', '+971501234567'], ['email', 'test@example.com']]) {
        nodes(fixture.render(), (node) => node.props.id === `gear-${field}`)[0].props.onChange({ target: { value } });
      }
      const submission = nodes(fixture.render(), (node) => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
      assert.equal(nodes(fixture.render(), (node) => node.props.type === 'submit')[0].props.disabled, true);
      if (outcome === 'rejected') reject(new Error('Transport failure'));
      else resolve(outcome === 'success' ? { success: true, data: { referenceCode: 'GEAR-TEST' } } : { success: false, error: 'Server error' });
      await submission;
      const tree = fixture.render();
      assertModalTitle(tree);
      if (outcome === 'success') {
        assert.equal(nodes(tree, (node) => node.type === 'form').length, 0);
        assert.equal(nodes(tree, (node) => node.props.children === 'GEAR-TEST').length, 1);
      } else {
        assert.equal(nodes(tree, (node) => node.props.type === 'submit')[0].props.disabled, false);
        const expected = outcome === 'unsuccessful' ? 'Server error' : isArabic
          ? 'حدث خطأ أثناء إرسال الحجز، يرجى المحاولة لاحقاً' : 'Failed to submit reservation. Please try WhatsApp.';
        assert.equal(nodes(tree, (node) => node.props.children === expected).length, 1);
      }
    }
  }
});

test('gear modal contains keyboard focus, handles changing controls, and restores the opener', () => {
  const documentListeners = new Map();
  const document = {
    body: {}, activeElement: null,
    addEventListener: (event, callback) => documentListeners.set(event, callback),
    removeEventListener: (event) => documentListeners.delete(event),
  };
  class Element {
    tabIndex = 0;
    isConnected = true;
    disabled = false;
    visible = true;
    focus() { document.activeElement = this; }
    matches() { return this.disabled; }
    getClientRects() { return this.visible ? [{}] : []; }
  }
  const opener = new Element();
  opener.focus();
  let controls = [new Element(), new Element(), new Element()];
  controls[1].disabled = true;
  const cardListeners = new Map();
  const card = Object.assign(new Element(), {
    contains: (target) => target === card || controls.includes(target),
    querySelectorAll: () => controls,
    addEventListener: (event, callback) => cardListeners.set(event, callback),
    removeEventListener: (event) => cardListeners.delete(event),
  });
  const fixture = gearModalFixture(async () => ({}), false, {
    document, HTMLElement: Element, window: { addEventListener() {}, removeEventListener() {} },
  });
  nodes(fixture.render(), (node) => node.props.ref)[0].props.ref.current = card;
  fixture.harness.commit();
  assert.equal(document.activeElement, card);
  const tab = (shiftKey = false) => {
    let prevented = false;
    cardListeners.get('keydown')({ key: 'Tab', shiftKey, preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
  };
  tab();
  assert.equal(document.activeElement, controls[0]);
  tab(true);
  assert.equal(document.activeElement, controls[2]);
  tab();
  assert.equal(document.activeElement, controls[0]);
  controls = [new Element(), new Element()];
  controls[1].visible = false;
  card.focus();
  tab(true);
  assert.equal(document.activeElement, controls[0]);
  documentListeners.get('focusin')({ target: opener });
  assert.equal(document.activeElement, card);
  controls = [];
  tab();
  assert.equal(document.activeElement, card);
  fixture.harness.unmount();
  assert.equal(document.activeElement, opener);
  assert.equal(documentListeners.size, 0);
  assert.equal(cardListeners.size, 0);
});

function authFormFixture(page, { callbackUrl = null, role = 'client', claim = false, signInError = null } = {}) {
  const harness = hookHarness();
  const events = [];
  const result = { name: 'Member', email: 'member@example.com', password: 'password123', phone: '123', company: 'Org', accountType: 'enterprise' };
  const Page = loadSource(`src/app/(public)/${page}/page.tsx`, {
    react: harness.hooks,
    'next/link': 'Link',
    'next/navigation': {
      useRouter: () => ({ push: (url) => events.push(['push', url]), refresh: () => events.push(['refresh']) }),
      useSearchParams: () => ({ get: (key) => key === 'callbackUrl' ? callbackUrl : null }),
    },
    'next-intl': { useTranslations: () => (key) => key },
    '@/components/layout/BrandLogo': { BrandLogo: 'Logo' },
    '@/lib/auth-client': {
      signUp: { email: async () => ({ error: claim ? { code: 'USER_ALREADY_EXISTS' } : null }) },
      signIn: { email: async () => { events.push(['signIn']); return { error: signInError }; } },
      authClient: { getSession: async () => ({ data: { user: { role } } }) },
    },
    '@/lib/actions': {
      claimGuestAccount: async () => ({ success: true, data: { role } }),
      syncUserProfile: async () => { events.push(['sync']); return { success: true }; },
    },
    '@/lib/validations': { registerUserSchema: { safeParse: () => ({ success: true, data: result }) } },
  }).default;
  const render = () => harness.render(() => page === 'login' ? Page().props.children.type() : Page());
  const submit = () => nodes(render(), (n) => n.type === 'form')[0].props.onSubmit({ preventDefault() {} });
  return { submit, render, events };
}

test('login rejects unsafe callbacks and retains role-based destinations', async () => {
  for (const [callbackUrl, role, expected] of [
    ['//evil.example', 'client', '/portal'], ['/\\evil.example', 'enterprise', '/enterprise/portal'],
    ['javascript:alert(1)', 'admin', '/admin'], ['https://evil.example', 'client', '/portal'],
    ['/\n/evil.example', 'client', '/portal'], [null, 'admin', '/admin'],
    ['/portal/settings?tab=profile', 'client', '/portal/settings?tab=profile'],
    ['/admin/users', 'client', '/portal'], ['/admin/users', 'admin', '/admin/users'],
  ]) {
    const h = authFormFixture('login', { callbackUrl, role });
    await h.submit();
    assert.equal(h.events.find(([event]) => event === 'push')[1], expected);
  }
});

test('registration stops on sign-in errors for claimed and new accounts', async () => {
  for (const claim of [true, false]) {
    const h = authFormFixture('register', { claim, signInError: { message: 'Sign-in failed' } });
    await h.submit();
    assert.deepEqual(h.events, [['signIn']]);
    assert.ok(nodes(h.render(), (n) => n.props.children === 'Sign-in failed').length);
  }
});

test('signup signs in before profile synchronization and claims use the preserved role', async () => {
  const signup = authFormFixture('register');
  await signup.submit();
  assert.deepEqual(signup.events, [['signIn'], ['sync'], ['push', '/enterprise/portal'], ['refresh']]);
  for (const role of ['client', 'enterprise']) {
    const h = authFormFixture('register', { claim: true, role });
    await h.submit();
    assert.deepEqual(h.events, [['signIn'], ['push', role === 'enterprise' ? '/enterprise/portal' : '/portal'], ['refresh']]);
  }
});

test('shared dialog trap filters hidden/disabled controls, wraps Tab, and restores focus', () => {
  const listeners = new Map();
  const document = { activeElement: null };
  class Element {
    tabIndex = 0;
    isConnected = true;
    disabled = false;
    visible = true;
    focus() { document.activeElement = this; }
    matches() { return this.disabled; }
    getClientRects() { return this.visible ? [{}] : []; }
  }
  const opener = new Element();
  opener.focus();
  const first = new Element();
  const hidden = Object.assign(new Element(), { visible: false });
  const disabled = Object.assign(new Element(), { disabled: true });
  const last = new Element();
  let controls = [first, hidden, disabled, last];
  const panel = Object.assign(new Element(), { querySelectorAll: () => controls });
  const harness = hookHarness();
  const { useFocusTrap } = loadSource('src/hooks/useFocusTrap.ts', { react: harness.hooks }, {
    document,
    window: {
      addEventListener: (type, fn) => listeners.set(type, fn),
      removeEventListener: (type) => listeners.delete(type),
    },
  });
  let closed = false;
  const render = (isOpen) => harness.render(() => useFocusTrap({
    isOpen, onClose: () => { closed = true; }, containerRef: { current: panel }, initialFocusRef: { current: first },
  }));
  render(false); harness.commit();
  assert.equal(listeners.size, 0);
  render(true); harness.commit();
  assert.equal(document.activeElement, first);
  const key = (key, shiftKey = false) => {
    let prevented = false;
    listeners.get('keydown')({ key, shiftKey, preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
  };
  key('Tab', true);
  assert.equal(document.activeElement, last);
  key('Tab');
  assert.equal(document.activeElement, first);
  key('Tab');
  assert.equal(document.activeElement, last);
  controls = [];
  key('Tab');
  assert.equal(document.activeElement, panel);
  key('Escape');
  assert.equal(closed, true);
  harness.unmount();
  assert.equal(document.activeElement, opener);
  assert.equal(listeners.size, 0);
});

test('RFP status completion preserves the currently inspected record and blocks overlapping updates', async () => {
  const harness = hookHarness();
  let finish;
  let calls = 0;
  const { RfpsManager } = loadSource('src/features/admin/components/RfpsManager.tsx', {
    react: harness.hooks,
    '@/lib/actions/bookings-rfp-operations': { updateEnterpriseRfpStatus: () => {
      calls++;
      return new Promise((resolve) => { finish = resolve; });
    } },
    '@/components/ui/data-table': new Proxy({}, { get: (_, key) => key }),
    '@/components/ui/pagination-controls': { PaginationControls: 'Pagination' },
    '@/components/ui/status-badge': { StatusBadge: 'StatusBadge', MawthooqBadge: 'MawthooqBadge' },
    '@/components/ui/dialog': { Dialog: 'Dialog' },
    '@/hooks/usePagination': { usePagination: (items) => ({ paginatedItems: items }) },
  });
  const rows = ['a', 'b'].map((id) => ({ id, referenceCode: id, status: 'pending_review', projectScope: 'scope', estimatedBudget: 'budget', organizationType: 'org' }));
  const render = () => harness.render(() => RfpsManager({ initialRfps: rows }));
  const inspectors = () => nodes(render(), (n) => n.props.title === 'Inspect full RFP proposal');
  inspectors()[0].props.onClick();
  const selector = () => nodes(render(), (n) => n.type === 'select')[0];
  const staleSelector = selector();
  const pending = staleSelector.props.onChange({ target: { value: 'approved' } });
  await staleSelector.props.onChange({ target: { value: 'rejected' } });
  assert.equal(calls, 1);
  inspectors()[1].props.onClick();
  assert.equal(selector().props.disabled, true);
  finish({ success: true });
  await pending;
  assert.equal(selector().props.value, 'pending_review');
  assert.equal(selector().props.disabled, false);
  const dialog = nodes(render(), (n) => n.type === 'Dialog')[0];
  assert.equal(dialog.props.title, 'RFP b');
  const label = nodes(render(), (n) => n.type === 'label')[0];
  assert.equal(label.props.htmlFor, selector().props.id);
  const retry = selector().props.onChange({ target: { value: 'sla_active' } });
  finish({ success: false });
  await retry;
  assert.equal(selector().props.disabled, false);
});
