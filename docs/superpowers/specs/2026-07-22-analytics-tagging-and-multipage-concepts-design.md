# Analytics Tagging + Multipage Concepts — Design

**Goal:** Let PMs walk a vibe concept in the sandbox, tag interactive elements with analytics events through an in-app overlay, and export a committed `analytics.json` contract — plus support concepts with multiple pages / funnel flows so the analytics can span a flow, not just one screen.

**Repo:** `ui-design-vibe-concepts` (same repo; the overlay is part of the sandbox, the specs live beside the concepts they describe).

## Why

Analytics is defined late and forgotten. The sandbox already produces integration-ready screen concepts; the missing piece is capturing *what to track* at concept time, in the exact shape the target product consumes, so an engineer wires it with no guesswork. Real screens are also rarely one page — funnels span steps — so the concept model must hold multiple pages before funnel analytics is meaningful.

The target contract (from `pdfguru-fe`):
- Amplitude via `dispatch(sendAnalyticEvent({ event: string, data?: Record<string, unknown> }))`.
- `snake_case` event names, functional suffix: `*_tap` (click), `*_view` (page/screen load), `*_status` (result). Input change → `*_change` / on-blur.
- `data` props seen in the wild: `features_name`, `method` (`'click'|'drag'`), `type`, `status`, `placement`.
- Context (`page`, `device`, `ab_test`, orientation, version) is auto-attached by the product's analytics layer — NOT the concept's concern; the spec never encodes it.

## Global Constraints

- Vite 6 + React 19 + TS 5 strict; ESM node scripts for gates/plugins.
- `Screen.tsx` and all concept `.tsx` stay pure: only `@universe-forma/ui-pes` imports + Tailwind token classes. No raw hex, no raw palette utilities, no raw px where a token exists. No data-fetch / store / router / i18n inside concept components. (Flow navigation is injected via context, not imported router — see Part 1.)
- Overlay + dev-write plugin are strictly `import.meta.env.DEV` only; never shipped in the build.
- Event names in `analytics.json` MUST be non-empty `snake_case`.
- Existing single-page concepts must keep working unchanged (backward compatible).
- All existing gates continue to pass; the new analytics gate is advisory (warns, does not hard-fail).
- Comments: hard cap 2 lines, only for non-obvious WHY. No banners.

---

## Part 1 — Multipage concepts

### Folder model (backward compatible)

Single-page (today, unchanged):
```
src/concepts/<product>/<slug>/
  Screen.tsx  types.ts  mock.ts  meta.ts  INTEGRATION.md
```

Multipage (new — presence of `flow.ts` is the discriminator):
```
src/concepts/<product>/<slug>/
  flow.ts                       # order + branches
  meta.ts  INTEGRATION.md
  pages/<page-slug>/
    Screen.tsx  types.ts  mock.ts
```

`flow.ts` default-exports:
```ts
export type Flow = {
  start: string;                                  // page slug to enter on
  pages: { slug: string; title: string; next?: string | string[] }[];
};
```
`next` is the funnel edge(s). A single string = linear next; an array = a branch (PM/engineer reads it as alternative paths). `start` and every `next` MUST reference a declared page slug.

### Registration (`src/app/concepts.ts`)

- Add a glob for `/src/concepts/*/*/flow.ts` (eager).
- A concept dir with `flow.ts` → multipage: discover its `pages/*/Screen.tsx` + `pages/*/mock.ts`; the `ConceptEntry` gains `pages: { slug, title, load, loadMock, next }[]` and `flow`.
- A concept dir without `flow.ts` → single-page, exactly as today.
- `_`-prefixed dirs still excluded.

### Routing (`src/app/App.tsx`, `ConceptRoute.tsx`)

