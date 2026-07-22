# Analytics Tagging + Multipage Concepts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multipage/funnel concepts to the sandbox, then a dev-only in-app overlay that lets a PM tag interactive elements with analytics events and export a committed `analytics.json` contract.

**Architecture:** Part 1 extends concept registration/routing/gates so a concept dir with `flow.ts` holds `pages/<page>/Screen.tsx` (single-page concepts unchanged). Part 2 adds a dev-only Vite middleware that writes `analytics.json` into a concept folder, plus a React overlay (element picker → event form → spec panel) mounted in `ConceptRoute`, plus an advisory gate that warns on untagged interactive elements.

**Tech Stack:** Vite 6, React 19, TS 5 strict, react-router-dom 7, Vitest 4, ESM node gate scripts.

## Global Constraints

- `Screen.tsx` and every concept `.tsx` stay pure: only `@universe-forma/ui-pes` imports + Tailwind token classes. No raw hex, no raw palette utilities, no raw px where a token exists. No data-fetch / store / router / i18n inside concept components.
- Multipage page navigation is injected as `onNext` / `onBack` props from the route layer — pages never import the router.
- Overlay + dev-write plugin are `import.meta.env.DEV` (plugin: `command === 'serve'`) only; never in the production build.
- Event names in `analytics.json` MUST be non-empty `snake_case` (`^[a-z][a-z0-9]*(_[a-z0-9]+)*$`).
- Existing single-page concepts must keep working unchanged; the existing `src/app/concepts.test.ts` must stay green.
- The analytics gate is advisory: it warns on untagged elements / missing `page_load`, and hard-fails ONLY on invalid event names.
- Comments: hard cap 2 lines, only for non-obvious WHY. No banner comments. Commit subjects only (`<type>(<scope>): <subject>`), no body, no Co-Authored-By.
- Brand values are exactly `'pdfguru' | 'tbp' | 'pdfleader'`.

---

## File Structure

**Part 1 (multipage)**
- Modify `src/app/concepts.ts` — flow/page types, extend `listConcepts`, wire new globs.
- Create `src/app/flowNav.ts` — pure flow-navigation helpers.
- Create `src/app/flowNav.test.ts` — tests for the helpers.
- Modify `src/app/App.tsx` — add `/c/:product/:slug/:page` route.
- Modify `src/app/ConceptRoute.tsx` — render single or multipage; inject nav props; render `FlowBar`.
- Create `src/app/FlowBar.tsx` — dev flow chrome (prev / step N of M / branch buttons).
- Modify `src/app/Gallery.tsx` — funnel badge + page count on multipage cards.
- Modify `scripts/gates/verify-structure.mjs` — single vs multipage required-file sets.
- Modify `scripts/gates/verify-structure.test.mjs` (create if absent) — both structure shapes.
- Modify `scripts/gates/lib/scan.mjs` — add `conceptPages(dir)`.
- Create `src/app/flow-integrity.test.ts` — asserts every real `flow.ts` `start`/`next` resolve.
- Create `src/concepts/pdfguru/upload-funnel/` — worked multipage example.

**Part 2 (analytics)**
- Create `src/devtools/analytics-overlay/lib/schema.ts` — spec types + pure spec ops.
- Create `src/devtools/analytics-overlay/lib/schema.test.ts`.
- Create `src/devtools/analytics-overlay/lib/naming.ts` — naming/preview pure fns.
- Create `src/devtools/analytics-overlay/lib/naming.test.ts`.
- Create `scripts/vite-plugin-analytics-writer.mjs` — dev read/write middleware + path guard.
- Create `scripts/vite-plugin-analytics-writer.test.mjs` — path-guard tests.
- Modify `vite.config.ts` — register the plugin.
- Create `src/devtools/analytics-overlay/client.ts` — load/save/download.
- Create `src/devtools/analytics-overlay/useElementPicker.ts` — hover/click picker hook.
- Create `src/devtools/analytics-overlay/EventForm.tsx`, `SpecPanel.tsx`, `AnalyticsOverlay.tsx`.
- Modify `src/app/ConceptRoute.tsx` — mount overlay when `import.meta.env.DEV`.
- Create `scripts/gates/verify-analytics.mjs` + `scripts/gates/verify-analytics.test.mjs`.
- Modify `scripts/gates/run.mjs` — analytics warning section.
- Modify `package.json` — `gate:analytics` script.
- Modify `.claude/skills/vibe-concept/SKILL.md`, `references/conventions.md`, `src/concepts/_template/INTEGRATION.md`, `README.md`.

---

## Task 1: Multipage registration in concepts.ts

**Files:**
- Modify: `src/app/concepts.ts`
- Test: `src/app/concepts.test.ts` (extend; existing test must stay green)

