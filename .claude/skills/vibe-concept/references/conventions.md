# Conventions — the concept contract

Every concept is a folder `src/concepts/<slug>/` with exactly 5 files. `<slug>` is kebab-case and describes the screen (e.g. `documents-empty`). Look at `src/concepts/_template/` and `src/concepts/documents-empty/` for worked examples of this exact shape.

## The 5 files

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
Default-exports `{ title: string; brand: Brand }`, importing `Brand` from `@/app/BrandProvider`. `brand` is the target product chosen during intake (`pdfguru` | `tbp` | `pdfleader`) — this is what drives which brand CSS the gallery/route applies.

### `INTEGRATION.md`
The recipe for wiring this concept into the chosen product's real codebase. Write it from the matching `product-profiles/<product>.md` (pdfguru.md / tbp.md / pdfleader.md), not from general React knowledge — each product has its own path convention, export style, route registration, and data layer. Cover, in the target product's actual terms:
- **Path** — where the component lands in the real repo (e.g. `pages/<name>/index.tsx` for pdfguru/tbp, `pages-layer/<name>/` for pdfleader).
- **Export style** — default vs named export, per the product's convention.
- **Route registration** — the product's router file and path-constants file.
- **Data wiring** — which state layer (Redux+thunks, RTK, RTK slices) replaces `mock.ts`, and that `mock.ts` gets deleted once real data is wired.
- **i18n keys** — the product's i18n key namespace convention for replacing literal strings.

## Borrowed discipline (cite, don't copy)

Two habits worth carrying into concept copy and structure, borrowed from frontend-design practice — apply the discipline, don't copy files:

- **Interface copywriting**: active voice, name controls by what the user does with them (a button that starts an upload is "Upload PDF", not "Submit"), and write real empty/error/loading states instead of placeholder text like "No data" or "Error occurred."
- **CSS-specificity care**: stick to ui-pes utility classes in the order the component expects; don't fight specificity with extra wrapper divs or `!important`-style overrides — if a token utility doesn't achieve the look, that's a DS gap to flag, not a workaround to hack in.
