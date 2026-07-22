# Analytics Tagger v2 + App Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the analytics tagging tool as `@universe-forma/analytics-tagger` (broad event coverage, `@medv/finder` anchoring, PostHog-quality opt-in overlay), and add an app-wide header (back-to-gallery + concept search).

**Architecture:** Repo becomes npm-workspaces (app at root + `packages/analytics-tagger`, a no-build TS source package). The overlay is self-contained-CSS, mounts only under `import.meta.env.DEV` + `?tag`. Runtime coverage lives in the overlay; the node gate is slimmed to name/shape validation. Part B adds a shared `AppLayout` + `AppHeader` with a concept search.

**Tech Stack:** Vite 6, React 19, TS5 strict, react-router-dom 7, Vitest 4 (globals, jsdom), `@medv/finder`, ui-pes.

**Design spec:** `docs/superpowers/specs/2026-07-22-analytics-tagger-v2-and-app-header-design.md` — read it for full design context; it is the source of truth for the taxonomy and UX.

## Global Constraints

- Overlay opt-in: renders only when `import.meta.env.DEV` AND URL has a `tag` query param. Self-contained `aftag-`-prefixed CSS; no Tailwind utilities, no ui-pes, no host brand tokens inside the overlay.
- Event names non-empty `snake_case` (`^[a-z][a-z0-9]*(_[a-z0-9]+)*$`).
- Gate advisory (warn); hard-fail only on invalid event names. Accept v1 and v2 analytics.json.
- Do NOT encode auto-attached props (`page, local_page, device, device_new, orientation, version, ab_test, userAgent, env`) in presets.
- Concept components stay pure; overlay reads DOM, never edits concept source.
- Gate `.mjs` tests use vitest globals (bare `test`/`expect`, NO `node:test`), matching existing siblings.
- ui-pes component props must be verified against `node_modules/@universe-forma/ui-pes` before use — never invent props (past finding: `variant="secondary"` is invalid; real values are `text|filled|filled-tonal|outlined|upsale`).
- Existing concepts + full suite keep passing. Comments 2-line cap, no banners. Commit subject-only, no body, no Co-Authored-By.

---

## File Structure

**Part A**
- `package.json` (root) — add `"workspaces": ["packages/*"]`.
- `tsconfig.json` — add `"packages"` to `include`.
- `vite.config.ts` — import plugin from `@universe-forma/analytics-tagger/vite`.
- Create `packages/analytics-tagger/{package.json,tsconfig.json}`.
- Create `packages/analytics-tagger/src/core/{schema.ts,taxonomy.ts,naming.ts,selector.ts,client.ts}` (+ `.test.ts` for schema/taxonomy/naming/selector).
- Create `packages/analytics-tagger/src/vite/plugin.ts` (+ `plugin.test.ts`).
- Create `packages/analytics-tagger/src/index.ts`.
- Create `packages/analytics-tagger/src/styles.css`.
- Create `packages/analytics-tagger/src/react/{AnalyticsTagger.tsx,Launcher.tsx,Drawer.tsx,ElementHighlight.tsx,useInspector.ts,useCoverage.ts}` and `react/tabs/{InspectTab,EventsTab,AddTab,CoverageTab,ExportTab}.tsx`.
- Modify `src/app/ConceptRoute.tsx` — mount `<AnalyticsTagger>`.
- Delete `src/devtools/analytics-overlay/**` and `scripts/vite-plugin-analytics-writer.mjs` (+ its test).
- Modify `scripts/gates/verify-analytics.mjs` (+ test), `scripts/gates/run.mjs`.
- Modify `src/concepts/pdfguru/upload-funnel/analytics.json` (→ v2).
- Modify `.claude/skills/vibe-concept/{SKILL.md,references/conventions.md}`, `README.md`.

**Part B**
- Create `src/app/{AppHeader.tsx,AppLayout.tsx,useConceptSearch.ts}` (+ `useConceptSearch.test.ts`).
- Modify `src/app/App.tsx` (layout route), `src/app/Gallery.tsx` (reconcile hero).

---

## Task A1: Workspace + package scaffold

**Files:** Modify `package.json`, `tsconfig.json`; Create `packages/analytics-tagger/package.json`, `packages/analytics-tagger/tsconfig.json`, `packages/analytics-tagger/src/index.ts`.

**Interfaces:**
- Produces: workspace package `@universe-forma/analytics-tagger` with exports `"."`→`./src/index.ts`, `"./vite"`→`./src/vite/plugin.ts`; dep `@medv/finder`; peer `react`,`react-dom`.

- [ ] **Step 1: Root `package.json`** — add top-level `"workspaces": ["packages/*"]` (keep everything else). 

- [ ] **Step 2: Create `packages/analytics-tagger/package.json`**

```json
{
  "name": "@universe-forma/analytics-tagger",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./vite": "./src/vite/plugin.ts"
  },
  "dependencies": { "@medv/finder": "^4.0.2" },
  "peerDependencies": { "react": "^19.0.0", "react-dom": "^19.0.0" }
}
```

- [ ] **Step 3: Create `packages/analytics-tagger/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { "composite": false, "rootDir": "src" },
  "include": ["src"]
}
```

- [ ] **Step 4: Root `tsconfig.json`** — change `"include": ["src", "scripts"]` to `"include": ["src", "scripts", "packages"]`.

- [ ] **Step 5: Create a placeholder `packages/analytics-tagger/src/index.ts`**

```ts
export const ANALYTICS_TAGGER_VERSION = 2;
```

- [ ] **Step 6: Install to create the workspace symlink + @medv/finder**

Run: `npm install`
Expected: `node_modules/@universe-forma/analytics-tagger` symlinks to the package; `@medv/finder` present. 

- [ ] **Step 7: Verify resolution** — temporarily import in a scratch check or rely on later tasks. Minimal: `npx tsc -b` clean; `npm test` still green; `npm run build` succeeds.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json packages/analytics-tagger
git commit -m "chore(workspace): scaffold @universe-forma/analytics-tagger package"
```

---

## Task A2: core/schema.ts (v2 + migrateV1)

**Files:** Create `packages/analytics-tagger/src/core/schema.ts`, `schema.test.ts`.

**Interfaces:**
- Produces: types `EventCategory`, `ElementAnchor`, `AnalyticsEvent`, `AnalyticsSpec` (version 2); fns `emptySpec(product,concept)`, `upsertEvent(spec,event)`, `removeEvent(spec,id)`, `nextEventId(spec)`, `migrateV1(v1): AnalyticsSpec`, `coerceSpec(raw): AnalyticsSpec` (accepts v1|v2 → v2).

- [ ] **Step 1: Write `schema.test.ts` (failing)**

```ts
import { emptySpec, upsertEvent, removeEvent, nextEventId, migrateV1, coerceSpec } from './schema';

