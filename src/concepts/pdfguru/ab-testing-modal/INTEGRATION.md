# Integration — ab-testing-modal (Compress PDF quality picker) → pdfguru-fe

## Purpose
The modal a pdfguru user sees after choosing **Compress** on a document: pick a compression preset (High / Medium / Low), or **Custom** whose quality slider is always visible, then confirm. Selecting a row switches the active mode; dragging the Custom slider selects Custom and recomputes size; the CTA label updates live with the projected size. Built as an A/B-testable variant of the compress flow.

## Props / data contract
| Prop | Type | Real source in pdfguru-fe |
|---|---|---|
| `title` | `string` | `t('compress_modal.title')` |
| `file.name` | `string` | selected document from `documentsDataSelector` |
| `file.size` | `string` | original size, formatted via `utils` file-size helper |
| `file.sizeLabel` | `string` | `t('compress_modal.original')` |
| `options` | `CompressOption[]` | compress-estimate service — preset metadata + projected sizes/savings per preset |
| `initialSelectedId` | `string` | default preset (mock: `medium`); real value from the estimate response |
| `initialCustomValue` | `number` (0–100) | last-used custom level, or a sensible default |
| `customSizeRange` | `{ minMb, maxMb }` | estimate service — min achievable size and the original size |
| `orLabel` / `customSliderLabel` / `sliderLeftLabel` / `sliderRightLabel` | `string` | `t('compress_modal.*')` |
| `ctaLabelTemplate` | `string` | `t('compress_modal.compress_to')` containing a `{size}` placeholder |
| `onCompress` | `(result: { optionId, customValue? }) => void` | dispatch the compress thunk with the chosen preset / custom level |
| `onClose` | `() => void` | dismiss the compress flow |

## State model (this concept owns interaction locally)
`hooks/useCompressState.ts` holds `selectedId` + `customValue` (`useState`, seeded from the `initial*` props) and derives:
- **`projectedSizeOf(option)`** — presets return their fixed `projectedSize`; the Custom option's size is computed from `customValue` against `customSizeRange` (`lib/compress.ts`).
- **`ctaLabel`** — `ctaLabelTemplate` with `{size}` replaced by the selected option's projected size, so the button text tracks the current mode.
- **`onCompress()`** — wraps the prop callback with the current `{ optionId, customValue }`.

On integration, **replace this hook with Redux**: `selectedId`/`customValue` become slice state, `select`/`setCustomValue` become dispatched actions (debounce `setCustomValue` to re-estimate), and `projectedSizeOf`/`ctaLabel` read from the estimate selector. The `lib/compress.ts` helpers are pure and can move to `utils/` as-is.

## States
- **Default** — a preset is selected (mock: Medium). Selected row: `border-primary` + `bg-primary-opacity-4`; savings label switches to `text-primary`.
- **Preset switch** — clicking High/Medium/Low moves selection and updates the CTA size.
- **Custom** — the Custom row's `QualitySlider` is always visible (with `sliderLeftLabel`/`sliderRightLabel`); dragging it selects Custom and updates its projected size and the CTA label in real time.
- **Disabled option** — `option.disabled` greys the row and blocks selection.

## Integration steps
1. Copy `Screen.tsx` to `src/pages/compress-modal/index.tsx` as a **default export** page; move `components/` to `parts/`, `hooks/` and `lib/` to the page's `hooks/`/`helpers/`.
2. Wrap in pdfguru's modal/dialog primitive rather than the concept's backdrop `div` (the backdrop here is only for the sandbox); the app dialog owns overlay + focus trap.
3. Route: `const CompressModalPage = lazy(() => import('pages/compress-modal'))` + `<Route path='compress-modal' … />` in `src/App.tsx`; add a key to `src/ts/constants/page-links.ts`.
4. Data: back `types.ts` with `useSelector` for the file + estimate data; swap `useCompressState` for the compress slice; wire `onCompress` to the compress thunk in `data/actions/`. Delete `mock.ts`.
5. i18n: replace literals (`title`, `orLabel`, `customSliderLabel`, `sliderLeftLabel`, `sliderRightLabel`, `ctaLabelTemplate`, `file.sizeLabel`) with `t('compress_modal.*')` keys in `src/locales/en/*`.

## DS gaps flagged (compose-from-primitives, no ui-pes primitive exists)
ui-pes 0.5.45 exports none of the following, so each is composed from token utilities and should be swapped for a real primitive when the DS ships one:
- **Dialog/Modal** — shell composed from a `div` (`rounded-6 bg-bg-white-bg shadow-xl`) over a `bg-os-backdrop-overlay` backdrop. Use pdfguru's app dialog in-product (step 2).
- **Radio** — bordered circle + inner `bg-primary` dot inside a native `<button>` row.
- **Slider** — `QualitySlider` composes a track (`bg-os-divider`) + fill (`bg-primary`) + thumb, with a transparent native `<input type="range">` overlay for interaction/accessibility.
- **Divider** — the "OR" separator and rules use `h-px bg-os-divider`.
- **Icons** — ui-pes exports no icon set; close/chevron/quality glyphs are inline SVGs (`stroke="currentColor"`) in `components/icons.tsx`. The Custom option uses the Material Symbols **joystick** glyph (filled, `fill="currentColor"`, viewBox `0 -960 960 960`) to match the reference app.
- **CTA glow** — the confirm button sits over a blurred `bg-secondary` element (`opacity-40 blur-2xl`) for the soft glow from the Figma reference; drop it if the app dialog owns footer styling.
