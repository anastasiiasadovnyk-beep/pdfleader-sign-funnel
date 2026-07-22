# Conventions — the concept contract

Every concept is a folder `src/concepts/<product>/<slug>/` with 5 core files. `<product>` is `pdfguru` | `tbp` | `pdfleader` — the folder is authoritative for brand. `<slug>` is kebab-case and describes the screen (e.g. `documents-empty`). Look at `src/concepts/_template/` and `src/concepts/pdfguru/documents-empty/` for worked examples of this exact shape.

## The 5 core files

### `types.ts`
One exported `<Name>Props` type. Every piece of data or callback the screen needs is a prop — this type is the integration seam between the concept and whatever real data source the target product will wire up later.

```ts
export type DocumentsEmptyProps = {
  onUpload: () => void;
  ctaLabel: string;
  heading: string;
  subheading: string;
};
```

### `Screen.tsx`
Pure component: `export default function Screen(props: <Name>Props)`. Props in, JSX out. Only imports allowed: `@universe-forma/ui-pes` and the local `./types`. No hooks beyond what's needed for pure rendering, no data-fetch, no store, no router, no i18n. Tailwind token classes only — no raw hex, no raw px, no raw palette utilities (see `references/ds-catalog.md` for how to pick the right tokens).

### `mock.ts`
Default-exports one object of type `<Name>Props` with realistic seed data — this is the fixture that stands in for real data until the concept is integrated. Never hardcode this data inline in `Screen.tsx`; `mock.ts` is the only place fixture data lives.

```ts
import type { DocumentsEmptyProps } from './types';
const mock: DocumentsEmptyProps = {
  heading: 'No documents yet',
  subheading: 'Upload a PDF to get started.',
  ctaLabel: 'Upload PDF',
  onUpload: () => console.log('upload'),
};
export default mock;
```

### `meta.ts`
Default-exports `{ title: string }` only. No `brand` field — brand is derived from the `<product>` folder segment, which is what drives which brand CSS the gallery/route applies.

```ts
const meta = { title: 'Documents — empty state' };
export default meta;
```

### `INTEGRATION.md` (required — the integration spec)
Every concept MUST ship this file; the structure gate fails a concept without it. It is the spec an engineer reads to drop the concept into the product with no guesswork. Write it from the matching `product-profiles/<product>.md`, not general React knowledge. Follow the section structure in `src/concepts/_template/INTEGRATION.md`:

- **Purpose** — what screen, which product, which user state.
- **Props / data contract** — a table, one row per `types.ts` prop: name, type, and its real source in the app (selector/thunk/i18n key). This is the seam.
- **States** — default / empty / loading / error, whichever apply, and how each renders.
- **Integration steps** — in the target product's actual terms: path, export style, sub-component mapping, route registration, data wiring (which replaces `mock.ts`), i18n keys.

## Decomposition

Non-trivial screens split into sub-files instead of one god-component. `Screen.tsx` stays the composition root:
- `components/*.tsx` — focused sub-components, each pure with typed props (same rules as `Screen.tsx`: ui-pes + token classes only, no data-fetch/store/router/i18n).
- `lib/*.ts` — pure helpers (formatting, derivations) with no side effects.
- `hooks/*.ts` — view logic (local state, derived values) — no data-fetching or store access; that still belongs to the integration layer, not the concept.

Every `.tsx` file in the concept is gate-checked (`node scripts/gates/run.mjs`), not just `Screen.tsx` — a hardcode hidden in a sub-component still fails the gate.

These folder names are intentionally neutral, not FSD (`ui/`/`model/`) — the sandbox serves three different product architectures. `INTEGRATION.md` is where the neutral shape gets mapped to the target product's real layout:
- **pdfleader** — FSD: `ui/` (+ `model/` for hooks, `lib/` for helpers) and an `index.ts` barrel.
- **pdfguru** — `pages/<name>/parts`.
- **tbp** — `pages/<name>/components`.

See `src/concepts/_template/components/ExampleRow.tsx` for the shape.

## Multipage concepts

A concept with more than one screen declares a flow instead of cramming pages into one file. Layout:

```
src/concepts/<product>/<slug>/
  flow.ts
  pages/
    <page-a>/{Screen.tsx,types.ts,mock.ts}
    <page-b>/{Screen.tsx,types.ts,mock.ts}
```

`flow.ts` default-exports a `Flow`: a `start` slug and a `pages` array of `{ slug, title, next? }`, where `next` is the following page's slug (or an array, for branching). See `src/concepts/pdfguru/upload-funnel/flow.ts` for a worked 3-page example.