test('emptySpec is v2', () => {
  expect(emptySpec('pdfguru', 'funnel')).toEqual({ version: 2, product: 'pdfguru', concept: 'funnel', events: [] });
});
test('upsert/remove/nextId', () => {
  let s = emptySpec('pdfguru', 'f');
  expect(nextEventId(s)).toBe('evt_1');
  s = upsertEvent(s, { id: 'evt_1', page: 'a', category: 'interaction', trigger: 'click', event: 'x_tap', data: {}, notes: '' });
  expect(s.events).toHaveLength(1);
  expect(nextEventId(s)).toBe('evt_2');
  s = upsertEvent(s, { id: 'evt_1', page: 'a', category: 'interaction', trigger: 'click', event: 'y_tap', data: {}, notes: '' });
  expect(s.events[0].event).toBe('y_tap');
  s = removeEvent(s, 'evt_1');
  expect(s.events).toHaveLength(0);
});
test('migrateV1 maps triggers and element', () => {
  const v1 = { version: 1, product: 'pdfguru', concept: 'f', events: [
    { id: 'evt_1', page: 'a', trigger: 'click', event: 'x_tap', data: { method: 'click' },
      element: { tag: 'button', role: null, label: 'Go', occurrence: 0 }, notes: '' },
    { id: 'evt_2', page: 'a', trigger: 'page_load', event: 'a_view', data: {}, notes: '' },
  ] };
  const v2 = migrateV1(v1 as any);
  expect(v2.version).toBe(2);
  expect(v2.events[0]).toMatchObject({ category: 'interaction', trigger: 'click', event: 'x_tap' });
  expect(v2.events[0].element).toMatchObject({ selector: '', tag: 'button', role: null, label: 'Go' });
  expect(v2.events[1]).toMatchObject({ category: 'navigation', trigger: 'page_view' });
});
test('coerceSpec passes v2 through and migrates v1', () => {
  const v2 = emptySpec('tbp', 'x');
  expect(coerceSpec(v2)).toBe(v2);
  expect(coerceSpec({ version: 1, product: 'tbp', concept: 'x', events: [] } as any).version).toBe(2);
});
```

- [ ] **Step 2: Run** `npm test -- schema` → FAIL.

- [ ] **Step 3: Implement `schema.ts`**

```ts
export type EventCategory = 'interaction' | 'form' | 'visibility' | 'navigation' | 'media' | 'content' | 'custom';
export type ElementAnchor = { selector: string; tag: string; role: string | null; label: string; text?: string };
export type AnalyticsEvent = {
  id: string;
  page: string;
  category: EventCategory;
  trigger: string;
  event: string;
  data: Record<string, string>;
  element?: ElementAnchor;
  notes: string;
};
export type AnalyticsSpec = { version: 2; product: string; concept: string; events: AnalyticsEvent[] };

export const emptySpec = (product: string, concept: string): AnalyticsSpec => ({ version: 2, product, concept, events: [] });

export function upsertEvent(spec: AnalyticsSpec, event: AnalyticsEvent): AnalyticsSpec {
  const i = spec.events.findIndex((e) => e.id === event.id);
  const events = i >= 0 ? spec.events.map((e) => (e.id === event.id ? event : e)) : [...spec.events, event];
  return { ...spec, events };
}
export const removeEvent = (spec: AnalyticsSpec, id: string): AnalyticsSpec => ({ ...spec, events: spec.events.filter((e) => e.id !== id) });
export function nextEventId(spec: AnalyticsSpec): string {
  const max = spec.events.reduce((m, e) => { const n = Number(e.id.replace('evt_', '')); return Number.isFinite(n) && n > m ? n : m; }, 0);
  return `evt_${max + 1}`;
}

const V1_TRIGGER: Record<string, { category: EventCategory; trigger: string }> = {
  click: { category: 'interaction', trigger: 'click' },
  page_load: { category: 'navigation', trigger: 'page_view' },
  input_change: { category: 'form', trigger: 'input_change' },
};
export function migrateV1(v1: { product: string; concept: string; events: any[] }): AnalyticsSpec {
  return {
    version: 2,
    product: v1.product,
    concept: v1.concept,
    events: (v1.events ?? []).map((e) => {
      const map = V1_TRIGGER[e.trigger] ?? { category: 'custom' as EventCategory, trigger: e.trigger };
      const element = e.element
        ? { selector: '', tag: e.element.tag, role: e.element.role ?? null, label: e.element.label ?? '' }
        : undefined;
      return { id: e.id, page: e.page, category: map.category, trigger: map.trigger, event: e.event, data: e.data ?? {}, element, notes: e.notes ?? '' };
    }),
  };
}
export function coerceSpec(raw: any): AnalyticsSpec {
  if (raw && raw.version === 2) return raw as AnalyticsSpec;
  if (raw && raw.version === 1) return migrateV1(raw);
  return emptySpec(raw?.product ?? '', raw?.concept ?? '');
}
```

- [ ] **Step 4: Run** `npm test -- schema` → PASS. `npx tsc -b` clean.

- [ ] **Step 5: Commit**
```bash
git add packages/analytics-tagger/src/core/schema.ts packages/analytics-tagger/src/core/schema.test.ts
git commit -m "feat(tagger): v2 analytics spec schema with v1 migration"
```

---

## Task A3: core/taxonomy.ts

**Files:** Create `packages/analytics-tagger/src/core/taxonomy.ts`, `taxonomy.test.ts`.

**Interfaces:**
- Produces: `TriggerDef = { id: string; category: EventCategory; label: string; suffix: string; needsElement: boolean; suggestedProps: string[]; extension?: boolean }`; `TRIGGERS: TriggerDef[]`; `triggerById(id): TriggerDef | undefined`; `triggersByCategory(cat): TriggerDef[]`; `CATEGORIES: EventCategory[]`; `PROPERTY_KEYS: string[]`; `PROPERTY_VALUES: Record<string, string[]>` (enum hints incl. `funnel`).

- [ ] **Step 1: Write `taxonomy.test.ts` (failing)** — assert real coverage, not tautology:

```ts
import { TRIGGERS, triggerById, triggersByCategory, PROPERTY_KEYS, PROPERTY_VALUES, CATEGORIES } from './taxonomy';

