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

Every concept ships `analytics.json` in its folder, written by the sandbox's dev-only tagging overlay (open `/c/<product>/<slug>`, click **Tag**). Schema:

```ts
type Trigger = 'click' | 'page_load' | 'input_change';
type ElementAnchor = { tag: string; role: string | null; label: string; occurrence: number };
type AnalyticsEvent = {
  id: string;            // 'evt_1', 'evt_2', ...
  page: string;           // page slug ('screen' for single-page concepts)
  trigger: Trigger;
  event: string;          // snake_case event name
  data: Record<string, string>;
  element?: ElementAnchor; // omitted for page_load events
  notes: string;
};
type AnalyticsSpec = { version: 1; product: string; concept: string; events: AnalyticsEvent[] };
```

**Naming convention** — snake_case, suffixed by trigger type: `_tap` for clicks, `_view` for page loads, `_change` for input changes. Examples from `src/concepts/pdfguru/upload-funnel/analytics.json`: `choose_file_tap`, `upload_select_file_view`, `view_result_tap`. Other pdfguru-shaped examples: `file_from_provider_chosen`, `sign_up_confirm_tap`.

Tag a `page_load` event for every page plus a click/change event for every primary interactive element (button, input, link). The advisory gate (`npm run gate:analytics`) warns on untagged elements and pages missing a `page_load`; it hard-fails only on non-snake_case event names.

Context props — `page`, `device`, `ab_test`, orientation — are auto-attached by the product's analytics layer at dispatch time. Do **not** encode them in the spec; `data` is only for event-specific payload fields (e.g. `{ method: 'click' }`).

## Borrowed discipline (cite, don't copy)

Two habits worth carrying into concept copy and structure, borrowed from frontend-design practice — apply the discipline, don't copy files:

- **Interface copywriting**: active voice, name controls by what the user does with them (a button that starts an upload is "Upload PDF", not "Submit"), and write real empty/error/loading states instead of placeholder text like "No data" or "Error occurred."
- **CSS-specificity care**: stick to ui-pes utility classes in the order the component expects; don't fight specificity with extra wrapper divs or `!important`-style overrides — if a token utility doesn't achieve the look, that's a DS gap to flag, not a workaround to hack in.
