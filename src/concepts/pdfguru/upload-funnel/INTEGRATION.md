# Upload funnel — integration spec

A 3-page pdfguru funnel covering the compress-PDF upload flow: pick a file, watch it process, see the result. Serves a first-time or returning user compressing a single PDF.

## Flow
`select-file` → `processing` → `done`. Declared in `flow.ts`; the route layer reads it to render the flow bar and drive `onNext`/`onBack` between pages.

## Pages

### select-file
| Prop | Type | Meaning / source in the real app |
|---|---|---|
| `heading` | `string` | Static copy or i18n key |
| `subheading` | `string` | Static copy or i18n key |
| `ctaLabel` | `string` | Static copy or i18n key |
| `onNext` | `() => void` | Supplied by the product router — advances to `processing` |

### processing
| Prop | Type | Meaning / source in the real app |
|---|---|---|
| `heading` | `string` | Static copy or i18n key |
| `note` | `string` | Static copy or i18n key |
| `ctaLabel` | `string` | Static copy or i18n key |
| `onNext` | `() => void` | Supplied by the product router — advances to `done` |
| `onBack` | `() => void` | Supplied by the product router — returns to `select-file` |

### done
| Prop | Type | Meaning / source in the real app |
|---|---|---|
| `heading` | `string` | Static copy or i18n key |
| `subheading` | `string` | Static copy or i18n key |
| `ctaLabel` | `string` | Static copy or i18n key |
| `onBack` | `() => void` | Supplied by the product router — used here as "start over", returning to `select-file` |

`onNext`/`onBack` are never implemented inside a page's `Screen.tsx` or `mock.ts` beyond no-op stubs — the real navigation logic lives in the product's router, which owns the funnel's step sequencing.

## States
Each page renders a single default state (no loading/empty/error variants in this concept). `processing` is a static representation of an in-progress state; the real product would swap it for a live progress indicator wired to the job status.

## Integration steps (target product: pdfguru)
1. **Path** — `pages/upload-funnel/select-file/index.tsx`, `pages/upload-funnel/processing/index.tsx`, `pages/upload-funnel/done/index.tsx` (pdfguru convention: `pages/<name>/index.tsx`).
2. **Export style** — default export per page, matching pdfguru convention.
3. **Sub-components** — none in this concept; if a page grows, split into `pages/upload-funnel/<step>/parts`.
4. **Route** — add three routes to pdfguru's router file and path-constants file, one per step; wire `onNext`/`onBack` to the router's `navigate` calls per `flow.ts`'s `next` edges.
5. **Data wiring** — replace each page's `mock.ts` with the real upload/compress state layer (Redux slice + thunks for file selection, job polling, and result download); delete `mock.ts` once wired.
6. **i18n** — move literal strings (`heading`, `subheading`, `note`, `ctaLabel`) to pdfguru's `uploadFunnel.*` i18n namespace.