test('covers all 7 categories with multiple triggers', () => {
  expect(CATEGORIES).toEqual(['interaction', 'form', 'visibility', 'navigation', 'media', 'content', 'custom']);
  for (const c of CATEGORIES) expect(triggersByCategory(c).length).toBeGreaterThan(0);
  expect(TRIGGERS.length).toBeGreaterThanOrEqual(25);
});
test('core pdfguru suffixes present and correct', () => {
  expect(triggerById('click')!.suffix).toBe('tap');
  expect(triggerById('page_view')!.suffix).toBe('view');
  expect(triggerById('input_change')!.suffix).toBe('change');
  expect(triggerById('validation_error')!.suffix).toBe('status');
});
test('page_view needs no element; click needs element', () => {
  expect(triggerById('page_view')!.needsElement).toBe(false);
  expect(triggerById('click')!.needsElement).toBe(true);
});
test('property presets exclude auto-attached and include pdfguru vocab', () => {
  for (const k of ['method', 'status', 'place', 'funnel', 'file_format', 'source', 'features_name']) expect(PROPERTY_KEYS).toContain(k);
  for (const k of ['page', 'device', 'ab_test', 'orientation', 'version', 'userAgent']) expect(PROPERTY_KEYS).not.toContain(k);
  expect(PROPERTY_VALUES.method).toContain('drag_and_drop');
  expect(PROPERTY_VALUES.status).toContain('success');
  expect(PROPERTY_VALUES.funnel).toContain('merge_pdf');
});
```

- [ ] **Step 2: Run** `npm test -- taxonomy` → FAIL.

- [ ] **Step 3: Implement `taxonomy.ts`** — grounded in pdfguru-fe vocabulary (see spec §Part A/Taxonomy). Define `CATEGORIES`, the `TRIGGERS` array with every trigger from the spec (interaction: click/double_click/right_click/long_press/hover*/focus*/blur*; form: input_change/select_change/toggle/form_submit/validation_error; visibility: impression/section_view/scroll_depth*; navigation: page_view/route_change/back/external_link/tab_change; media: media_play*/media_pause*/media_complete*; content: modal_open/modal_close/toast_shown/accordion_expand*/accordion_collapse*/copy; custom: custom), each with `suffix`, `needsElement`, `suggestedProps`, and `extension: true` on the `*` ones. `PROPERTY_KEYS` = the pdfguru vocabulary minus auto-attached: `['method','status','place','source','feature_name','features_name','type','funnel','file_format','file_size_bytes','file_pages','currency','download_method','error_type','error_code','session_id','is_premium','plan_type','tool','screen_config_name']`. `PROPERTY_VALUES` = `{ method:['manual','auto','click','drag_and_drop','box','drive','files_list','paypal'], status:['success','fail','error','impossible','started','processing','ready'], type:['manual','auto'], error_type:['cors','network','http','abort','unknown'], download_method:['fetch_blob','anchor','iframe','fetch_data_url','service_worker'], funnel:[ /* EFunnels: pdf_converter, pdf_to_word, pdf_to_png, pdf_to_jpg, image_to_pdf, word_to_pdf, merge_pdf, merge_images, split_pdf, extract_pdf_pages, delete_pdf_pages, rotate_pdf, organize_pdf, compress_pdf, crop_pdf, compress_images, enhance_image, fill_pdf, edit_pdf, sign_pdf, create_pdf, pdf_ocr, image_to_text, pdf_summarizer, remove_watermark, translate_pdf, unlock_pdf, audio_convert, video_convert, compress_video, transcribe_audio, transcribe_video, transcribe_youtube, text_to_speech, vocal_remover, create_qr_code, main_page */ ], place:['main','additional','dashboard','editor','header','files_list','payment_screen','payment_success','login_page','error_popup','download_toast'] }`. Provide `triggerById` and `triggersByCategory` lookups.

- [ ] **Step 4: Run** `npm test -- taxonomy` → PASS.

- [ ] **Step 5: Commit**
```bash
git add packages/analytics-tagger/src/core/taxonomy.ts packages/analytics-tagger/src/core/taxonomy.test.ts
git commit -m "feat(tagger): event taxonomy and property presets grounded in pdfguru-fe"
```

---

## Task A4: core/naming.ts

**Files:** Create `packages/analytics-tagger/src/core/naming.ts`, `naming.test.ts`.

**Interfaces:**
- Consumes: `triggerById` (`./taxonomy`), `AnalyticsEvent`, `AnalyticsSpec` (`./schema`).
- Produces: `isSnakeCase(s)`, `suffixFor(triggerId)`, `deriveEventName(label, triggerId)`, `renderAmplitudeCall(event)`, `renderTrackingPlan(spec): string`, `existingNames(spec): string[]`.

- [ ] **Step 1: Write `naming.test.ts` (failing)**

```ts
import { isSnakeCase, suffixFor, deriveEventName, renderAmplitudeCall, renderTrackingPlan } from './naming';

test('isSnakeCase', () => {
  expect(isSnakeCase('file_upload_status')).toBe(true);
  expect(isSnakeCase('Bad')).toBe(false);
  expect(isSnakeCase('')).toBe(false);
});
test('suffixFor + deriveEventName by trigger', () => {
  expect(suffixFor('click')).toBe('tap');
  expect(deriveEventName('Upload PDF', 'click')).toBe('upload_pdf_tap');
  expect(deriveEventName('Home', 'page_view')).toBe('home_view');
  expect(deriveEventName('Email', 'input_change')).toBe('email_change');
});
test('deriveEventName custom trigger drops suffix', () => {
  expect(deriveEventName('File chosen', 'custom')).toBe('file_chosen');
});
test('renderAmplitudeCall', () => {
  expect(renderAmplitudeCall({ id: 'e', page: 'a', category: 'interaction', trigger: 'click', event: 'x_tap', data: {}, notes: '' }))
    .toBe("dispatch(sendAnalyticEvent({ event: 'x_tap' }))");
  expect(renderAmplitudeCall({ id: 'e', page: 'a', category: 'interaction', trigger: 'click', event: 'x_tap', data: { method: 'click' }, notes: '' }))
    .toBe("dispatch(sendAnalyticEvent({ event: 'x_tap', data: { method: 'click' } }))");
});
test('renderTrackingPlan lists events with page and event columns', () => {
  const plan = renderTrackingPlan({ version: 2, product: 'pdfguru', concept: 'f', events: [
    { id: 'e', page: 'a', category: 'interaction', trigger: 'click', event: 'x_tap', data: { method: 'click' }, notes: '' },
  ] });
  expect(plan).toContain('x_tap');
  expect(plan).toContain('a');
  expect(plan).toContain('click');
});
```

- [ ] **Step 2: Run** `npm test -- naming` → FAIL.

- [ ] **Step 3: Implement `naming.ts`**

```ts
import { triggerById } from './taxonomy';
import type { AnalyticsEvent, AnalyticsSpec } from './schema';

