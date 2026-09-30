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
    '@/lib/utils': { formatCurrency: String },
    '@/components/ui/dialog': { Dialog: 'Dialog' },
    '@/components/ui/feedback-alert': { FeedbackAlert: 'FeedbackAlert' },
    '@/components/admin/AdminImageUploader': { AdminImageUploader: 'Uploader' },
  };
  mocks['@/hooks/useFeedbackAlert'] = loadSource('src/hooks/useFeedbackAlert.ts', mocks);
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