- Route becomes `/c/:product/:slug/:page?`.
- Single-page entry: render its `Screen` (ignore `:page`), as today.
- Multipage entry: `:page` defaults to `flow.start`; bare `/c/:product/:slug` renders the start page (via default param, no hard redirect needed). Unknown page slug → the start page.
- A `FlowProvider` supplies `useFlow()` → `{ current, pages, goTo(slug), next(), back(), isFirst, isLast }`. Page CTAs receive their advance handler through `mock.ts` (e.g. `onNext: () => {}` in the concept's own mock) OR read `useFlow()` only in a thin page wrapper — **the page `Screen.tsx` stays pure**; nav wiring lives in the `ConceptRoute` layer that renders the page and passes `onNext`/`onBack` props sourced from `useFlow()`.
- Dev chrome: a bottom flow bar (prev / step N of M / next) shown only for multipage concepts.

### Gallery (`src/app/Gallery.tsx`)

- Multipage concept card shows a funnel badge + page count; link targets `flow.start`.

### Gates

- `verify-structure.mjs`: a concept is valid if EITHER it has the single-page `REQUIRED_FILES`, OR it has `flow.ts` + `meta.ts` + `INTEGRATION.md` and every declared page has `Screen.tsx` + `types.ts` + `mock.ts`. Flow integrity: `start` and all `next` resolve to declared pages.
- `lint-hardcodes` / `validate-tokens` / `verify-states` scan every page `Screen.tsx` (glob already recurses `.tsx`; extend scan to `pages/*/`).

---

## Part 2 — Analytics tagging overlay

### Interaction

PM opens a concept route → clicks **Tag** in a dev-only floating toolbar → **Tag mode** on:
1. Hovering highlights the nearest interactive element (outline + label).
2. Clicking it opens a popover to define an event.
3. Saving persists to `analytics.json` in the concept folder.
A **Spec** panel lists all events for the current concept (grouped by page), with edit/delete and a live preview of the generated Amplitude call.

### Element anchor

On hover, resolve the nearest interactive node: native `button`/`a`/`input`/`select`/`textarea` or `[role]`, or a ui-pes primitive root. Capture:
```ts
type ElementAnchor = { tag: string; role: string | null; label: string; occurrence: number };
```
`label` = visible text or `aria-label`; `occurrence` = 0-based index among same-anchor siblings on the page (disambiguates repeats). This is a descriptive anchor for humans + best-effort gate matching; the overlay does NOT mutate `Screen.tsx`.

### Event form

- **trigger**: `click | page_load | input_change`. Auto-suggests the suffix: click→`_tap`, page_load→`_view`, input_change→`_change`.
- **event**: `snake_case` field, prefilled from `label` + trigger suffix; inline validation.
- **data**: key/value rows (values are strings/placeholders; free-form).
- **notes**: optional.
- **page_load** events are added per page from the toolbar, not by clicking an element (no `element` anchor).

### Persistence — dev Vite plugin

`vite-plugin-analytics-writer` registers dev-only middleware:
- `GET /__analytics/:product/:slug` → returns existing `analytics.json` or an empty skeleton.
- `POST /__analytics/:product/:slug` → validates body, resolves the concept dir, writes/merges `src/concepts/<product>/<slug>/analytics.json` (pretty JSON).
- Guards: `config.command === 'serve'` only; resolved path MUST stay inside `src/concepts/`; reject otherwise. Never registered in build.
- Overlay also offers a client-side **Download JSON** (no server needed) for handoff.

### `analytics.json` schema (committed contract)

```json
{
  "version": 1,
  "product": "pdfguru",
  "concept": "upload-funnel",
  "events": [
    {
      "id": "evt_1",
      "page": "step-1-upload",
      "trigger": "click",
      "event": "file_from_provider_chosen",
      "data": { "features_name": "merge_pdf", "method": "click" },
      "element": { "tag": "button", "role": "button", "label": "Upload PDF", "occurrence": 0 },
      "notes": ""
    }
  ]
}
```
- `page` = page slug (multipage) or `"screen"` (single-page).
- `element` omitted for `page_load` events.
- `id` is stable per event (overlay-assigned), so re-saves merge cleanly.

### Skill + docs

- `vibe-concept/SKILL.md`: add step **7. Tag analytics** (tag a `page_load` per page + each interactive element; save `analytics.json`). Add HARD RULE that a concept's spec is incomplete without analytics coverage of its primary actions.
- `references/conventions.md`: document `analytics.json` as part of the contract, its schema, and the `snake_case` + `_tap`/`_view`/`_change` convention with pdfguru examples.
- `INTEGRATION.md` template + `references`: add an **Analytics** section — a table (event | trigger | element | data | Amplitude call) derived from `analytics.json`, plus the literal wiring: `dispatch(sendAnalyticEvent({ event, data }))`.

### Gate — `verify-analytics.mjs` (advisory)

For each concept:
- Load `analytics.json`; if missing → warn "no analytics tagged".
- Statically scan each page `Screen.tsx` for interactive primitives (ui-pes `Button`, `Input`, `Switch`, `Search`, `IconButton`, `Tabs` + native `button`/`a`/`input`/`select`/`textarea`), derive best-effort anchors, diff against tagged `element`s → **warn-list** untagged interactive elements.
- Warn if a page has no `page_load` event.
- Validate every `event` is non-empty `snake_case`; invalid names are the one hard-fail in this gate (a malformed contract is worse than a missing one).
- Runs in `run.mjs` as a warning section (does not flip exit code except on invalid names) and standalone via `npm run gate:analytics`.

### Handoff

`analytics.json` committed beside the concept = the machine-readable contract; the `INTEGRATION.md` Analytics section = the human-readable one. Optional `scripts/analytics-export.mjs` bundles every concept's spec into one file for a tracking-plan import.

---

## Build order

1. **Part 1 (multipage)** — model, registration, routing, flow context, gallery, structure gate. Ship + verify with one converted multipage example concept.
2. **Part 2 (analytics overlay)** — dev plugin + schema, overlay UI (picker, form, spec panel), skill/docs, advisory gate. Ship + verify by tagging the multipage example.

## Out of scope

- No live analytics emission (the overlay defines the spec; it does not send events).
- No browser extension (in-app overlay only; revisit if tagging non-sandbox sites is needed).
- No auto-editing of `Screen.tsx` to inject tracking props.
- No backend / persistence beyond the committed JSON file.