const SNAKE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
export const isSnakeCase = (s: string) => SNAKE.test(s);
export const suffixFor = (triggerId: string) => triggerById(triggerId)?.suffix ?? '';

const slug = (label: string) => label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
export function deriveEventName(label: string, triggerId: string): string {
  const base = slug(label);
  const suffix = suffixFor(triggerId);
  if (!suffix) return base;
  return base ? `${base}_${suffix}` : suffix;
}

export function renderAmplitudeCall(event: AnalyticsEvent): string {
  const keys = Object.keys(event.data);
  if (!keys.length) return `dispatch(sendAnalyticEvent({ event: '${event.event}' }))`;
  const data = keys.map((k) => `${k}: '${event.data[k]}'`).join(', ');
  return `dispatch(sendAnalyticEvent({ event: '${event.event}', data: { ${data} } }))`;
}

export const existingNames = (spec: AnalyticsSpec): string[] => Array.from(new Set(spec.events.map((e) => e.event)));

export function renderTrackingPlan(spec: AnalyticsSpec): string {
  const header = '| page | category | trigger | event | element | data | call |\n|---|---|---|---|---|---|---|';
  const rows = spec.events.map((e) =>
    `| ${e.page} | ${e.category} | ${e.trigger} | \`${e.event}\` | ${e.element?.selector ?? '—'} | ${Object.keys(e.data).join(', ') || '—'} | \`${renderAmplitudeCall(e)}\` |`,
  );
  return [`# ${spec.product} / ${spec.concept} — tracking plan`, '', header, ...rows, ''].join('\n');
}
```

- [ ] **Step 4: Run** `npm test -- naming` → PASS.

- [ ] **Step 5: Commit**
```bash
git add packages/analytics-tagger/src/core/naming.ts packages/analytics-tagger/src/core/naming.test.ts
git commit -m "feat(tagger): naming, amplitude preview, and tracking-plan export"
```

---

## Task A5: core/selector.ts + client.ts + index.ts

**Files:** Create `packages/analytics-tagger/src/core/selector.ts`, `selector.test.ts`, `client.ts`; rewrite `packages/analytics-tagger/src/index.ts`.

**Interfaces:**
- Produces: `anchorFor(el, root?): ElementAnchor` (`selector.ts`); `loadSpec/saveSpec/downloadSpec/copyText` (`client.ts`); `index.ts` re-exports core types + fns + (later) `AnalyticsTagger`.

- [ ] **Step 1: Write `selector.test.ts` (failing, jsdom)**

```ts
import { anchorFor } from './selector';

test('anchorFor returns a working unique selector + metadata', () => {
  document.body.innerHTML = `<main><button id="a" aria-label="Upload">Upload PDF</button><button>Other</button></main>`;
  const btn = document.getElementById('a')!;
  const anchor = anchorFor(btn);
  expect(anchor.tag).toBe('button');
  expect(anchor.label).toBe('Upload');
  expect(typeof anchor.selector).toBe('string');
  expect(anchor.selector.length).toBeGreaterThan(0);
  expect(document.querySelector(anchor.selector)).toBe(btn);
});
```

- [ ] **Step 2: Run** `npm test -- selector` → FAIL.

- [ ] **Step 3: Implement `selector.ts`**

```ts
import { finder } from '@medv/finder';
import type { ElementAnchor } from './schema';

export function anchorFor(el: Element, root?: Element): ElementAnchor {
  let selector = '';
  try {
    selector = finder(el, root ? { root: root as Element } : undefined);
  } catch {
    selector = el.tagName.toLowerCase();
  }
  const text = (el.textContent || '').trim().slice(0, 80);
  return {
    selector,
    tag: el.tagName.toLowerCase(),
    role: el.getAttribute('role'),
    label: (el.getAttribute('aria-label') || text).slice(0, 80),
    text: text || undefined,
  };
}
```

- [ ] **Step 4: Implement `client.ts`**

```ts
import type { AnalyticsSpec } from './schema';
import { coerceSpec, emptySpec } from './schema';

const url = (product: string, concept: string) => `/__analytics/${product}/${concept}`;

export async function loadSpec(product: string, concept: string): Promise<AnalyticsSpec> {
  try {
    const res = await fetch(url(product, concept));
    if (!res.ok) return emptySpec(product, concept);
    return coerceSpec(await res.json());
  } catch { return emptySpec(product, concept); }
}
export async function saveSpec(spec: AnalyticsSpec): Promise<boolean> {
  try {
    const res = await fetch(url(spec.product, spec.concept), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(spec) });
    return res.ok;
  } catch { return false; }
}
export function downloadSpec(spec: AnalyticsSpec): void {
  const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href; a.download = `${spec.product}-${spec.concept}.analytics.json`; a.click();
  URL.revokeObjectURL(href);
}
export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}
```

- [ ] **Step 5: Rewrite `index.ts`** — export the core surface (component added in A8):

```ts
export * from './core/schema';
export * from './core/taxonomy';
export * from './core/naming';
export { anchorFor } from './core/selector';
export { loadSpec, saveSpec, downloadSpec, copyText } from './core/client';
```

- [ ] **Step 6: Run** `npm test -- selector` → PASS; `npx tsc -b` clean.

- [ ] **Step 7: Commit**
```bash
git add packages/analytics-tagger/src/core/selector.ts packages/analytics-tagger/src/core/selector.test.ts packages/analytics-tagger/src/core/client.ts packages/analytics-tagger/src/index.ts
git commit -m "feat(tagger): finder-based element anchoring and persistence client"
```

---

## Task A6: Move Vite plugin into the package

**Files:** Create `packages/analytics-tagger/src/vite/plugin.ts`, `plugin.test.ts`; Modify `vite.config.ts`; Delete `scripts/vite-plugin-analytics-writer.mjs`, `scripts/vite-plugin-analytics-writer.test.mjs`.

**Interfaces:**
- Produces: default export `analyticsWriter()`, named `resolveConceptPath(root, product, slug)` at `@universe-forma/analytics-tagger/vite`.

- [ ] **Step 1: Create `plugin.ts`** — port the current `scripts/vite-plugin-analytics-writer.mjs` verbatim to TS (same guards, GET/POST, `apply:'serve'`, generic error). Keep the GET empty-skeleton as `{ version: 2, product, concept, events: [] }` (bump to v2). Type the Vite `Plugin` loosely (`import type { Plugin } from 'vite'`).

- [ ] **Step 2: Create `plugin.test.ts` (vitest globals, NOT node:test)**

```ts
import path from 'node:path';
import { resolveConceptPath } from './plugin';
const root = '/repo';
test('valid resolves inside src/concepts', () => {
  expect(resolveConceptPath(root, 'pdfguru', 'funnel')).toBe(path.join(root, 'src/concepts/pdfguru/funnel/analytics.json'));
});
test('rejects unknown product and traversal', () => {
  expect(resolveConceptPath(root, 'evil', 'funnel')).toBe(null);
  expect(resolveConceptPath(root, 'pdfguru', '../../etc')).toBe(null);
  expect(resolveConceptPath(root, 'pdfguru', 'a/b')).toBe(null);
});
```

- [ ] **Step 3: Rewire `vite.config.ts`** — replace `import analyticsWriter from './scripts/vite-plugin-analytics-writer.mjs'` with `import analyticsWriter from '@universe-forma/analytics-tagger/vite'`. Keep the plugin in the `plugins` array.

- [ ] **Step 4: Delete** `scripts/vite-plugin-analytics-writer.mjs` and `scripts/vite-plugin-analytics-writer.test.mjs`.

- [ ] **Step 5: Verify** — `npm test -- plugin` PASS; `npm test` full green; `npm run build` succeeds; `npx tsc -b` clean.

- [ ] **Step 6: Commit**
```bash
git add packages/analytics-tagger/src/vite vite.config.ts
git rm scripts/vite-plugin-analytics-writer.mjs scripts/vite-plugin-analytics-writer.test.mjs
git commit -m "refactor(tagger): move dev write plugin into the package"
```

---

## Task A7: Slim the analytics gate

**Files:** Modify `scripts/gates/verify-analytics.mjs`, `scripts/gates/verify-analytics.test.mjs`, `scripts/gates/run.mjs`.

**Interfaces:**
- Produces: `analyzeConcept(spec, pages)` returns `{warnings, errors}` — errors = invalid snake_case names + malformed shape; warnings = missing spec + page missing a page-view event. Drop `scanInteractive` and per-element untagged scanning. `analyzeAll()` still iterates `conceptDirs()`/`conceptPages()` for page slugs.

- [ ] **Step 1: Rewrite `verify-analytics.test.mjs` (vitest globals)**

```ts
import { analyzeConcept } from './verify-analytics.mjs';

