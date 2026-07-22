# Analytics Tagger v2 + App Header — Design

**Goal:** Rebuild the analytics tagging tool as a proper, reusable package with broad event coverage, robust element anchoring, and a polished PostHog-toolbar-quality UI that is opt-in via a URL query param; and add an app-wide header (back-to-gallery + concept search) across every route.

**Repo:** `ui-design-vibe-concepts`, becomes an npm-workspaces monorepo (app at root + `packages/*`).

Two independent parts, separate task sets:
- **Part A — `@universe-forma/analytics-tagger`** package (the rebuilt tool).
- **Part B — App header** (`AppHeader` + layout + concept search).

## Global Constraints

- Vite 6 + React 19 + TS 5 strict; ESM node scripts for gates/plugins.
- The tagger overlay is **opt-in**: mounts only when `import.meta.env.DEV` AND the URL has a `tag` query param (`?tag=1`). Clean previews by default.
- The tagger renders with **self-contained CSS** (own scoped stylesheet, class-prefixed `aftag-`) — it must NOT rely on the host app's Tailwind config (Tailwind only generates classes for configured `@source`s) and must NOT inherit the previewed concept's brand tokens. This is a deliberate isolation choice for an injected devtool.
- Concept `Screen.tsx`/page components stay pure (ui-pes + local types only, token classes, no data-fetch/store/router/i18n). The tagger reads the live DOM; it never edits concept source.
- Event names are non-empty `snake_case` (`^[a-z][a-z0-9]*(_[a-z0-9]+)*$`).
- Analytics gate is advisory (warn), hard-fails only on invalid event names.
- Do not encode auto-attached context props (`page`, `local_page`, `device`, `device_new`, `orientation`, `version`, `ab_test`, `userAgent`, `env`) in the spec — the product attaches them.
- Comments: 2-line cap, no banners. Commits: subject-only, no body, no Co-Authored-By.
- Existing single-page + multipage concepts and the existing test suite keep working.

---

## Part A — `@universe-forma/analytics-tagger`

### Workspace + package