Each `pages/<page>/Screen.tsx` is a normal concept Screen — same purity rules as single-page. The route (`ConceptRoute.tsx`) injects `onNext` and `onBack` callbacks as extra props at render time; declare them as optional in `types.ts` (`onNext?: () => void`) and call them from your primary/back actions. Do not wire real navigation or route params inside the Screen — the route owns navigation, the Screen just calls the callback it's given.

Single-page concepts keep the flat `Screen.tsx` shape — don't introduce `flow.ts`/`pages/` for a one-screen concept.

## Analytics contract

Every concept ships `analytics.json` in its folder, written by the `@universe-forma/analytics-tagger` package's runtime overlay. The overlay is **opt-in**: it only mounts in dev when the URL carries `?tag=1` (e.g. `/c/<product>/<slug>?tag=1`) — previews stay clean otherwise. Schema (v2):

```ts
type EventCategory = 'interaction' | 'form' | 'visibility' | 'navigation' | 'media' | 'content' | 'custom';
type ElementAnchor = { selector: string; tag: string; role: string | null; label: string; text?: string };
type AnalyticsEvent = {
  id: string;             // 'evt_1', 'evt_2', ...
  page: string;            // page slug ('screen' for single-page concepts)
  category: EventCategory;
  trigger: string;         // e.g. 'click', 'page_view', 'input_change', 'impression'
  event: string;           // snake_case event name
  data: Record<string, string>;
  element?: ElementAnchor; // omitted for elementless triggers (page_view, modal_open, ...)
  notes: string;
};
type AnalyticsSpec = { version: 2; product: string; concept: string; events: AnalyticsEvent[] };
```

`element.selector` is a real CSS selector computed via `@medv/finder` (stable, shortest-unique) when tagged live in the overlay — robust to layout/occurrence changes, unlike the old label+occurrence anchor.

**Taxonomy** — seven categories, each with triggers mapped to a naming suffix. Core suffixes (match pdfguru's existing convention): `_tap` (click-family: `click`, `double_click`, `form_submit`, `back`, `copy`, ...), `_view` (`page_view`, `impression`, `modal_open`, ...), `_status` (`validation_error`), `_change` (`input_change`, `select_change`, `toggle`). Documented **extensions** beyond the core four, used where the core suffixes don't fit: `_hover`, `_focus`, `_blur`, `_scroll`, `_play`/`_pause`/`_complete` (media), `_expand`/`_collapse` (accordion). `custom` triggers have no fixed suffix — name freely.

**Naming convention** — snake_case throughout: `deriveEventName(label, trigger)` → `${slug(label)}_${suffix}`. Examples from `src/concepts/pdfguru/upload-funnel/analytics.json`: `choose_file_tap` (interaction/click), `upload_select_file_view` (navigation/page_view), `view_result_tap` (interaction/click). Other pdfguru-shaped examples: `file_from_provider_chosen`, `sign_up_confirm_tap`.

**Property presets** — grounded in pdfguru's real vocabulary, offered as autocomplete on `data` keys: `method, status, place, source, feature_name, features_name, type, funnel, file_format, file_size_bytes, file_pages, currency, download_method, error_type, error_code, session_id, is_premium, plan_type, tool, screen_config_name`. Common enum values are hinted too (e.g. `method: manual|auto|click|drag_and_drop|box|drive|files_list|paypal`, `status: success|fail|error|impossible|started|processing|ready`, `funnel:` the full pdfguru funnel list). Free-text entry is always allowed alongside presets.

Tag a page-view event (category `navigation`, trigger `page_view`) for every page plus an event for every primary interactive element (button, input, link, toggle, etc.) — pick the closest category/trigger from the taxonomy rather than defaulting everything to click/page_view. The overlay's **Coverage** tab scans the live DOM at runtime and diffs it against tagged `element.selector`s to surface untagged elements — this replaces the old static source-scan, so coverage reflects what's actually rendered, not what a text scanner could find in source. The advisory gate (`npm run gate:analytics`) hard-fails only on non-snake_case event names and warns when a page has no page-view event.

Context props — `page`, `local_page`, `device`, `device_new`, `orientation`, `version`, `ab_test`, `userAgent`, `env` — are auto-attached by the product's analytics layer at dispatch time. Do **not** encode them in the spec; `data` is only for event-specific payload fields (e.g. `{ method: 'click' }`).

## Borrowed discipline (cite, don't copy)

Two habits worth carrying into concept copy and structure, borrowed from frontend-design practice — apply the discipline, don't copy files:

- **Interface copywriting**: active voice, name controls by what the user does with them (a button that starts an upload is "Upload PDF", not "Submit"), and write real empty/error/loading states instead of placeholder text like "No data" or "Error occurred."
- **CSS-specificity care**: stick to ui-pes utility classes in the order the component expects; don't fight specificity with extra wrapper divs or `!important`-style overrides — if a token utility doesn't achieve the look, that's a DS gap to flag, not a workaround to hack in.