**Interfaces:**
- Produces: `FlowPage = { slug: string; title: string; next?: string | string[] }`; `Flow = { start: string; pages: FlowPage[] }`; `PageEntry = { slug: string; title: string; next?: string | string[]; load: () => Promise<{ default: ComponentType<any> }>; loadMock: () => Promise<{ default: unknown }> }`; `ConceptEntry` gains `kind: 'single' | 'multi'`, optional `flow?: Flow`, optional `pages?: PageEntry[]` (single-page keeps `load`/`loadMock`; multipage sets `load`/`loadMock` to the start page's loaders for back-compat).
- Produces: `listConcepts(screens, metas, mocks, flows?, pageScreens?, pageMocks?)`.

- [ ] **Step 1: Write failing tests** — append to `src/app/concepts.test.ts`:

```ts
test('single-page entry has kind "single"', () => {
  const screens = { '/src/concepts/tbp/demo/Screen.tsx': () => Promise.resolve({ default: () => null }) };
  const metas = { '/src/concepts/tbp/demo/meta.ts': { title: 'Demo' } };
  const mocks = { '/src/concepts/tbp/demo/mock.ts': () => Promise.resolve({ default: {} }) };
  const [entry] = listConcepts(screens as any, metas as any, mocks as any);
  expect(entry.kind).toBe('single');
});

test('builds a multipage entry from flow + page globs', () => {
  const flows = { '/src/concepts/pdfguru/funnel/flow.ts': { start: 'a', pages: [
    { slug: 'a', title: 'Step A', next: 'b' }, { slug: 'b', title: 'Step B' },
  ] } };
  const metas = { '/src/concepts/pdfguru/funnel/meta.ts': { title: 'Funnel' } };
  const pageScreens = {
    '/src/concepts/pdfguru/funnel/pages/a/Screen.tsx': () => Promise.resolve({ default: () => null }),
    '/src/concepts/pdfguru/funnel/pages/b/Screen.tsx': () => Promise.resolve({ default: () => null }),
  };
  const pageMocks = {
    '/src/concepts/pdfguru/funnel/pages/a/mock.ts': () => Promise.resolve({ default: {} }),
    '/src/concepts/pdfguru/funnel/pages/b/mock.ts': () => Promise.resolve({ default: {} }),
  };
  const [entry] = listConcepts({} as any, metas as any, {} as any, flows as any, pageScreens as any, pageMocks as any);
  expect(entry).toMatchObject({ product: 'pdfguru', slug: 'funnel', kind: 'multi', title: 'Funnel' });
  expect(entry.pages?.map((p) => p.slug)).toEqual(['a', 'b']);
  expect(entry.flow?.start).toBe('a');
  expect(entry.pages?.[0].next).toBe('b');
});
```

- [ ] **Step 2: Run and verify new tests fail**

Run: `npm test -- concepts`
Expected: FAIL (`kind` undefined; multipage not built).

- [ ] **Step 3: Rewrite `src/app/concepts.ts`**

```ts
import type { ComponentType } from 'react';
import type { Brand } from './BrandProvider';

export type ConceptMeta = { title: string };
export type FlowPage = { slug: string; title: string; next?: string | string[] };
export type Flow = { start: string; pages: FlowPage[] };
export type PageEntry = {
  slug: string;
  title: string;
  next?: string | string[];
  load: () => Promise<{ default: ComponentType<any> }>;
  loadMock: () => Promise<{ default: unknown }>;
};
export type ConceptEntry = {
  product: Brand;
  slug: string;
  title: string;
  brand: Brand;
  kind: 'single' | 'multi';
  load: () => Promise<{ default: ComponentType<any> }>;
  loadMock: () => Promise<{ default: unknown }>;
  flow?: Flow;
  pages?: PageEntry[];
};

const partsOf = (p: string) => p.split('/');
const productOf = (p: string) => partsOf(p).slice(-3, -2)[0] as Brand;
const slugOf = (p: string) => partsOf(p).slice(-2, -1)[0];
// page path: /src/concepts/<product>/<slug>/pages/<page>/Screen.tsx
const pageProductOf = (p: string) => partsOf(p).slice(-5, -4)[0] as Brand;
const pageConceptOf = (p: string) => partsOf(p).slice(-4, -3)[0];
const pageNameOf = (p: string) => partsOf(p).slice(-2, -1)[0];

export function listConcepts(
  screens: Record<string, () => Promise<{ default: ComponentType<any> }>>,
  metas: Record<string, ConceptMeta>,
  mocks: Record<string, () => Promise<{ default: unknown }>>,
  flows: Record<string, Flow> = {},
  pageScreens: Record<string, () => Promise<{ default: ComponentType<any> }>> = {},
  pageMocks: Record<string, () => Promise<{ default: unknown }>> = {},
): ConceptEntry[] {
  const titleFor = (product: Brand, slug: string) => {
    const key = Object.keys(metas).find((m) => slugOf(m) === slug && productOf(m) === product);
    return metas[key!]?.title ?? slug;
  };

  const single: ConceptEntry[] = Object.keys(screens)
    .filter((p) => !productOf(p).startsWith('_'))
    .map((p) => {
      const product = productOf(p);
      const slug = slugOf(p);
      const mockKey = Object.keys(mocks).find((m) => slugOf(m) === slug && productOf(m) === product);
      return {
        product,
        slug,
        title: titleFor(product, slug),
        brand: product,
        kind: 'single' as const,
        load: screens[p],
        loadMock: mocks[mockKey!],
      };
    });

  const multi: ConceptEntry[] = Object.keys(flows)
    .filter((p) => !productOf(p).startsWith('_'))
    .map((p) => {
      const product = productOf(p);
      const slug = slugOf(p);
      const flow = flows[p];
      const pages: PageEntry[] = flow.pages.map((fp) => {
        const screenKey = Object.keys(pageScreens).find(
          (s) => pageProductOf(s) === product && pageConceptOf(s) === slug && pageNameOf(s) === fp.slug,
        );
        const mockKey = Object.keys(pageMocks).find(
          (m) => pageProductOf(m) === product && pageConceptOf(m) === slug && pageNameOf(m) === fp.slug,
        );
        return { slug: fp.slug, title: fp.title, next: fp.next, load: pageScreens[screenKey!], loadMock: pageMocks[mockKey!] };
      });
      const start = pages.find((pg) => pg.slug === flow.start) ?? pages[0];
      return {
        product,
        slug,
        title: titleFor(product, slug),
        brand: product,
        kind: 'multi' as const,
        load: start.load,
        loadMock: start.loadMock,
        flow,
        pages,
      };
    });

  return [...single, ...multi];
}

export const conceptEntries = () =>
  listConcepts(
    import.meta.glob<{ default: ComponentType<any> }>('/src/concepts/*/*/Screen.tsx'),
    import.meta.glob('/src/concepts/*/*/meta.ts', { eager: true, import: 'default' }) as Record<string, ConceptMeta>,
    import.meta.glob<{ default: unknown }>('/src/concepts/*/*/mock.ts'),
    import.meta.glob('/src/concepts/*/*/flow.ts', { eager: true, import: 'default' }) as Record<string, Flow>,
    import.meta.glob<{ default: ComponentType<any> }>('/src/concepts/*/*/pages/*/Screen.tsx'),
    import.meta.glob<{ default: unknown }>('/src/concepts/*/*/pages/*/mock.ts'),
  );
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm test -- concepts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/concepts.ts src/app/concepts.test.ts
git commit -m "feat(sandbox): register multipage concepts from flow.ts"
```

---

## Task 2: Flow navigation helpers

**Files:**
- Create: `src/app/flowNav.ts`
- Test: `src/app/flowNav.test.ts`

**Interfaces:**
- Consumes: `Flow` from `./concepts`.
- Produces: `resolvePage(flow, pageParam?)`; `nextTargets(flow, slug)` (always `string[]`); `prevSlug(flow, slug)` (`string | null`); `pageIndex(flow, slug)`; `pageCount(flow)`.

- [ ] **Step 1: Write failing tests** — `src/app/flowNav.test.ts`:

```ts
import { resolvePage, nextTargets, prevSlug, pageIndex, pageCount } from './flowNav';
import type { Flow } from './concepts';

const flow: Flow = { start: 'a', pages: [
  { slug: 'a', title: 'A', next: 'b' },
  { slug: 'b', title: 'B', next: ['c', 'a'] },
  { slug: 'c', title: 'C' },
] };

test('resolvePage falls back to start for missing/unknown param', () => {
  expect(resolvePage(flow)).toBe('a');
  expect(resolvePage(flow, 'zzz')).toBe('a');
  expect(resolvePage(flow, 'b')).toBe('b');
});
test('nextTargets normalizes to array', () => {
  expect(nextTargets(flow, 'a')).toEqual(['b']);
  expect(nextTargets(flow, 'b')).toEqual(['c', 'a']);
  expect(nextTargets(flow, 'c')).toEqual([]);
});
test('prevSlug returns previous page in declared order', () => {
  expect(prevSlug(flow, 'a')).toBeNull();
  expect(prevSlug(flow, 'b')).toBe('a');
  expect(prevSlug(flow, 'c')).toBe('b');
});
test('index and count', () => {
  expect(pageIndex(flow, 'b')).toBe(1);
  expect(pageCount(flow)).toBe(3);
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- flowNav`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/app/flowNav.ts`**

```ts
import type { Flow } from './concepts';

export const pageCount = (flow: Flow) => flow.pages.length;
export const pageIndex = (flow: Flow, slug: string) => flow.pages.findIndex((p) => p.slug === slug);

export function resolvePage(flow: Flow, pageParam?: string): string {
  if (pageParam && flow.pages.some((p) => p.slug === pageParam)) return pageParam;
  return flow.start;
}

export function nextTargets(flow: Flow, slug: string): string[] {
  const page = flow.pages.find((p) => p.slug === slug);
  if (!page?.next) return [];
  return Array.isArray(page.next) ? page.next : [page.next];
}

export function prevSlug(flow: Flow, slug: string): string | null {
  const i = pageIndex(flow, slug);
  return i > 0 ? flow.pages[i - 1].slug : null;
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npm test -- flowNav`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/flowNav.ts src/app/flowNav.test.ts
git commit -m "feat(sandbox): flow navigation helpers"
```

---

## Task 3: Routing + FlowBar for multipage

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/app/ConceptRoute.tsx`
- Create: `src/app/FlowBar.tsx`
- Test: `src/app/ConceptRoute.test.tsx`

**Interfaces:**
- Consumes: `ConceptEntry`, `Flow` (`./concepts`), flow helpers (`./flowNav`).
- Produces: `FlowBar` props `{ flow: Flow; current: string; onJump: (slug: string) => void }`. `ConceptRoute` renders multipage pages by `:page` param and passes `onNext`/`onBack` props to the page Screen.

- [ ] **Step 1: Write failing test** — `src/app/ConceptRoute.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { FlowBar } from './FlowBar';
import type { Flow } from './concepts';

const flow: Flow = { start: 'a', pages: [
  { slug: 'a', title: 'A', next: 'b' }, { slug: 'b', title: 'B' },
] };

test('FlowBar renders step position and a button per page', () => {
  render(
    <MemoryRouter>
      <Routes>
        <Route path="*" element={<FlowBar flow={flow} current="a" onJump={() => {}} />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByText(/step 1 of 2/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'B' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- ConceptRoute`
Expected: FAIL (FlowBar missing).

- [ ] **Step 3: Create `src/app/FlowBar.tsx`**

```tsx
import type { Flow } from './concepts';
import { pageIndex, pageCount } from './flowNav';

export function FlowBar({ flow, current, onJump }: { flow: Flow; current: string; onJump: (slug: string) => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-action-stroke bg-bg-white-bg px-4 py-2">
      <span className="text-caption-xs text-text-secondary">
        Step {pageIndex(flow, current) + 1} of {pageCount(flow)}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {flow.pages.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => onJump(p.slug)}
            className={`rounded-3 px-2 py-1 text-caption-xs ${p.slug === current ? 'bg-primary text-text-inverse' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {p.title}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Rewrite `src/app/ConceptRoute.tsx`**

```tsx
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { conceptEntries } from './concepts';
import type { ConceptEntry } from './concepts';
import { BrandProvider } from './BrandProvider';
import { FlowBar } from './FlowBar';
import { resolvePage, nextTargets, prevSlug } from './flowNav';

export function ConceptRoute() {
  const { product, slug, page } = useParams();
  const navigate = useNavigate();
  const entry = conceptEntries().find((e) => e.product === product && e.slug === slug);
  if (!entry) return <p className="p-8">Unknown concept.</p>;
  return entry.kind === 'multi'
    ? <MultiPage entry={entry} pageParam={page} navigate={(s) => navigate(`/c/${entry.product}/${entry.slug}/${s}`)} />
    : <SinglePage entry={entry} />;
}

function SinglePage({ entry }: { entry: ConceptEntry }) {
  const [mock, setMock] = useState<unknown>(null);
  useEffect(() => { entry.loadMock().then((m) => setMock(m.default)).catch((e) => console.error('mock load failed', e)); }, [entry]);
  const Screen = useMemo(() => lazy(entry.load), [entry]);
  return (
    <BrandProvider brand={entry.brand}>
      <Suspense fallback={<p className="p-8">Loading…</p>}>
        {mock !== null && <Screen {...(mock as object)} />}
      </Suspense>
    </BrandProvider>
  );
}

function MultiPage({ entry, pageParam, navigate }: { entry: ConceptEntry; pageParam?: string; navigate: (slug: string) => void }) {
  const flow = entry.flow!;
  const current = resolvePage(flow, pageParam);
  const pageEntry = entry.pages!.find((p) => p.slug === current)!;
  const [mock, setMock] = useState<unknown>(null);
  useEffect(() => { pageEntry.loadMock().then((m) => setMock(m.default)).catch((e) => console.error('mock load failed', e)); }, [pageEntry]);
  const Screen = useMemo(() => lazy(pageEntry.load), [pageEntry]);
  const targets = nextTargets(flow, current);
  const back = prevSlug(flow, current);
  const onNext = () => { if (targets[0]) navigate(targets[0]); };
  const onBack = () => { if (back) navigate(back); };
  return (
    <BrandProvider brand={entry.brand}>
      <Suspense fallback={<p className="p-8">Loading…</p>}>
        {mock !== null && <Screen {...(mock as object)} onNext={onNext} onBack={onBack} />}
      </Suspense>
      <FlowBar flow={flow} current={current} onJump={navigate} />
    </BrandProvider>
  );
}
```

- [ ] **Step 5: Update `src/app/App.tsx`** — add the page route:

```tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Gallery } from './Gallery';
import { ConceptRoute } from './ConceptRoute';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/c/:product/:slug" element={<ConceptRoute />} />
        <Route path="/c/:product/:slug/:page" element={<ConceptRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 6: Run tests + typecheck**

Run: `npm test -- ConceptRoute && npx tsc -b`
Expected: test PASS; tsc no errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/App.tsx src/app/ConceptRoute.tsx src/app/FlowBar.tsx src/app/ConceptRoute.test.tsx
git commit -m "feat(sandbox): route and render multipage concept flows"
```

---

## Task 4: Gallery funnel badge

**Files:**
- Modify: `src/app/Gallery.tsx`

**Interfaces:**
- Consumes: `ConceptEntry.kind`, `ConceptEntry.pages`.

- [ ] **Step 1: Edit the card in `src/app/Gallery.tsx`** — replace the `<Link>` inner header block so a multipage entry shows a funnel badge. Change the card body (the `<div className="flex items-start justify-between gap-2">` block) to:

```tsx
<div className="flex items-start justify-between gap-2">
  <span className="text-subtitle-emph text-text-primary">{e.title}</span>
  <span className="text-primary transition-transform duration-200 group-hover:translate-x-1">
    <Arrow />
  </span>
</div>
{e.kind === 'multi' && (
  <span className="w-fit rounded-3 bg-bg-light-grey px-2 py-0.5 text-caption-xs text-text-secondary">
    Funnel · {e.pages?.length ?? 0} pages
  </span>
)}
<span className="text-caption-xs text-text-secondary font-mono">
  /c/{e.product}/{e.slug}
</span>
```

Note: `conceptEntries()` already returns `kind`/`pages`; no import change needed.

- [ ] **Step 2: Build to verify**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/Gallery.tsx
git commit -m "feat(sandbox): funnel badge on multipage gallery cards"
```

---

## Task 5: Structure gate + flow integrity for multipage

**Files:**
- Modify: `scripts/gates/verify-structure.mjs`
- Create: `scripts/gates/verify-structure.test.mjs`
- Modify: `scripts/gates/lib/scan.mjs`
- Create: `src/app/flow-integrity.test.ts`

**Interfaces:**
- Produces: `verifyStructure(dir, deps?)` where `deps = { exists?, listDirs? }`; `conceptPages(dir)` → `{ multi: boolean, pages: { slug: string, screen: string }[] }`.

- [ ] **Step 1: Write failing gate test** — `scripts/gates/verify-structure.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyStructure } from './verify-structure.mjs';

test('single-page: reports missing required files', () => {
  const present = new Set(['/c/Screen.tsx', '/c/types.ts', '/c/mock.ts']);
  const findings = verifyStructure('/c', { exists: (p) => present.has(p), listDirs: () => [] });
  assert.ok(findings.some((f) => f.includes('meta.ts')));
  assert.ok(findings.some((f) => f.includes('INTEGRATION.md')));
});

test('single-page: clean when all present', () => {
  const all = new Set(['/c/Screen.tsx', '/c/types.ts', '/c/mock.ts', '/c/meta.ts', '/c/INTEGRATION.md']);
  assert.deepEqual(verifyStructure('/c', { exists: (p) => all.has(p), listDirs: () => [] }), []);
});

test('multipage: requires flow.ts set + each page files', () => {
  const present = new Set(['/c/flow.ts', '/c/meta.ts', '/c/INTEGRATION.md', '/c/pages/a/Screen.tsx']);
  const findings = verifyStructure('/c', {
    exists: (p) => present.has(p),
    listDirs: (d) => (d === '/c/pages' ? ['a'] : []),
  });
  assert.ok(findings.some((f) => f.includes('page "a" missing types.ts')));
  assert.ok(findings.some((f) => f.includes('page "a" missing mock.ts')));
});

test('multipage: clean when complete', () => {
  const all = new Set(['/c/flow.ts', '/c/meta.ts', '/c/INTEGRATION.md',
    '/c/pages/a/Screen.tsx', '/c/pages/a/types.ts', '/c/pages/a/mock.ts']);
  const findings = verifyStructure('/c', { exists: (p) => all.has(p), listDirs: (d) => (d === '/c/pages' ? ['a'] : []) });
  assert.deepEqual(findings, []);
});
```

- [ ] **Step 2: Run, verify fail**

Run: `node --test scripts/gates/verify-structure.test.mjs`
Expected: FAIL (new signature/behavior not implemented).

- [ ] **Step 3: Rewrite `scripts/gates/verify-structure.mjs`**

```js
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

export const SINGLE_REQUIRED = ['Screen.tsx', 'types.ts', 'mock.ts', 'meta.ts', 'INTEGRATION.md'];
export const MULTI_CONCEPT_REQUIRED = ['flow.ts', 'meta.ts', 'INTEGRATION.md'];
export const MULTI_PAGE_REQUIRED = ['Screen.tsx', 'types.ts', 'mock.ts'];

const defaultListDirs = (d) =>
  existsSync(d) ? readdirSync(d).filter((n) => statSync(path.join(d, n)).isDirectory()) : [];

export function verifyStructure(dir, deps = {}) {
  const exists = deps.exists ?? existsSync;
  const listDirs = deps.listDirs ?? defaultListDirs;

  if (exists(path.join(dir, 'flow.ts'))) {
    const findings = MULTI_CONCEPT_REQUIRED.filter((f) => !exists(path.join(dir, f))).map(
      (f) => `missing required file: ${f}`,
    );
    const pagesDir = path.join(dir, 'pages');
    const pages = listDirs(pagesDir);
    if (!pages.length) findings.push('multipage concept has no pages/ subfolders');
    for (const pg of pages) {
      for (const f of MULTI_PAGE_REQUIRED) {
        if (!exists(path.join(pagesDir, pg, f))) findings.push(`page "${pg}" missing ${f}`);
      }
    }
    return findings;
  }

  return SINGLE_REQUIRED.filter((f) => !exists(path.join(dir, f))).map(
    (f) => `missing required file: ${f} (every concept must ship one, incl. the INTEGRATION.md spec)`,
  );
}
```

- [ ] **Step 4: Add `conceptPages` to `scripts/gates/lib/scan.mjs`** — append:

```js
export function conceptPages(dir) {
  const flowPath = path.join(dir, 'flow.ts');
  if (!existsSync(flowPath)) {
    const screen = path.join(dir, 'Screen.tsx');
    return { multi: false, pages: existsSync(screen) ? [{ slug: 'screen', screen }] : [] };
  }
  const pagesDir = path.join(dir, 'pages');
  if (!existsSync(pagesDir)) return { multi: true, pages: [] };
  const pages = readdirSync(pagesDir)
    .filter((n) => statSync(path.join(pagesDir, n)).isDirectory())
    .map((slug) => ({ slug, screen: path.join(pagesDir, slug, 'Screen.tsx') }))
    .filter((p) => existsSync(p.screen));
  return { multi: true, pages };
}
```

- [ ] **Step 5: Create `src/app/flow-integrity.test.ts`** — validates real flows:

```ts
import type { Flow } from './concepts';

const flows = import.meta.glob('/src/concepts/*/*/flow.ts', { eager: true, import: 'default' }) as Record<string, Flow>;

test('every flow.ts has a valid start and resolvable next targets', () => {
  for (const [file, flow] of Object.entries(flows)) {
    const slugs = new Set(flow.pages.map((p) => p.slug));
    expect(slugs.has(flow.start), `${file}: start "${flow.start}" not a declared page`).toBe(true);
    for (const p of flow.pages) {
      const nexts = p.next ? (Array.isArray(p.next) ? p.next : [p.next]) : [];
      for (const n of nexts) {
        expect(slugs.has(n), `${file}: page "${p.slug}" next "${n}" not a declared page`).toBe(true);
      }
    }
  }
});
```

- [ ] **Step 6: Run all**

Run: `node --test scripts/gates/verify-structure.test.mjs && npm test -- flow-integrity && npm run gate`
Expected: node tests PASS; flow-integrity PASS (0 flows yet is fine); `npm run gate` still passes on existing concepts.

- [ ] **Step 7: Commit**

```bash
git add scripts/gates/verify-structure.mjs scripts/gates/verify-structure.test.mjs scripts/gates/lib/scan.mjs src/app/flow-integrity.test.ts
git commit -m "feat(gate): validate multipage concept structure and flow integrity"
```

---

## Task 6: Worked multipage example concept

**Files:**
- Create: `src/concepts/pdfguru/upload-funnel/flow.ts`
- Create: `src/concepts/pdfguru/upload-funnel/meta.ts`
- Create: `src/concepts/pdfguru/upload-funnel/INTEGRATION.md`
- Create: `src/concepts/pdfguru/upload-funnel/pages/select-file/{Screen.tsx,types.ts,mock.ts}`
- Create: `src/concepts/pdfguru/upload-funnel/pages/processing/{Screen.tsx,types.ts,mock.ts}`
- Create: `src/concepts/pdfguru/upload-funnel/pages/done/{Screen.tsx,types.ts,mock.ts}`

**Interfaces:**
- Consumes: `@universe-forma/ui-pes` `Button`; nav props `onNext`/`onBack` injected by the route.

- [ ] **Step 1: `flow.ts`**

```ts
import type { Flow } from '../../../app/concepts';
const flow: Flow = {
  start: 'select-file',
  pages: [
    { slug: 'select-file', title: 'Select file', next: 'processing' },
    { slug: 'processing', title: 'Processing', next: 'done' },
    { slug: 'done', title: 'Done' },
  ],
};
export default flow;
```

- [ ] **Step 2: `meta.ts`**

```ts
const meta = { title: 'Upload funnel' };
export default meta;
```

- [ ] **Step 3: `pages/select-file/types.ts`**

```ts
export type SelectFileProps = {
  heading: string;
  subheading: string;
  ctaLabel: string;
  onNext?: () => void;
};
```

- [ ] **Step 4: `pages/select-file/Screen.tsx`**

```tsx
import { Button } from '@universe-forma/ui-pes';
import type { SelectFileProps } from './types';

export default function Screen({ heading, subheading, ctaLabel, onNext }: SelectFileProps) {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-6 py-16 text-center">
      <h1 className="text-desktop-title-4 text-text-primary">{heading}</h1>
      <p className="text-body-2 text-text-secondary">{subheading}</p>
      <Button onClick={onNext}>{ctaLabel}</Button>
    </div>
  );
}
```

- [ ] **Step 5: `pages/select-file/mock.ts`**

```ts
import type { SelectFileProps } from './types';
const mock: SelectFileProps = {
  heading: 'Select a PDF to compress',
  subheading: 'Drop a file or choose from your device to start.',
  ctaLabel: 'Choose file',
  onNext: () => {},
};
export default mock;
```

- [ ] **Step 6: `pages/processing/{types.ts,Screen.tsx,mock.ts}`**

`types.ts`:
```ts
export type ProcessingProps = { heading: string; note: string; ctaLabel: string; onNext?: () => void; onBack?: () => void };
```
`Screen.tsx`:
```tsx
import { Button } from '@universe-forma/ui-pes';
import type { ProcessingProps } from './types';

export default function Screen({ heading, note, ctaLabel, onNext, onBack }: ProcessingProps) {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-6 py-16 text-center">
      <h1 className="text-desktop-title-4 text-text-primary">{heading}</h1>
      <p className="text-body-2 text-text-secondary">{note}</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>{ctaLabel}</Button>
      </div>
    </div>
  );
}
```
`mock.ts`:
```ts
import type { ProcessingProps } from './types';
const mock: ProcessingProps = {
  heading: 'Compressing your PDF…',
  note: 'This usually takes a few seconds.',
  ctaLabel: 'View result',
  onNext: () => {},
  onBack: () => {},
};
export default mock;
```

Note: confirm `variant="secondary"` is a real ui-pes `Button` prop before use; if the prop differs, use the correct variant name from `node_modules/@universe-forma/ui-pes` and adjust. If no secondary variant exists, omit the Back button rather than invent a prop.

- [ ] **Step 7: `pages/done/{types.ts,Screen.tsx,mock.ts}`**

`types.ts`:
```ts
export type DoneProps = { heading: string; subheading: string; ctaLabel: string; onBack?: () => void };
```
`Screen.tsx`:
```tsx
import { Button } from '@universe-forma/ui-pes';
import type { DoneProps } from './types';

export default function Screen({ heading, subheading, ctaLabel, onBack }: DoneProps) {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-6 py-16 text-center">
      <h1 className="text-desktop-title-4 text-text-primary">{heading}</h1>
      <p className="text-body-2 text-text-secondary">{subheading}</p>
      <Button onClick={onBack}>{ctaLabel}</Button>
    </div>
  );
}
```
`mock.ts`:
```ts
import type { DoneProps } from './types';
const mock: DoneProps = {
  heading: 'Your PDF is ready',
  subheading: 'Download the compressed file or start over.',
  ctaLabel: 'Start over',
  onBack: () => {},
};
export default mock;
```

- [ ] **Step 8: `INTEGRATION.md`** — follow `src/concepts/_template/INTEGRATION.md`; document the 3-page funnel, per-page props tables, and that `onNext`/`onBack` are supplied by the product router (not the concept).

- [ ] **Step 9: Verify end to end**

Run: `npm run gate && npm test && npm run build`
Expected: gate passes (structure recognizes multipage), flow-integrity passes, build succeeds. Then `npm run dev` and open `/c/pdfguru/upload-funnel` — the select-file page renders, the flow bar shows 3 steps, Choose file advances to processing.

- [ ] **Step 10: Commit**

```bash
git add src/concepts/pdfguru/upload-funnel
git commit -m "feat(concepts): pdfguru upload-funnel multipage example"
```

---

## Task 7: Analytics spec schema + naming libs

**Files:**
- Create: `src/devtools/analytics-overlay/lib/schema.ts`
- Create: `src/devtools/analytics-overlay/lib/schema.test.ts`
- Create: `src/devtools/analytics-overlay/lib/naming.ts`
- Create: `src/devtools/analytics-overlay/lib/naming.test.ts`

**Interfaces:**
- Produces: `Trigger = 'click' | 'page_load' | 'input_change'`; `ElementAnchor = { tag: string; role: string | null; label: string; occurrence: number }`; `AnalyticsEvent = { id: string; page: string; trigger: Trigger; event: string; data: Record<string, string>; element?: ElementAnchor; notes: string }`; `AnalyticsSpec = { version: 1; product: string; concept: string; events: AnalyticsEvent[] }`.
- Produces: `emptySpec(product, concept)`; `upsertEvent(spec, event)`; `removeEvent(spec, id)`; `nextEventId(spec)`.
- Produces (naming): `isSnakeCase(s)`; `suggestSuffix(trigger)`; `deriveEventName(label, trigger)`; `renderAmplitudeCall(event)`.

- [ ] **Step 1: Write failing `schema.test.ts`**

```ts
import { emptySpec, upsertEvent, removeEvent, nextEventId } from './schema';

test('emptySpec shape', () => {
  expect(emptySpec('pdfguru', 'funnel')).toEqual({ version: 1, product: 'pdfguru', concept: 'funnel', events: [] });
});
test('upsertEvent adds then replaces by id', () => {
  let s = emptySpec('pdfguru', 'funnel');
  s = upsertEvent(s, { id: 'evt_1', page: 'a', trigger: 'click', event: 'x_tap', data: {}, notes: '' });
  expect(s.events).toHaveLength(1);
  s = upsertEvent(s, { id: 'evt_1', page: 'a', trigger: 'click', event: 'y_tap', data: {}, notes: '' });
  expect(s.events).toHaveLength(1);
  expect(s.events[0].event).toBe('y_tap');
});
test('removeEvent + nextEventId', () => {
  let s = emptySpec('pdfguru', 'funnel');
  expect(nextEventId(s)).toBe('evt_1');
  s = upsertEvent(s, { id: 'evt_1', page: 'a', trigger: 'click', event: 'x_tap', data: {}, notes: '' });
  expect(nextEventId(s)).toBe('evt_2');
  s = removeEvent(s, 'evt_1');
  expect(s.events).toHaveLength(0);
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- schema`
Expected: FAIL.

- [ ] **Step 3: Implement `schema.ts`**

```ts
export type Trigger = 'click' | 'page_load' | 'input_change';
export type ElementAnchor = { tag: string; role: string | null; label: string; occurrence: number };
export type AnalyticsEvent = {
  id: string;
  page: string;
  trigger: Trigger;
  event: string;
  data: Record<string, string>;
  element?: ElementAnchor;
  notes: string;
};
export type AnalyticsSpec = { version: 1; product: string; concept: string; events: AnalyticsEvent[] };

export const emptySpec = (product: string, concept: string): AnalyticsSpec => ({ version: 1, product, concept, events: [] });

export function upsertEvent(spec: AnalyticsSpec, event: AnalyticsEvent): AnalyticsSpec {
  const i = spec.events.findIndex((e) => e.id === event.id);
  const events = i >= 0 ? spec.events.map((e) => (e.id === event.id ? event : e)) : [...spec.events, event];
  return { ...spec, events };
}

export const removeEvent = (spec: AnalyticsSpec, id: string): AnalyticsSpec => ({
  ...spec,
  events: spec.events.filter((e) => e.id !== id),
});

export function nextEventId(spec: AnalyticsSpec): string {
  const max = spec.events.reduce((m, e) => {
    const n = Number(e.id.replace('evt_', ''));
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `evt_${max + 1}`;
}
```

- [ ] **Step 4: Write failing `naming.test.ts`**

```ts
import { isSnakeCase, suggestSuffix, deriveEventName, renderAmplitudeCall } from './naming';

test('isSnakeCase', () => {
  expect(isSnakeCase('file_upload_status')).toBe(true);
  expect(isSnakeCase('FileUpload')).toBe(false);
  expect(isSnakeCase('')).toBe(false);
  expect(isSnakeCase('_x')).toBe(false);
  expect(isSnakeCase('x__y')).toBe(false);
});
test('suggestSuffix', () => {
  expect(suggestSuffix('click')).toBe('tap');
  expect(suggestSuffix('page_load')).toBe('view');
  expect(suggestSuffix('input_change')).toBe('change');
});
test('deriveEventName from label + trigger', () => {
  expect(deriveEventName('Upload PDF', 'click')).toBe('upload_pdf_tap');
  expect(deriveEventName('Select plan', 'page_load')).toBe('select_plan_view');
});
test('renderAmplitudeCall with and without data', () => {
  expect(renderAmplitudeCall({ id: 'evt_1', page: 'a', trigger: 'click', event: 'x_tap', data: {}, notes: '' }))
    .toBe("dispatch(sendAnalyticEvent({ event: 'x_tap' }))");
  expect(renderAmplitudeCall({ id: 'evt_1', page: 'a', trigger: 'click', event: 'x_tap', data: { method: 'click' }, notes: '' }))
    .toBe("dispatch(sendAnalyticEvent({ event: 'x_tap', data: { method: 'click' } }))");
});
```

- [ ] **Step 5: Run, verify fail**

Run: `npm test -- naming`
Expected: FAIL.

- [ ] **Step 6: Implement `naming.ts`**

```ts
import type { AnalyticsEvent, Trigger } from './schema';

const SNAKE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
export const isSnakeCase = (s: string) => SNAKE.test(s);

export function suggestSuffix(trigger: Trigger): string {
  return trigger === 'click' ? 'tap' : trigger === 'page_load' ? 'view' : 'change';
}

export function deriveEventName(label: string, trigger: Trigger): string {
  const base = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return base ? `${base}_${suggestSuffix(trigger)}` : suggestSuffix(trigger);
}

export function renderAmplitudeCall(event: AnalyticsEvent): string {
  const keys = Object.keys(event.data);
  if (!keys.length) return `dispatch(sendAnalyticEvent({ event: '${event.event}' }))`;
  const data = keys.map((k) => `${k}: '${event.data[k]}'`).join(', ');
  return `dispatch(sendAnalyticEvent({ event: '${event.event}', data: { ${data} } }))`;
}
```

- [ ] **Step 7: Run both, verify pass**

Run: `npm test -- schema naming`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/devtools/analytics-overlay/lib
git commit -m "feat(analytics): spec schema and event-naming helpers"
```

---

## Task 8: Dev Vite plugin to read/write analytics.json

**Files:**
- Create: `scripts/vite-plugin-analytics-writer.mjs`
- Create: `scripts/vite-plugin-analytics-writer.test.mjs`
- Modify: `vite.config.ts`

**Interfaces:**
- Produces: default export `analyticsWriter()` returning a Vite plugin (dev-only middleware on `/__analytics/:product/:slug`); named export `resolveConceptPath(root, product, slug)` returning an absolute path or `null` if outside `src/concepts` or malformed.

- [ ] **Step 1: Write failing `vite-plugin-analytics-writer.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { resolveConceptPath } from './vite-plugin-analytics-writer.mjs';

const root = '/repo';
test('valid product + slug resolves inside src/concepts', () => {
  assert.equal(
    resolveConceptPath(root, 'pdfguru', 'funnel'),
    path.join(root, 'src/concepts/pdfguru/funnel/analytics.json'),
  );
});
test('rejects unknown product', () => {
  assert.equal(resolveConceptPath(root, 'evil', 'funnel'), null);
});
test('rejects path traversal in slug', () => {
  assert.equal(resolveConceptPath(root, 'pdfguru', '../../etc'), null);
  assert.equal(resolveConceptPath(root, 'pdfguru', 'a/b'), null);
});
```

- [ ] **Step 2: Run, verify fail**

Run: `node --test scripts/vite-plugin-analytics-writer.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement `scripts/vite-plugin-analytics-writer.mjs`**

```js
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const PRODUCTS = new Set(['pdfguru', 'tbp', 'pdfleader']);
const SLUG = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

export function resolveConceptPath(root, product, slug) {
  if (!PRODUCTS.has(product) || !SLUG.test(slug)) return null;
  const base = path.join(root, 'src/concepts');
  const target = path.join(base, product, slug, 'analytics.json');
  if (!target.startsWith(base + path.sep)) return null;
  return target;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

export default function analyticsWriter() {
  return {
    name: 'analytics-writer',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root;
      server.middlewares.use('/__analytics', async (req, res) => {
        const parts = req.url.split('?')[0].split('/').filter(Boolean); // [product, slug]
        const file = parts.length === 2 ? resolveConceptPath(root, parts[0], parts[1]) : null;
        if (!file) { res.statusCode = 400; res.end('bad target'); return; }
        if (req.method === 'GET') {
          res.setHeader('content-type', 'application/json');
          res.end(existsSync(file) ? readFileSync(file, 'utf8') : JSON.stringify({ version: 1, product: parts[0], concept: parts[1], events: [] }));
          return;
        }
        if (req.method === 'POST') {
          try {
            const body = JSON.parse(await readBody(req));
            mkdirSync(path.dirname(file), { recursive: true });
            writeFileSync(file, JSON.stringify(body, null, 2) + '\n');
            res.statusCode = 200; res.end('ok');
          } catch (e) { res.statusCode = 400; res.end(String(e)); }
          return;
        }
        res.statusCode = 405; res.end('method not allowed');
      });
    },
  };
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `node --test scripts/vite-plugin-analytics-writer.test.mjs`
Expected: PASS.

- [ ] **Step 5: Register in `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import analyticsWriter from './scripts/vite-plugin-analytics-writer.mjs';

export default defineConfig({
  plugins: [react(), tailwindcss(), analyticsWriter()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { open: true },
  build: { outDir: 'build' },
});
```

- [ ] **Step 6: Verify build unaffected**

Run: `npm run build`
Expected: succeeds (plugin `apply: 'serve'` excluded from build).

- [ ] **Step 7: Commit**

```bash
git add scripts/vite-plugin-analytics-writer.mjs scripts/vite-plugin-analytics-writer.test.mjs vite.config.ts
git commit -m "feat(analytics): dev vite plugin to read/write analytics.json"
```

---

## Task 9: Overlay client (load / save / download)

**Files:**
- Create: `src/devtools/analytics-overlay/client.ts`

**Interfaces:**
- Consumes: `AnalyticsSpec` (`./lib/schema`).
- Produces: `loadSpec(product, slug)`; `saveSpec(spec)`; `downloadSpec(spec)`.

- [ ] **Step 1: Implement `src/devtools/analytics-overlay/client.ts`**

```ts
import type { AnalyticsSpec } from './lib/schema';
import { emptySpec } from './lib/schema';

const url = (product: string, concept: string) => `/__analytics/${product}/${concept}`;

export async function loadSpec(product: string, concept: string): Promise<AnalyticsSpec> {
  try {
    const res = await fetch(url(product, concept));
    if (!res.ok) return emptySpec(product, concept);
    return (await res.json()) as AnalyticsSpec;
  } catch {
    return emptySpec(product, concept);
  }
}

export async function saveSpec(spec: AnalyticsSpec): Promise<boolean> {
  try {
    const res = await fetch(url(spec.product, spec.concept), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(spec),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function downloadSpec(spec: AnalyticsSpec): void {
  const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = `${spec.product}-${spec.concept}.analytics.json`;
  a.click();
  URL.revokeObjectURL(href);
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/devtools/analytics-overlay/client.ts
git commit -m "feat(analytics): overlay client for load/save/download"
```

---

## Task 10: Overlay UI (picker, form, panel) mounted in ConceptRoute

**Files:**
- Create: `src/devtools/analytics-overlay/useElementPicker.ts`
- Create: `src/devtools/analytics-overlay/EventForm.tsx`
- Create: `src/devtools/analytics-overlay/SpecPanel.tsx`
- Create: `src/devtools/analytics-overlay/AnalyticsOverlay.tsx`
- Modify: `src/app/ConceptRoute.tsx`

**Interfaces:**
- Consumes: `AnalyticsSpec`, `AnalyticsEvent`, `Trigger`, `ElementAnchor` (`./lib/schema`); naming fns; `loadSpec`/`saveSpec`/`downloadSpec` (`./client`).
- Produces: `AnalyticsOverlay` props `{ product: string; concept: string; page: string }`.

- [ ] **Step 1: Implement `useElementPicker.ts`** — hover highlight + click capture:

```ts
import { useEffect, useState } from 'react';
import type { ElementAnchor } from './lib/schema';

const INTERACTIVE = 'button, a, input, select, textarea, [role="button"], [role="tab"], [role="switch"]';

function anchorFor(el: Element): ElementAnchor {
  const tag = el.tagName.toLowerCase();
  const role = el.getAttribute('role');
  const label = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 60);
  const peers = Array.from(document.querySelectorAll(INTERACTIVE)).filter(
    (n) => n.tagName === el.tagName && (n.getAttribute('aria-label') || n.textContent || '').trim().slice(0, 60) === label,
  );
  return { tag, role, label, occurrence: Math.max(0, peers.indexOf(el)) };
}

export function useElementPicker(active: boolean, onPick: (anchor: ElementAnchor, rect: DOMRect) => void) {
  const [hover, setHover] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (!active) { setHover(null); return; }
    const target = (e: Event) => (e.target as Element)?.closest(INTERACTIVE);
    const move = (e: MouseEvent) => { const el = target(e); setHover(el ? el.getBoundingClientRect() : null); };
    const click = (e: MouseEvent) => {
      const el = target(e);
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      onPick(anchorFor(el), el.getBoundingClientRect());
    };
    document.addEventListener('mousemove', move, true);
    document.addEventListener('click', click, true);
    return () => { document.removeEventListener('mousemove', move, true); document.removeEventListener('click', click, true); };
  }, [active, onPick]);
  return hover;
}
```

- [ ] **Step 2: Implement `EventForm.tsx`**

```tsx
import { useState } from 'react';
import type { AnalyticsEvent, ElementAnchor, Trigger } from './lib/schema';
import { deriveEventName, isSnakeCase } from './lib/naming';

type Props = {
  page: string;
  anchor?: ElementAnchor;
  initial?: AnalyticsEvent;
  id: string;
  onSave: (event: AnalyticsEvent) => void;
  onCancel: () => void;
};

export function EventForm({ page, anchor, initial, id, onSave, onCancel }: Props) {
  const [trigger, setTrigger] = useState<Trigger>(initial?.trigger ?? (anchor ? 'click' : 'page_load'));
  const [name, setName] = useState(initial?.event ?? deriveEventName(anchor?.label ?? page, trigger));
  const [rows, setRows] = useState<[string, string][]>(Object.entries(initial?.data ?? {}));
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const valid = isSnakeCase(name);

  const save = () => {
    const data = Object.fromEntries(rows.filter(([k]) => k.trim()));
    onSave({ id, page, trigger, event: name, data, element: anchor ?? initial?.element, notes });
  };

  return (
    <div className="flex w-80 flex-col gap-3 rounded-4 border border-action-stroke bg-bg-white-bg p-4 shadow-lg">
      <label className="flex flex-col gap-1 text-caption-xs text-text-secondary">
        Trigger
        <select className="rounded-3 border border-action-stroke px-2 py-1 text-body-2 text-text-primary" value={trigger}
          onChange={(e) => { const t = e.target.value as Trigger; setTrigger(t); setName(deriveEventName(anchor?.label ?? page, t)); }}>
          <option value="click">click</option>
          <option value="page_load">page_load</option>
          <option value="input_change">input_change</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-caption-xs text-text-secondary">
        Event name
        <input className={`rounded-3 border px-2 py-1 text-body-2 ${valid ? 'border-action-stroke text-text-primary' : 'border-error text-error'}`}
          value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="flex flex-col gap-1">
        <span className="text-caption-xs text-text-secondary">data</span>
        {rows.map(([k, v], i) => (
          <div key={i} className="flex gap-1">
            <input className="w-1/2 rounded-3 border border-action-stroke px-2 py-1 text-caption-xs" placeholder="key" value={k}
              onChange={(e) => setRows(rows.map((r, j) => (j === i ? [e.target.value, r[1]] : r)))} />
            <input className="w-1/2 rounded-3 border border-action-stroke px-2 py-1 text-caption-xs" placeholder="value" value={v}
              onChange={(e) => setRows(rows.map((r, j) => (j === i ? [r[0], e.target.value] : r)))} />
          </div>
        ))}
        <button type="button" className="text-caption-xs text-primary" onClick={() => setRows([...rows, ['', '']])}>+ add prop</button>
      </div>
      <textarea className="rounded-3 border border-action-stroke px-2 py-1 text-caption-xs" placeholder="notes" value={notes}
        onChange={(e) => setNotes(e.target.value)} />
      <div className="flex justify-end gap-2">
        <button type="button" className="text-caption-xs text-text-secondary" onClick={onCancel}>Cancel</button>
        <button type="button" disabled={!valid} className="rounded-3 bg-primary px-3 py-1 text-caption-xs text-text-inverse disabled:opacity-40" onClick={save}>Save event</button>
      </div>
    </div>
  );
}
```

Note: verify `border-error`, `text-error`, `text-text-inverse` exist in the token catalog (`ds-catalog/color-tokens.md`); substitute the nearest real token if not, so the analytics gate's own token rules would pass. Overlay files live under `src/devtools/` (NOT `src/concepts/`), so concept gates do not scan them — but keep tokens real for consistency.

- [ ] **Step 3: Implement `SpecPanel.tsx`**

```tsx
import type { AnalyticsSpec } from './lib/schema';
import { renderAmplitudeCall } from './lib/naming';

export function SpecPanel({ spec, page, onEdit, onRemove }: {
  spec: AnalyticsSpec; page: string; onEdit: (id: string) => void; onRemove: (id: string) => void;
}) {
  const events = spec.events.filter((e) => e.page === page);
  return (
    <div className="flex max-h-80 w-96 flex-col gap-2 overflow-auto rounded-4 border border-action-stroke bg-bg-white-bg p-3">
      <span className="text-caption-xs text-text-secondary">{events.length} event(s) on “{page}”</span>
      {events.map((e) => (
        <div key={e.id} className="flex flex-col gap-1 rounded-3 border border-action-stroke p-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-caption text-text-primary">{e.event}</span>
            <span className="text-caption-xs text-text-secondary">{e.trigger}{e.element ? ` · ${e.element.label}` : ''}</span>
          </div>
          <code className="text-caption-xs text-text-secondary">{renderAmplitudeCall(e)}</code>
          <div className="flex justify-end gap-2">
            <button type="button" className="text-caption-xs text-primary" onClick={() => onEdit(e.id)}>Edit</button>
            <button type="button" className="text-caption-xs text-error" onClick={() => onRemove(e.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Implement `AnalyticsOverlay.tsx`**

```tsx
import { useCallback, useEffect, useState } from 'react';
import type { AnalyticsEvent, AnalyticsSpec, ElementAnchor } from './lib/schema';
import { emptySpec, nextEventId, removeEvent, upsertEvent } from './lib/schema';
import { loadSpec, saveSpec, downloadSpec } from './client';
import { useElementPicker } from './useElementPicker';
import { EventForm } from './EventForm';
import { SpecPanel } from './SpecPanel';

export function AnalyticsOverlay({ product, concept, page }: { product: string; concept: string; page: string }) {
  const [spec, setSpec] = useState<AnalyticsSpec>(emptySpec(product, concept));
  const [tagMode, setTagMode] = useState(false);
  const [draft, setDraft] = useState<{ id: string; anchor?: ElementAnchor; initial?: AnalyticsEvent } | null>(null);

  useEffect(() => { loadSpec(product, concept).then(setSpec); }, [product, concept]);

  const onPick = useCallback((anchor: ElementAnchor) => {
    setTagMode(false);
    setSpec((s) => { setDraft({ id: nextEventId(s), anchor }); return s; });
  }, []);
  const hover = useElementPicker(tagMode, onPick);

  const persist = (next: AnalyticsSpec) => { setSpec(next); saveSpec(next); };
  const onSaveEvent = (event: AnalyticsEvent) => { persist(upsertEvent(spec, event)); setDraft(null); };
  const addPageLoad = () => setDraft({ id: nextEventId(spec) });
  const editEvent = (id: string) => { const e = spec.events.find((x) => x.id === id); if (e) setDraft({ id, anchor: e.element, initial: e }); };

  return (
    <>
      {hover && (
        <div className="pointer-events-none fixed z-50 border-2 border-primary"
          style={{ left: hover.left, top: hover.top, width: hover.width, height: hover.height }} />
      )}
      <div className="fixed right-4 top-4 z-50 flex flex-col items-end gap-2">
        <div className="flex gap-2 rounded-4 border border-action-stroke bg-bg-white-bg p-2 shadow-lg">
          <button type="button" className={`rounded-3 px-3 py-1 text-caption-xs ${tagMode ? 'bg-primary text-text-inverse' : 'text-text-primary'}`}
            onClick={() => setTagMode((v) => !v)}>{tagMode ? 'Picking… (esc)' : 'Tag'}</button>
          <button type="button" className="rounded-3 px-3 py-1 text-caption-xs text-text-primary" onClick={addPageLoad}>+ page_load</button>
          <button type="button" className="rounded-3 px-3 py-1 text-caption-xs text-text-primary" onClick={() => downloadSpec(spec)}>Download</button>
        </div>
        {draft && (
          <EventForm page={page} id={draft.id} anchor={draft.anchor} initial={draft.initial}
            onSave={onSaveEvent} onCancel={() => setDraft(null)} />
        )}
        <SpecPanel spec={spec} page={page} onEdit={editEvent} onRemove={(id) => persist(removeEvent(spec, id))} />
      </div>
    </>
  );
}
```

Add an Escape handler to cancel tag mode inside the existing `useEffect` in `useElementPicker` (listen for `keydown` Escape → `setHover(null)` is not enough; call is in overlay — simplest: in `AnalyticsOverlay`, add `useEffect` binding Escape to `setTagMode(false)`). Include:

```tsx
useEffect(() => {
  const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setTagMode(false); };
  window.addEventListener('keydown', esc);
  return () => window.removeEventListener('keydown', esc);
}, []);
```

- [ ] **Step 5: Mount in `ConceptRoute.tsx`** — in BOTH `SinglePage` and `MultiPage`, render the overlay under DEV. Add import at top:

```tsx
import { AnalyticsOverlay } from '../devtools/analytics-overlay/AnalyticsOverlay';
```

In `SinglePage`, inside `<BrandProvider>` after `<Suspense>`:
```tsx
{import.meta.env.DEV && <AnalyticsOverlay product={entry.product} concept={entry.slug} page="screen" />}
```
In `MultiPage`, after `<FlowBar>`:
```tsx
{import.meta.env.DEV && <AnalyticsOverlay product={entry.product} concept={entry.slug} page={current} />}
```

- [ ] **Step 6: Typecheck + build + dev smoke**

Run: `npx tsc -b && npm run build`
Expected: no type errors; build succeeds (overlay tree-shakes out under `import.meta.env.DEV` false in production).
Then `npm run dev`, open `/c/pdfguru/upload-funnel`, click Tag, hover the CTA (blue outline), click it, fill the form, Save → confirm `src/concepts/pdfguru/upload-funnel/analytics.json` is written.

- [ ] **Step 7: Commit**

```bash
git add src/devtools/analytics-overlay src/app/ConceptRoute.tsx
git commit -m "feat(analytics): in-app tagging overlay"
```

---

## Task 11: Advisory analytics gate

**Files:**
- Create: `scripts/gates/verify-analytics.mjs`
- Create: `scripts/gates/verify-analytics.test.mjs`
- Modify: `scripts/gates/run.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `conceptDirs`, `conceptPages` (`./lib/scan.mjs`).
- Produces: `scanInteractive(src)` → `{ type: string; label: string }[]`; `analyzeConcept(spec, pages)` → `{ warnings: string[]; errors: string[] }` where errors = invalid event names (hard-fail), warnings = untagged elements + pages missing page_load + missing spec.

- [ ] **Step 1: Write failing `verify-analytics.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanInteractive, analyzeConcept } from './verify-analytics.mjs';

test('scanInteractive finds ui-pes + native interactives with labels', () => {
  const src = `
    <Button onClick={onNext}>Choose file</Button>
    <button type="button">Skip</button>
    <Input placeholder="Email" />
  `;
  const found = scanInteractive(src);
  assert.ok(found.some((f) => f.label === 'Choose file'));
  assert.ok(found.some((f) => f.label === 'Skip'));
  assert.ok(found.some((f) => f.type === 'Input'));
});

test('analyzeConcept flags invalid names as errors', () => {
  const spec = { version: 1, product: 'p', concept: 'c', events: [
    { id: 'evt_1', page: 'screen', trigger: 'click', event: 'BadName', data: {}, notes: '' },
  ] };
  const { errors } = analyzeConcept(spec, [{ slug: 'screen', interactives: [] }]);
  assert.ok(errors.some((e) => e.includes('BadName')));
});

test('analyzeConcept warns on missing page_load and untagged elements', () => {
  const spec = { version: 1, product: 'p', concept: 'c', events: [] };
  const { warnings } = analyzeConcept(spec, [{ slug: 'screen', interactives: [{ type: 'Button', label: 'Go' }] }]);
  assert.ok(warnings.some((w) => w.includes('page_load')));
  assert.ok(warnings.some((w) => w.includes('Go')));
});

test('analyzeConcept: null spec warns not-tagged', () => {
  const { warnings } = analyzeConcept(null, [{ slug: 'screen', interactives: [] }]);
  assert.ok(warnings.some((w) => w.includes('no analytics')));
});
```

- [ ] **Step 2: Run, verify fail**

Run: `node --test scripts/gates/verify-analytics.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement `scripts/gates/verify-analytics.mjs`**

```js
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { conceptDirs, conceptPages } from './lib/scan.mjs';

const SNAKE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
const TAGS = ['Button', 'IconButton', 'Input', 'Switch', 'Search', 'Tabs', 'button', 'a', 'input', 'select', 'textarea'];

export function scanInteractive(src) {
  const out = [];
  for (const tag of TAGS) {
    const re = new RegExp(`<${tag}(\\s[^>]*?)?(/?)>([^<]*)`, 'g');
    let m;
    while ((m = re.exec(src))) {
      const inner = (m[3] || '').trim();
      const aria = /aria-label=["']([^"']+)["']/.exec(m[1] || '');
      const ph = /placeholder=["']([^"']+)["']/.exec(m[1] || '');
      out.push({ type: tag, label: (aria?.[1] || inner || ph?.[1] || '').trim().slice(0, 60) });
    }
  }
  return out.filter((f) => f.type[0] === f.type[0].toUpperCase() || f.label);
}

export function analyzeConcept(spec, pages) {
  const warnings = [];
  const errors = [];
  if (!spec) {
    warnings.push('no analytics tagged (no analytics.json)');
    return { warnings, errors };
  }
  for (const e of spec.events) {
    if (!SNAKE.test(e.event)) errors.push(`invalid event name (must be snake_case): "${e.event}"`);
  }
  for (const page of pages) {
    const pageEvents = spec.events.filter((e) => e.page === page.slug);
    if (!pageEvents.some((e) => e.trigger === 'page_load')) {
      warnings.push(`page "${page.slug}" has no page_load event`);
    }
    const tagged = new Set(pageEvents.filter((e) => e.element).map((e) => e.element.label));
    for (const el of page.interactives) {
      if (el.label && !tagged.has(el.label)) warnings.push(`page "${page.slug}" untagged element: ${el.type} “${el.label}”`);
    }
  }
  return { warnings, errors };
}

export function analyzeAll() {
  const results = [];
  for (const { dir, product, slug } of conceptDirs()) {
    const { pages } = conceptPages(dir);
    const enriched = pages.map((p) => ({ slug: p.slug, interactives: scanInteractive(readFileSync(p.screen, 'utf8')) }));
    const specPath = path.join(dir, 'analytics.json');
    const spec = existsSync(specPath) ? JSON.parse(readFileSync(specPath, 'utf8')) : null;
    results.push({ product, slug, ...analyzeConcept(spec, enriched) });
  }
  return results;
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `node --test scripts/gates/verify-analytics.test.mjs`
Expected: PASS.

- [ ] **Step 5: Wire into `scripts/gates/run.mjs`** — add after the existing screen loop, before the final exit:

```js
import { analyzeAll } from './verify-analytics.mjs';

// ... existing code above ...

for (const r of analyzeAll()) {
  if (only && !`${r.product}/${r.slug}`.includes(only)) continue;
  if (r.errors.length) {
    failed = true;
    console.error(`\n✗ analytics ${r.product}/${r.slug}`);
    r.errors.forEach((e) => console.error(`  - ${e}`));
  }
  if (r.warnings.length) {
    console.warn(`\n⚠ analytics ${r.product}/${r.slug}`);
    r.warnings.forEach((w) => console.warn(`  - ${w}`));
  }
}
```

Place the `import` at the top with the other imports; place the loop just before `if (failed) process.exit(1);`.

- [ ] **Step 6: Add `gate:analytics` script to `package.json`** — in `"scripts"`:

```json
    "gate": "node scripts/gates/run.mjs",
    "gate:analytics": "node -e \"import('./scripts/gates/verify-analytics.mjs').then(m=>{const r=m.analyzeAll();let bad=false;for(const x of r){if(x.errors.length){bad=true;console.error('\\u2717',x.product+'/'+x.slug);x.errors.forEach(e=>console.error('  -',e));}x.warnings.forEach(w=>console.warn('\\u26a0',x.product+'/'+x.slug,w));}process.exit(bad?1:0);})\""
```

- [ ] **Step 7: Run full gate**

Run: `npm run gate`
Expected: existing concepts pass structure/token gates; analytics section prints `⚠ … no analytics tagged` warnings (or untagged-element warnings for the funnel) but does NOT fail the run (exit 0), since no invalid names exist.

- [ ] **Step 8: Commit**

```bash
git add scripts/gates/verify-analytics.mjs scripts/gates/verify-analytics.test.mjs scripts/gates/run.mjs package.json
git commit -m "feat(gate): advisory analytics coverage check"
```

---

## Task 12: Skill, conventions, template, README + tag the example

**Files:**
- Modify: `.claude/skills/vibe-concept/SKILL.md`
- Modify: `.claude/skills/vibe-concept/references/conventions.md`
- Modify: `src/concepts/_template/INTEGRATION.md`
- Modify: `README.md`
- Create: `src/concepts/pdfguru/upload-funnel/analytics.json`

**Interfaces:** none (docs + data).

- [ ] **Step 1: SKILL.md** — add workflow step and hard rules. Insert into the numbered workflow after step 6:

```markdown
7. **Tag analytics** — run the sandbox (`npm run dev`), open `/c/<product>/<slug>`, click **Tag** in the overlay, add a `page_load` event per page and tag each primary interactive element (button, input, link) with an event. Save; this writes `analytics.json` into the concept folder. See `references/conventions.md` (Analytics contract).
```

Add a table row `| 7. Analytics | references/conventions.md |` and add two HARD RULES:

```markdown
- **Every multipage concept declares its flow.** A concept with more than one page uses `flow.ts` + `pages/<page>/` (never multiple screens crammed into one file). Single-page concepts keep the flat `Screen.tsx` shape.
- **Tag analytics before handoff.** Each concept ships `analytics.json` covering a `page_load` per page and its primary actions. Event names are `snake_case` with the product suffix convention (`_tap` click, `_view` load, `_change` input). The analytics gate warns on untagged elements; invalid names hard-fail.
```

- [ ] **Step 2: conventions.md** — add a "Multipage concepts" section (flow.ts shape, pages/ layout, `onNext`/`onBack` injected by the route) and an "Analytics contract" section documenting the `analytics.json` schema (from Task 7 types), the naming convention with pdfguru examples (`file_from_provider_chosen`, `sign_up_confirm_tap`, `*_view`, `*_change`), and that context props (page/device/ab_test) are auto-attached by the product and must NOT be encoded in the spec.

- [ ] **Step 3: `_template/INTEGRATION.md`** — add an "## Analytics" section:

```markdown
## Analytics
The concept ships `analytics.json` (produced by the sandbox tagging overlay). One row per event.

| Event | Trigger | Element | Data | Wiring (pdfguru) |
|---|---|---|---|---|
| `choose_file_tap` | click | Choose file button | `{ method: 'click' }` | `dispatch(sendAnalyticEvent({ event: 'choose_file_tap', data: { method: 'click' } }))` |
| `select_file_view` | page_load | — | — | fire on mount of the page |

Context props (`page`, `device`, `ab_test`, orientation) are auto-attached by the product's analytics layer — do not encode them here.
```

- [ ] **Step 4: README.md** — add a short "Multipage concepts & analytics tagging" section (English + a Ukrainian paragraph matching the existing tutorial style) covering: multipage concepts use `flow.ts` + `pages/`; run `npm run dev`, use the overlay Tag button to attach events, spec saves to `analytics.json`; run `npm run gate:analytics` to see coverage gaps.

- [ ] **Step 5: Create `src/concepts/pdfguru/upload-funnel/analytics.json`** — tag the funnel to prove the loop and give a worked example:

```json
{
  "version": 1,
  "product": "pdfguru",
  "concept": "upload-funnel",
  "events": [
    { "id": "evt_1", "page": "select-file", "trigger": "page_load", "event": "upload_select_file_view", "data": {}, "notes": "" },
    { "id": "evt_2", "page": "select-file", "trigger": "click", "event": "choose_file_tap", "data": { "method": "click" },
      "element": { "tag": "button", "role": null, "label": "Choose file", "occurrence": 0 }, "notes": "" },
    { "id": "evt_3", "page": "processing", "trigger": "page_load", "event": "upload_processing_view", "data": {}, "notes": "" },
    { "id": "evt_4", "page": "processing", "trigger": "click", "event": "view_result_tap", "data": {},
      "element": { "tag": "button", "role": null, "label": "View result", "occurrence": 0 }, "notes": "" },
    { "id": "evt_5", "page": "done", "trigger": "page_load", "event": "upload_done_view", "data": {}, "notes": "" }
  ]
}
```

- [ ] **Step 6: Verify**

Run: `npm run gate:analytics && npm run gate`
Expected: analytics warnings for the funnel drop (page_loads present; primary buttons tagged; the Back buttons may still warn — acceptable). No errors. `npm run gate` exits 0.

- [ ] **Step 7: Commit**

```bash
git add .claude/skills/vibe-concept/SKILL.md .claude/skills/vibe-concept/references/conventions.md src/concepts/_template/INTEGRATION.md README.md src/concepts/pdfguru/upload-funnel/analytics.json
git commit -m "docs(analytics): skill, conventions, template, README and worked spec"
```

---

## Self-Review

**Spec coverage:**
- Multipage model / flow.ts / pages → Tasks 1, 6. Registration → Task 1. Routing + nav props + flow bar → Task 3. Gallery badge → Task 4. Structure gate + flow integrity → Task 5. ✓
- Overlay delivery (in-app, DEV-only) → Tasks 8, 10. Committed `analytics.json` + download → Tasks 8, 9. Element picker/form/panel → Task 10. Schema → Task 7. ✓
- pdfguru contract shape (`dispatch(sendAnalyticEvent(...))`, snake_case, `_tap`/`_view`/`_change`) → Tasks 7 (naming/preview), 12 (docs). ✓
- Advisory gate (warn untagged + missing page_load, hard-fail invalid names) → Task 11. ✓
- Skill step + conventions + INTEGRATION Analytics section → Task 12. ✓

**Type consistency:** `ConceptEntry.kind`/`pages`/`flow` defined in Task 1 and consumed in Tasks 3/4. `Flow`/`FlowPage` used consistently in Tasks 1/2/3/5/6. `AnalyticsSpec`/`AnalyticsEvent`/`Trigger`/`ElementAnchor` defined in Task 7, consumed in 8/9/10/11 with matching field names (`event`, `data`, `element.label`, `page`, `trigger`). `resolveConceptPath` signature matches between Task 8 impl and test. `analyzeConcept(spec, pages)` where `pages[].interactives` matches between Task 11 impl and test.

**Placeholder scan:** none. Two verification caveats are intentional (confirm ui-pes `Button` variant prop in Task 6; confirm `border-error`/`text-error`/`text-text-inverse` tokens in Task 10) — these are "verify the real API" instructions, not deferred work.

**Ordering:** Part 1 (Tasks 1–6) is independently shippable and verifiable before Part 2 (Tasks 7–12). Task 10 depends on 7/8/9; Task 11 depends on 5 (`conceptPages`) and 7 naming rule; Task 12 depends on 6 + 10.