test('null spec warns not-tagged', () => {
  const { warnings, errors } = analyzeConcept(null, [{ slug: 'screen' }]);
  expect(warnings.some((w) => w.includes('no analytics'))).toBe(true);
  expect(errors).toEqual([]);
});
test('invalid event name is an error (v1 or v2)', () => {
  const spec = { version: 2, product: 'p', concept: 'c', events: [
    { id: 'e', page: 'screen', category: 'interaction', trigger: 'click', event: 'BadName', data: {}, notes: '' },
  ] };
  expect(analyzeConcept(spec, [{ slug: 'screen' }]).errors.some((e) => e.includes('BadName'))).toBe(true);
});
test('page with no page-view event warns', () => {
  const spec = { version: 2, product: 'p', concept: 'c', events: [
    { id: 'e', page: 'screen', category: 'interaction', trigger: 'click', event: 'x_tap', data: {}, notes: '' },
  ] };
  expect(analyzeConcept(spec, [{ slug: 'screen' }]).warnings.some((w) => w.includes('page-view'))).toBe(true);
});
test('valid tagged page passes clean', () => {
  const spec = { version: 2, product: 'p', concept: 'c', events: [
    { id: 'e', page: 'screen', category: 'navigation', trigger: 'page_view', event: 'screen_view', data: {}, notes: '' },
  ] };
  const { warnings, errors } = analyzeConcept(spec, [{ slug: 'screen' }]);
  expect(errors).toEqual([]);
  expect(warnings).toEqual([]);
});
```

- [ ] **Step 2: Run** `npm test -- verify-analytics` → FAIL.

- [ ] **Step 3: Rewrite `verify-analytics.mjs`**

```ts
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { conceptDirs, conceptPages } from './lib/scan.mjs';

const SNAKE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
const PAGE_VIEW_TRIGGERS = new Set(['page_view', 'page_load']);

export function analyzeConcept(spec, pages) {
  const warnings = [];
  const errors = [];
  if (!spec) { warnings.push('no analytics tagged (no analytics.json)'); return { warnings, errors }; }
  if (!Array.isArray(spec.events)) { errors.push('malformed analytics.json: events is not an array'); return { warnings, errors }; }
  for (const e of spec.events) {
    if (typeof e.event !== 'string' || !SNAKE.test(e.event)) errors.push(`invalid event name (must be snake_case): "${e.event}"`);
  }
  for (const page of pages) {
    const pageEvents = spec.events.filter((e) => e.page === page.slug);
    if (!pageEvents.some((e) => PAGE_VIEW_TRIGGERS.has(e.trigger))) warnings.push(`page "${page.slug}" has no page-view event`);
  }
  return { warnings, errors };
}

export function analyzeAll() {
  const results = [];
  for (const { dir, product, slug } of conceptDirs()) {
    const { pages } = conceptPages(dir);
    const specPath = path.join(dir, 'analytics.json');
    const spec = existsSync(specPath) ? JSON.parse(readFileSync(specPath, 'utf8')) : null;
    results.push({ product, slug, ...analyzeConcept(spec, pages.map((p) => ({ slug: p.slug }))) });
  }
  return results;
}
```

- [ ] **Step 4: `run.mjs`** — no structural change needed (it already imports `analyzeAll` and prints errors/warnings). Confirm it still compiles/runs after the gate rewrite. Remove the now-unused `scanInteractive` import if `run.mjs` referenced it (it does not).

- [ ] **Step 5: Verify** — `npm test -- verify-analytics` PASS; `npm run gate` exits 0 on current tree (upload-funnel is still v1 here → migrated read is not needed by the gate since it validates raw; ensure v1 events with `trigger:'page_load'` count as page-view — they do via `PAGE_VIEW_TRIGGERS`). `npm test` full green.

- [ ] **Step 6: Commit**
```bash
git add scripts/gates/verify-analytics.mjs scripts/gates/verify-analytics.test.mjs scripts/gates/run.mjs
git commit -m "feat(gate): slim analytics gate to name/shape/page-view validation"
```

---

## Task A8: Overlay shell — root, launcher, drawer, inspector, styles, mount

**Files:** Create `packages/analytics-tagger/src/styles.css`, `react/AnalyticsTagger.tsx`, `react/Launcher.tsx`, `react/Drawer.tsx`, `react/ElementHighlight.tsx`, `react/useInspector.ts`; update `src/index.ts`; Modify `src/app/ConceptRoute.tsx`.

**Interfaces:**
- Consumes: core (`schema`, `taxonomy`, `naming`, `selector`, `client`).
- Produces: `AnalyticsTagger({ product, concept, page })` (default+named export via `index.ts`). Internal context shares `{ spec, setSpec (persists), page, product, concept, draft, setDraft, inspecting, setInspecting }`. `useInspector(active, onPick)` highlights hovered elements and returns the hover rect + anchor. `ElementHighlight({ rect, anchor, onChip })`.

Read the design spec §"React overlay" for UX detail. This task delivers the shell + Inspect flow; the Add/Events/Coverage/Export tabs land in A9 (stub them as empty placeholders returning `null` or a "coming in A9" note so the drawer renders).

- [ ] **Step 1: `styles.css`** — self-contained, `aftag-`-prefixed: a fixed launcher pill (bottom-right), a right drawer (`position:fixed; right:0; top:0; height:100vh; width:380px`), a scoped reset on `.aftag-root *` (box-sizing, font-family system stack), buttons/inputs/tabs styling, the highlight box + tooltip, trigger chips. Modern: rounded corners, subtle shadow, neutral palette (no brand tokens). Import it once from `AnalyticsTagger.tsx` (`import '../styles.css'`).

- [ ] **Step 2: `useInspector.ts`** — capture-phase `mousemove` (find nearest element via `closest` of a broad interactive selector, else the hovered element) + `click` (preventDefault/stopPropagation → `onPick(anchorFor(el))`). Return the hovered element's `DOMRect | null`. Clean up listeners on deactivate. Esc handled in root.

```ts
import { useEffect, useState } from 'react';
import { anchorFor } from '../core/selector';
import type { ElementAnchor } from '../core/schema';

