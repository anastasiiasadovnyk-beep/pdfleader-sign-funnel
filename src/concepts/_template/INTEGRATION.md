# <Concept title> — integration spec

The required spec for every concept. Fill each section; keep it specific to the target product (write it from `product-profiles/<product>.md`, not general React knowledge).

## Purpose
One or two sentences: what screen this is, for which product, and the user state it serves.

## Props / data contract
The `types.ts` props are the integration seam. One row per prop.

| Prop | Type | Meaning / source in the real app |
|---|---|---|
| `heading` | `string` | Static copy or i18n key |
| `items` | `Item[]` | From the product's data layer (selector/thunk) |
| `onAction` | `() => void` | Wire to the real handler |

## States
Which states the screen handles and how they render: default, empty, loading, error (whichever apply).

## Integration steps (target product: <product>)
1. **Path** — where the component lands (e.g. `pages-layer/<name>/` for pdfleader, `pages/<name>/index.tsx` for pdfguru/tbp).
2. **Export style** — default vs named export per the product.
3. **Sub-components** — map the neutral `components/` split to the product's convention: pdfleader FSD `ui/` (+ `model/`, `lib/`, `index.ts` barrel); pdfguru `pages/<name>/parts`; tbp `pages/<name>/components`.
4. **Route** — the product's router file + path-constants file.
5. **Data wiring** — which state layer replaces `mock.ts` (Redux+thunks / RTK slice); delete `mock.ts` once wired.
6. **i18n** — the product's key namespace for the literal strings.

## Analytics
The concept ships `analytics.json` (produced by the sandbox tagging overlay). One row per event.

| Event | Trigger | Element | Data | Wiring (pdfguru) |
|---|---|---|---|---|
| `choose_file_tap` | click | Choose file button | `{ method: 'click' }` | `dispatch(sendAnalyticEvent({ event: 'choose_file_tap', data: { method: 'click' } }))` |
| `select_file_view` | page_load | — | — | fire on mount of the page |

Context props (`page`, `device`, `ab_test`, orientation) are auto-attached by the product's analytics layer — do not encode them here.