Root `package.json` gains `"workspaces": ["packages/*"]`. New source-package (no build step — the app's Vite/tsc compiles TS directly; node-run gate stays independent, see below):

```
packages/analytics-tagger/
  package.json          # name @universe-forma/analytics-tagger; peer react/react-dom; dep @medv/finder; exports "." + "./vite"
  src/
    index.ts            # <AnalyticsTagger> + types re-export
    core/
      schema.ts         # v2 types + pure ops + migrateV1
      taxonomy.ts       # categories × triggers, suffixes, property presets (grounded in pdfguru-fe)
      naming.ts         # isSnakeCase, deriveEventName, renderAmplitudeCall, renderTrackingPlan
      selector.ts       # anchorFor(el) via @medv/finder
      client.ts         # loadSpec/saveSpec/downloadSpec
    react/
      AnalyticsTagger.tsx  # root: state, query-param gate, launcher + drawer
      Launcher.tsx         # draggable pill
      Drawer.tsx           # tabbed side panel shell
      ElementHighlight.tsx # hover box + labeled tooltip + quick trigger chips
      useInspector.ts      # hover/select via finder
      useCoverage.ts       # runtime coverage from live DOM
      tabs/{InspectTab,EventsTab,AddTab,CoverageTab,ExportTab}.tsx
    styles.css          # scoped, class-prefixed, self-contained
  tsconfig.json
```

**Package exports:** `"."` → `src/index.ts` (React entry + types), `"./vite"` → the dev plugin. The app imports `@universe-forma/analytics-tagger` and `@universe-forma/analytics-tagger/vite`. Vite resolves the workspace symlink; esbuild/vite compiles the TS on the fly (no prebuild).

### Schema v2 (`core/schema.ts`)

```ts
export type EventCategory = 'interaction' | 'form' | 'visibility' | 'navigation' | 'media' | 'content' | 'custom';
export type ElementAnchor = { selector: string; tag: string; role: string | null; label: string; text?: string };
export type AnalyticsEvent = {
  id: string; page: string; category: EventCategory; trigger: string;
  event: string; data: Record<string, string>; element?: ElementAnchor; notes: string;
};
export type AnalyticsSpec = { version: 2; product: string; concept: string; events: AnalyticsEvent[] };
```
Pure ops: `emptySpec`, `upsertEvent`, `removeEvent`, `nextEventId` (as today). New `migrateV1(v1): AnalyticsSpec` — maps old `{trigger: click|page_load|input_change, element:{tag,role,label,occurrence}}` → v2 (`click→interaction/click`, `page_load→navigation/page_view`, `input_change→form/input_change`; element → `{selector:'', tag, role, label}`, empty selector flags "re-pick in overlay"). Loader tolerates v1 and migrates in memory.

### Taxonomy (`core/taxonomy.ts`) — grounded in pdfguru-fe

`TriggerDef = { id; category; label; suffix; needsElement; suggestedProps: string[] }`. Full set:

- **interaction**: click(`tap`), double_click(`tap`), right_click(`tap`), long_press(`tap`), hover(`hover`*), focus(`focus`*), blur(`blur`*) — props `[method, place, source]`.
- **form**: input_change(`change`), select_change(`change`), toggle(`change`), form_submit(`tap`), validation_error(`status`) — props `[place, status, type, error_type, error_code]`.
- **visibility**: impression(`view`), section_view(`view`), scroll_depth(`scroll`*) — props `[place, funnel]` (+ `depth` for scroll).
- **navigation**: page_view(`view`, no element), route_change(`view`, no element), back(`tap`), external_link(`tap`), tab_change(`tap`) — props `[place, funnel, source]`.
- **media**: media_play(`play`*), media_pause(`pause`*), media_complete(`complete`*) — props `[status, place]`.
- **content**: modal_open(`view`, no element), modal_close(`tap`), toast_shown(`view`, no element), accordion_expand(`expand`*), accordion_collapse(`collapse`*), copy(`tap`) — props `[place, status]`.
- **custom**: custom (no suffix, free name, optional element, free props).

Suffixes marked `*` are documented **extensions** beyond pdfguru's core four (`tap`/`view`/`status`/`change`); the export/docs call this out.

Property presets (`PROPERTY_KEYS`) — the pdfguru vocabulary, EXCLUDING auto-attached: `method, status, place, source, feature_name, features_name, type, funnel, file_format, file_size_bytes, file_pages, currency, download_method, error_type, error_code, session_id, is_premium, plan_type, tool, screen_config_name`. Enum value hints (`PROPERTY_VALUES`) for autocomplete: `method: [manual, auto, click, drag_and_drop, box, drive, files_list, paypal]`, `status: [success, fail, error, impossible, started, processing, ready]`, `type: [manual, auto]`, `error_type: [cors, network, http, abort, unknown]`, `download_method: [fetch_blob, anchor, iframe, fetch_data_url, service_worker]`, and `funnel: EFunnels[]` (the full pdfguru funnel list, e.g. `pdf_to_word, merge_pdf, sign_pdf, compress_pdf, transcribe_audio, …`). `place` offers a representative preset list + free entry.

### Naming (`core/naming.ts`)

`isSnakeCase`, `suffixFor(triggerId)`, `deriveEventName(label, triggerId)` → `${slug(label)}_${suffix}` (bare suffix if no label; raw slug if trigger is custom), `renderAmplitudeCall(event)` → `dispatch(sendAnalyticEvent({ event, data? }))`, and new `renderTrackingPlan(spec)` → a full plan for handoff (markdown table: page | category | trigger | event | element.selector | data-keys | call). Autocomplete of existing event names comes from the current spec's events (dedup) — reuse-first.

### Selector (`core/selector.ts`)

```ts
import { finder } from '@medv/finder';
export function anchorFor(el: Element, root?: Element): ElementAnchor {
  const selector = finder(el, root ? { root } : undefined);
  return { selector, tag: el.tagName.toLowerCase(), role: el.getAttribute('role'),
           label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 80),
           text: (el.textContent || '').trim().slice(0, 80) || undefined };
}
```
Stable, shortest-unique CSS selector. Replaces label+occurrence entirely.

### Client (`core/client.ts`)

`loadSpec(product, concept)` GET `/__analytics/<product>/<concept>` → parse; on v1 payload, `migrateV1`; on non-ok/throw → `emptySpec`. `saveSpec(spec)` POST (returns bool). `downloadSpec(spec)` blob download. `copyText(str)` helper for the Export tab.

### React overlay (`react/*`) — UX shell

`<AnalyticsTagger product concept page />`:
- Reads `?tag` (via `useSearchParams`) — renders nothing unless present (and DEV).
- **Launcher** — draggable pill (bottom-right by default), click toggles the drawer; badge shows event count for the current page.
- **Drawer** (ui-pes-free, own styles) with tabs:
  - **Inspect** — toggling enters hover mode: `useInspector` highlights the element under cursor with `ElementHighlight` (box + tooltip showing `tag · selector · text`), plus quick **trigger chips** (`tap`, `view`, `hover`, `change`, …). Clicking a chip (or the element) opens **Add** prefilled with `anchorFor(el)` + that trigger. Esc exits inspect.
  - **Add** — category dropdown → trigger dropdown (grouped, from taxonomy) → event-name input (autocomplete from existing names + `deriveEventName` seed + snake_case validation) → element selector (auto from anchor, editable, "re-pick" button re-enters inspect) → property rows (key dropdown from presets + value with enum hints) → notes → live `renderAmplitudeCall` preview → Save.
  - **Events** — events for the current page, grouped, count badge; inline edit/delete; jump-to-element (scrollIntoView + flash via the stored selector).
  - **Coverage** — `useCoverage` scans the live concept DOM for interactive elements (broad selector), computes `anchorFor` for each, diffs against the page's tagged `element.selector` → two lists (Tagged / Untagged) with one-click "tag this" (opens Add prefilled). Accurate at runtime (no source-scan).
  - **Export** — Download JSON, Copy Amplitude snippets (all events), Copy full tracking plan (`renderTrackingPlan`).
- Persists via `saveSpec` on every change; also autosaves.

`styles.css` — self-contained, `aftag-`-prefixed, modern (rounded, subtle shadows, system font stack), a small reset scoped to the drawer container so host CSS can't bleed in. No Tailwind utilities.

### Mounting (`src/app/ConceptRoute.tsx`)

Replace the current `import.meta.env.DEV && <AnalyticsOverlay …>` in both SinglePage and MultiPage with `import.meta.env.DEV && <AnalyticsTagger product={…} concept={…} page={…} />` (component self-gates on `?tag`). Remove the old `src/devtools/analytics-overlay/` tree.

### Dev plugin (`packages/analytics-tagger/src/vite/plugin.ts`)

Move `scripts/vite-plugin-analytics-writer.mjs` into the package as TS, exported at `@universe-forma/analytics-tagger/vite` (default export `analyticsWriter()`, named `resolveConceptPath`). Same behavior (GET/POST `/__analytics/:product/:slug`, path guard, `apply:'serve'`, generic error message). `vite.config.ts` imports from the package. Delete the old script.

### Gate (`scripts/gates/verify-analytics.mjs`) — slim, runtime-coverage moved to overlay

Drop `scanInteractive` and the untagged-element source scan (that's now the overlay's Coverage tab). Keep, as advisory:
- read each concept's `analytics.json` (missing → warn "no analytics tagged");
- validate shape (version 1 or 2 accepted; required fields present);
- **hard-fail** any `event.event` that isn't snake_case;
- **warn** if a page has no `page_view`/`page_load`-category event.
Update `run.mjs` + `gate:analytics` + tests accordingly. This resolves the prior flaky-label ticket.

### Migrate the worked example

`src/concepts/pdfguru/upload-funnel/analytics.json` → v2: add `category`, real `trigger` ids, and `element.selector` (plausible CSS like `main button`, acknowledging the overlay regenerates on real use), snake_case names preserved.

---

## Part B — App header

### Layout

Introduce a shared layout so a header renders on every route:
```tsx
// src/app/App.tsx
<Routes>
  <Route element={<AppLayout />}>
    <Route path="/" element={<Gallery />} />
    <Route path="/c/:product/:slug" element={<ConceptRoute />} />
    <Route path="/c/:product/:slug/:page" element={<ConceptRoute />} />
  </Route>
</Routes>
```
`AppLayout` = `<AppHeader/>` + `<Outlet/>` inside the pdfguru brand wrapper for the header only (header is app chrome, brand-neutral-ish; use a fixed brand for it). Concept routes keep their own `BrandProvider` for the concept body.

### `src/app/AppHeader.tsx`

Sticky top bar (`position: sticky; top: 0; z-index`), on all routes:
- **Left** — "Vibe Concepts" wordmark, a `<Link to="/">` (back to gallery). On concept routes it doubles as the back affordance.
- **Right** — a **concept search**: ui-pes `Search` input; typing filters `conceptEntries()` by `title` / `product` / `slug`; results render in a ui-pes `BaseDropdown` (product badge + title + `/c/…` path). Selecting navigates to `/c/<product>/<slug>` (start page for `kind === 'multi'` via `flow.start`). Keyboard: `/` focuses search, arrows move, Enter selects, Esc closes.
- Built on ui-pes primitives + tokens (this is app UI, not the isolated devtool).

### `src/app/useConceptSearch.ts`

Pure-ish hook: takes the query, returns ranked matches from `conceptEntries()` (case-insensitive substring on title/product/slug; product-exact boosted). Unit-testable pure `filterConcepts(entries, query)`.

### Gallery reconciliation

Gallery keeps its hero/columns; its own top title stays but the global header sits above it. Ensure no double "Vibe Concepts" clash — the gallery hero can drop its tiny wordmark dots row if redundant (minor; keep hero heading).

---

## Build order

1. **Part A**: workspace + package scaffold → core (schema v2 + migrate, taxonomy, naming, selector, client) with tests → move Vite plugin into package + rewire → slim gate + tests → React overlay (shell, tabs, inspector, coverage, styles) + query-param mount + delete old tree → migrate example + docs.
2. **Part B**: `filterConcepts` + hook (tests) → `AppHeader` + `AppLayout` + route restructure → gallery reconciliation.

## Out of scope

- No live analytics emission (tool defines the spec only).
- No browser extension.
- No publishing the package to a registry now (workspace-internal; publishable later).
- No auto-generating tracking code into concept source.