const INTERACTIVE = 'button, a, input, select, textarea, [role="button"], [role="tab"], [role="switch"], [data-track]';
export function useInspector(active: boolean, onPick: (anchor: ElementAnchor, rect: DOMRect) => void) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (!active) { setRect(null); return; }
    const pick = (e: Event) => {
      const t = e.target as Element;
      if (t.closest('.aftag-root')) return null; // ignore the tool's own UI
      return t.closest(INTERACTIVE) ?? t;
    };
    const move = (e: MouseEvent) => { const el = pick(e); setRect(el && !(el as Element).closest('.aftag-root') ? (el as Element).getBoundingClientRect() : null); };
    const click = (e: MouseEvent) => { const el = pick(e); if (!el || (el as Element).closest('.aftag-root')) return; e.preventDefault(); e.stopPropagation(); onPick(anchorFor(el as Element), (el as Element).getBoundingClientRect()); };
    document.addEventListener('mousemove', move, true);
    document.addEventListener('click', click, true);
    return () => { document.removeEventListener('mousemove', move, true); document.removeEventListener('click', click, true); };
  }, [active, onPick]);
  return rect;
}
```

- [ ] **Step 3: `ElementHighlight.tsx`** — a `pointer-events:none` box positioned at `rect` + a tooltip showing `anchor.tag · anchor.selector · anchor.text` and quick trigger chips (`tap`, `view`, `hover`, `change`) that call `onChip(triggerId)`. Chips have `pointer-events:auto`.

- [ ] **Step 4: `Launcher.tsx`** — a draggable pill button (`aftag-launcher`) showing "Tag ●N" (N = events on current page); `onClick` toggles the drawer open. Drag via pointer events updating `left/top` state.

- [ ] **Step 5: `Drawer.tsx`** — the tab shell: header (title + close), a tab bar (Inspect · Events · Add · Coverage · Export), and a body that renders the active tab. Takes `{ tab, setTab, children }` or renders tabs internally given the context.

- [ ] **Step 6: `AnalyticsTagger.tsx`** — root:
  - `useSearchParams()`; if no `tag` param → return `null`.
  - Load spec on mount (`loadSpec`), keep in state; `persist(next)` sets + `saveSpec`.
  - State: `open` (drawer), `tab`, `inspecting`, `draft` (the in-progress event or null).
  - `useInspector(inspecting, onPick)` where `onPick(anchor)` sets `draft` to a new event seeded with `anchorFor` result + default trigger `click`, switches `tab='add'`, `inspecting=false`.
  - Esc handler: exit inspecting / close draft.
  - Render `<div className="aftag-root">`: `<Launcher/>`, and when open `<Drawer/>` with the active tab; when `inspecting` render `<ElementHighlight/>`.
  - For A8, tabs other than Inspect can render a placeholder; Inspect tab = a button toggling `inspecting` + short instructions.
  - Provide a React context `TaggerContext` exposing `{ product, concept, page, spec, persist, draft, setDraft, tab, setTab, inspecting, setInspecting }` for the tab components (A9).

- [ ] **Step 7: `index.ts`** — add `export { AnalyticsTagger } from './react/AnalyticsTagger';` and `export type` for its props.

- [ ] **Step 8: Mount in `src/app/ConceptRoute.tsx`** — replace both `{import.meta.env.DEV && <AnalyticsOverlay product={…} concept={…} page={…} />}` lines with `{import.meta.env.DEV && <AnalyticsTagger product={entry.product} concept={entry.slug} page={…} />}` importing from `@universe-forma/analytics-tagger`. (SinglePage page="screen"; MultiPage page={current}.) Do not delete the old `src/devtools` tree yet (A9 does, after the tabs exist).

- [ ] **Step 9: Verify** — `npx tsc -b` clean; `npm test` green; `npm run build` succeeds (overlay must still tree-shake out — it's under `import.meta.env.DEV`). Manual: `npm run dev`, open `/c/pdfguru/upload-funnel?tag=1` → launcher visible; without `?tag` → nothing. `/c/pdfguru/upload-funnel` (no param) stays clean.

- [ ] **Step 10: Commit**
```bash
git add packages/analytics-tagger/src/styles.css packages/analytics-tagger/src/react src/app/ConceptRoute.tsx packages/analytics-tagger/src/index.ts
git commit -m "feat(tagger): overlay shell, launcher, drawer, inspector, query-param mount"
```

---

## Task A9: Overlay tabs — Add, Events, Coverage, Export + coverage hook

**Files:** Create `react/useCoverage.ts`, `react/tabs/{InspectTab,AddTab,EventsTab,CoverageTab,ExportTab}.tsx`; wire them into `Drawer.tsx`/`AnalyticsTagger.tsx`; Delete `src/devtools/analytics-overlay/**`.

**Interfaces:**
- Consumes: `TaggerContext`, core libs.
- Produces: the five tab components + `useCoverage(page, spec)` → `{ tagged: ElementAnchor[], untagged: {selector,tag,label}[] }` computed from the live DOM.

- [ ] **Step 1: `AddTab.tsx`** — the rich form driven by `draft` in context:
  - Category `<select>` (from `CATEGORIES`) → trigger `<select>` (from `triggersByCategory`). Changing trigger re-seeds the event name via `deriveEventName(draft.element?.label ?? page, triggerId)` unless the user edited it.
  - Event name input with datalist of `existingNames(spec)` + live `isSnakeCase` validation (red border + disable Save when invalid).
  - Element row: shows `draft.element?.selector` (editable text), a "Re-pick" button that sets `inspecting=true`. Hidden when the trigger `needsElement === false`.
  - Property rows: key `<select>`/input from `PROPERTY_KEYS` + `triggerById(trigger).suggestedProps` shown first; value input with `<datalist>` from `PROPERTY_VALUES[key]` when present. Add/remove rows.
  - Notes textarea. Live `renderAmplitudeCall` preview. Save → `upsertEvent` + `persist`, clear draft, switch to Events tab. "New event" button creates a blank draft (no element) for page_view/custom.

- [ ] **Step 2: `EventsTab.tsx`** — events for `page`, grouped by category, count badge; each row: event name, trigger, `element.selector`, edit (loads into draft + Add tab), delete (`removeEvent`+persist), and "locate" (`document.querySelector(selector)?.scrollIntoView()` + brief outline flash).

- [ ] **Step 3: `useCoverage.ts`** — query `document` (excluding `.aftag-root`) for the broad interactive selector, `anchorFor` each, dedupe by selector; `tagged` = those whose selector matches a `spec.events[].element.selector` for this page; `untagged` = the rest. Recompute on demand (button) and on mount.

- [ ] **Step 4: `CoverageTab.tsx`** — two lists (Untagged first, then Tagged) with counts; each untagged row has "Tag this" → seed draft from its anchor + open Add tab. A "Rescan" button.

- [ ] **Step 5: `ExportTab.tsx`** — buttons: Download JSON (`downloadSpec`), Copy Amplitude calls (`copyText(spec.events.map(renderAmplitudeCall).join('\n'))`), Copy tracking plan (`copyText(renderTrackingPlan(spec))`). Show a transient "copied" state.

- [ ] **Step 6: `InspectTab.tsx`** — toggle `inspecting`, short help text, and echo the last picked anchor.

- [ ] **Step 7: Wire tabs into `Drawer.tsx`** (render by `tab`) and ensure `AnalyticsTagger` provides context. Remove A8 placeholders.

- [ ] **Step 8: Delete the old overlay** — `git rm -r src/devtools/analytics-overlay`. Confirm nothing else imports it (`ConceptRoute` now uses the package).

- [ ] **Step 9: Verify** — `npx tsc -b` clean; `npm test` green; `npm run build` succeeds + grep `build/assets` for `aftag`/`__analytics`/`sendAnalyticEvent` → none (dev-only tree-shaken). Manual on `?tag=1`: pick an element → Add prefilled → Save → appears in Events → Coverage shows it tagged → Export copies. Confirm `analytics.json` written.

- [ ] **Step 10: Commit**
```bash
git add packages/analytics-tagger/src/react
git rm -r src/devtools/analytics-overlay
git commit -m "feat(tagger): add/events/coverage/export tabs and runtime coverage"
```

---

## Task A10: Migrate example + docs

**Files:** Modify `src/concepts/pdfguru/upload-funnel/analytics.json`; `.claude/skills/vibe-concept/SKILL.md`, `references/conventions.md`; `README.md`.

- [ ] **Step 1: Migrate `analytics.json` to v2** — read the current v1 file; for each event add `category` and map trigger (`page_load→page_view` in `navigation`, `click→click` in `interaction`); replace `element.occurrence` with `element.selector` set to a plausible CSS selector for the funnel buttons (e.g. `main button`, or `main button:nth-of-type(1)` for the primary CTA — acknowledge in `notes` that the overlay regenerates the real selector). Keep snake_case event names. Set `"version": 2`.

- [ ] **Step 2: SKILL.md** — update step 7 wording: run `npm run dev`, open `/c/<product>/<slug>?tag=1`, use the tagger (Inspect → tag elements, add page-view per page, Coverage to find gaps, Export/auto-save writes `analytics.json`). Note the `?tag=1` opt-in and the broadened event taxonomy.

- [ ] **Step 3: conventions.md** — replace the analytics section: v2 schema (category/trigger/selector), the taxonomy categories + suffix convention (core `tap/view/status/change` + documented extensions), property presets grounded in pdfguru, `?tag=1` opt-in, runtime Coverage tab replaces the old source-scan, and the note that auto-attached context props are excluded.

- [ ] **Step 4: README.md** — update the "analytics tagging" section (EN + the Ukrainian paragraph): the tool is now a package, opt-in via `?tag=1`, covers interaction/form/visibility/navigation/media/content/custom, exports JSON + Amplitude snippet + tracking plan. Keep one file.

- [ ] **Step 5: Verify** — `npm run gate` exits 0; `npm run gate:analytics` shows the funnel valid (page-view per page present; snake_case names) — no errors. `npm test` green.

- [ ] **Step 6: Commit**
```bash
git add src/concepts/pdfguru/upload-funnel/analytics.json .claude/skills/vibe-concept/SKILL.md .claude/skills/vibe-concept/references/conventions.md README.md
git commit -m "docs(tagger): migrate example to v2 and document the rebuilt tool"
```

---

## Task B1: Concept search logic

**Files:** Create `src/app/useConceptSearch.ts`, `useConceptSearch.test.ts`.

**Interfaces:**
- Produces: pure `filterConcepts(entries, query)` → ranked `ConceptEntry[]` (case-insensitive substring on `title`/`product`/`slug`; exact product match and title-startsWith boosted; empty query → all, capped/ordered by product then title). `useConceptSearch(query)` wraps it over `conceptEntries()`.

- [ ] **Step 1: Write `useConceptSearch.test.ts` (failing)**

```ts
import { filterConcepts } from './useConceptSearch';
const E = (product: string, slug: string, title: string) => ({ product, slug, title, brand: product, kind: 'single' as const, load: async () => ({ default: () => null }), loadMock: async () => ({ default: {} }) });
const entries = [E('pdfguru', 'documents-empty', 'Documents — empty'), E('tbp', 'ui-pes-showcase', 'UI-PES showcase'), E('pdfleader', 'document-detail', 'Document detail')] as any;

test('empty query returns all', () => {
  expect(filterConcepts(entries, '').length).toBe(3);
});
test('matches title/slug/product case-insensitively', () => {
  expect(filterConcepts(entries, 'document').map((e) => e.slug)).toContain('documents-empty');
  expect(filterConcepts(entries, 'document').map((e) => e.slug)).toContain('document-detail');
  expect(filterConcepts(entries, 'TBP').map((e) => e.product)).toEqual(['tbp']);
  expect(filterConcepts(entries, 'showcase')[0].slug).toBe('ui-pes-showcase');
});
test('no match returns empty', () => {
  expect(filterConcepts(entries, 'zzzzz')).toEqual([]);
});
```

- [ ] **Step 2: Run** `npm test -- useConceptSearch` → FAIL.

- [ ] **Step 3: Implement `useConceptSearch.ts`**

```ts
import { conceptEntries } from './concepts';
import type { ConceptEntry } from './concepts';

export function filterConcepts(entries: ConceptEntry[], query: string): ConceptEntry[] {
  const q = query.trim().toLowerCase();
  const base = [...entries].sort((a, b) => a.product.localeCompare(b.product) || a.title.localeCompare(b.title));
  if (!q) return base;
  const scored = base
    .map((e) => {
      const hay = `${e.title} ${e.product} ${e.slug}`.toLowerCase();
      if (!hay.includes(q)) return null;
      let score = 0;
      if (e.product.toLowerCase() === q) score += 3;
      if (e.title.toLowerCase().startsWith(q)) score += 2;
      if (e.slug.toLowerCase().startsWith(q)) score += 1;
      return { e, score };
    })
    .filter((x): x is { e: ConceptEntry; score: number } => x !== null)
    .sort((a, b) => b.score - a.score);
  return scored.map((x) => x.e);
}

export function useConceptSearch(query: string): ConceptEntry[] {
  return filterConcepts(conceptEntries(), query);
}
```

- [ ] **Step 4: Run** `npm test -- useConceptSearch` → PASS.

- [ ] **Step 5: Commit**
```bash
git add src/app/useConceptSearch.ts src/app/useConceptSearch.test.ts
git commit -m "feat(sandbox): concept search filtering"
```

---

## Task B2: AppHeader + AppLayout + route restructure

**Files:** Create `src/app/AppHeader.tsx`, `src/app/AppLayout.tsx`; Modify `src/app/App.tsx`, `src/app/Gallery.tsx`.

**Interfaces:**
- Consumes: `useConceptSearch`, `conceptEntries`, react-router `Outlet`/`Link`/`useNavigate`; ui-pes `Search` + `BaseDropdown` (VERIFY their real props in `node_modules/@universe-forma/ui-pes` before use — do not invent props; if `Search`/`BaseDropdown` APIs differ from expectation, adapt or compose from `Input` + a plain dropdown).
- Produces: `AppLayout` (header + `<Outlet/>`), `AppHeader` (wordmark link + concept search).

- [ ] **Step 1: `AppHeader.tsx`** — sticky top bar:
  - Left: `<Link to="/">` wordmark "Vibe Concepts" (brand dot + text). This is the back-to-gallery affordance on every route.
  - Right: a search box (ui-pes `Search` if its API fits, else `Input`) bound to local `query` state; results from `useConceptSearch(query)` render in a dropdown (ui-pes `BaseDropdown` if it fits, else a plain absolutely-positioned list) — each item shows product badge + title + mono `/c/<product>/<slug>`. Selecting navigates to `/c/${e.product}/${e.slug}` (multipage: `/c/${e.product}/${e.slug}/${e.flow!.start}` when `e.kind==='multi'`). Close on select/blur/Esc; `/` focuses the search.
  - Token classes + ui-pes; sticky `top-0 z-30` with `bg-bg-white-bg` + bottom border. Wrap header in a fixed `data-brand="pdfguru"` so its tokens resolve.

- [ ] **Step 2: `AppLayout.tsx`**

```tsx
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
export function AppLayout() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <Outlet />
    </div>
  );
}
```

- [ ] **Step 3: `App.tsx`** — wrap routes in the layout route:

```tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Gallery } from './Gallery';
import { ConceptRoute } from './ConceptRoute';
import { AppLayout } from './AppLayout';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Gallery />} />
          <Route path="/c/:product/:slug" element={<ConceptRoute />} />
          <Route path="/c/:product/:slug/:page" element={<ConceptRoute />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 4: Reconcile `Gallery.tsx`** — the global header now sits above the gallery. Remove the gallery hero's tiny wordmark dots row (the three `bg-primary` dots) if it now duplicates the header; keep the `<h1>` hero heading + description. Do not otherwise change the 3-column layout.

- [ ] **Step 5: Verify** — `npx tsc -b` clean; `npm test` green; `npm run build` succeeds. Manual: header shows on `/` and on `/c/...`; typing filters; selecting navigates (funnel → start page); wordmark returns to gallery; concept body brand still correct (header brand isolated).

- [ ] **Step 6: Commit**
```bash
git add src/app/AppHeader.tsx src/app/AppLayout.tsx src/app/App.tsx src/app/Gallery.tsx
git commit -m "feat(sandbox): app header with back-to-gallery and concept search"
```

---

## Self-Review

**Spec coverage:** Workspace/package → A1. Schema v2 + migration → A2. Taxonomy grounded in pdfguru → A3. Naming + tracking plan → A4. Finder anchoring + client → A5. Plugin moved → A6. Slim gate → A7. Overlay shell + query-param opt-in + self-contained CSS → A8. Tabs + runtime coverage + delete old → A9. Example migration + docs → A10. Concept search → B1. Header + layout → B2. ✓

**Type consistency:** `AnalyticsEvent`/`AnalyticsSpec`/`ElementAnchor`/`EventCategory` defined in A2, consumed identically in A3–A9. `TriggerDef`/`triggerById`/`triggersByCategory`/`PROPERTY_KEYS`/`PROPERTY_VALUES` defined A3, consumed A4/A9. `anchorFor` (A5) consumed A8/A9. `loadSpec/saveSpec/downloadSpec/copyText` (A5) consumed A8/A9. `filterConcepts` (B1) consumed B2. Gate `analyzeConcept(spec, pages)` where `pages=[{slug}]` — A7 impl and test agree.

**Placeholder scan:** UI tasks (A8/A9/B2) specify file responsibilities, exact interfaces, and acceptance criteria rather than full line-by-line JSX — deliberate for the UI layer given its size; the design spec carries the visual detail and implementers verify ui-pes/finder APIs against source. Core/gate/plugin/config tasks carry complete code. Two "verify real API" notes (ui-pes Search/BaseDropdown in B2; nothing invented) are guardrails, not deferred work.

**Ordering:** A1→A5 are independent pure modules (each testable alone). A6/A7 depend on A1 (package exists). A8 depends on A2–A5 + A1. A9 depends on A8. A10 depends on A9 + A7. Part B is independent of Part A (can run anytime after main); B2 depends on B1.
