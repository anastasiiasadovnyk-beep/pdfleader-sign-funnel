# Vocal Remover — processing modal

## Purpose
The overlay shown on **TheBestPDF** `vocal-remover` landing (`/vocal-remover`) immediately after a user uploads a track. It mounts over the landing on a dimmed backdrop (`bg-os-backdrop-overlay`) and reports split progress until the AI has separated vocals from the instrumental, then closes / routes to the result. It is **non-dismissible** — there is no close control; it exits on completion (or on error, out of scope here).

## Props / data contract
`Screen` is pure — props in, UI out. `mock.ts` is the fixture that stands in until wired to real state; delete it on integration.

| Prop | Type | Real source in tbp-fe |
|---|---|---|
| `title` | `string` | i18n `t('vocal_remover.processing.title')` → "Splitting your track...". |
| `file.format` | `string` | Uploaded file's extension, upper-cased (e.g. `MP3`) — from the upload slice. |
| `file.name` | `string` | Original file name from the upload slice (`documents`/`vocalRemover` slice). |
| `file.sizeLabel` | `string` | `formatBytes(file.size)` util → "12.87 MB". |
| `file.durationLabel` | `string` | Track duration from the decode/probe step → "1:25s". |
| `progress` | `number` | 0–100 from the processing thunk / websocket progress events. |
| `estimatedTimeLabel` | `string` | i18n + computed ETA, e.g. `t('vocal_remover.processing.eta', { time })`. |
| `info` | `string` | i18n `t('vocal_remover.processing.info')` reassurance copy. |

## States
- **default** (`mock`) — mid-processing, `progress: 85`, ETA "1m".
- **start** (`export const start`) — just-started, `progress: 12`, ETA "3m". Drives the same layout; only the fill width, % label and ETA change.
- **complete** (not rendered) — at `progress: 100` the host closes the modal / navigates to the result; fire `vocal_remover_split_complete`.
- **error** (out of scope) — on failure the host swaps this overlay for the error modal.

The modal is presentational: it renders whatever `progress` it is given. Animation and layout do not depend on the value.

## Regions (see `design.json` for the asserted contract)
- `container` — modal shell. **DS gap:** no ui-pes `Dialog`/`Modal`; composed as `rounded-4 bg-bg-white-bg shadow-modal-card` over the backdrop (same workaround as `pdfguru/ab-testing-modal`).
- `animation` — lavender panel (`bg-primary-opacity-8 rounded-4`) hosting the Lottie. Desktop uses the tall `assets/desktop-split-track.json` (354×528, left column); mobile uses the wide `assets/mobile-split-track.json` (327×280, top band). Rendered via `lottie-web` (`components/LottiePlayer.tsx`).
- `format-badge` — ui-pes `Badge` (`type=badge`, `style=filled-tonal`, `color=primary`, `size=dense`). **DS gap:** `size="dense"` sets no font-size, so the chip text size is forced via a `text-caption-emph` token class (see `DS-GAPS.md`).
- `progress-track` / `progress-fill` — **DS gap:** no ui-pes `Progress`/linear-progress; composed from a `bg-primary-filled-50` track + `bg-primary` fill whose width is `progress%`.
- `callout` — reassurance box. **DS gap:** no ui-pes `Alert`/`Callout`; composed as a `border-primary rounded-3` box + tonal icon chip + `BulbIcon` inline SVG (no ui-pes icon set).

## Integration steps (tbp-fe)
1. **Component** — copy `Screen.tsx` + `components/*` to `src/pages/vocalRemover/components/ProcessingModal/`. Keep it a pure `FC`; the page mounts it conditionally while `status === 'processing'`.
2. **Overlay** — render it via the existing modal/portal mechanism (`EModalTypes`) so it layers over the landing with the backdrop; it already renders its own `bg-os-backdrop-overlay` wrapper, so mount it at the root of the portal without an extra scrim.
3. **Assets** — move `assets/desktop-split-track.json` and `assets/mobile-split-track.json` into the page's `assets/` and keep the static JSON imports (project has `resolveJsonModule`). `lottie-web` is already a dependency.
4. **Data** — feed props from the `vocalRemover` slice via `useSelector`; `progress` from the processing thunk / progress socket. Delete `mock.ts`.
5. **i18n** — replace the literal strings with `t('vocal_remover.processing.*')` keys in `src/locales/en/translation.json` (`title`, `eta`, `info`).
6. **Analytics** — dispatch `vocal_remover_processing_view` on mount and `vocal_remover_split_complete` when `progress` hits 100 (see `analytics.json`); context props (`device`, `orientation`, …) are auto-attached by the analytics middleware.

## DS gaps flagged (also in repo `DS-GAPS.md`)
- No `Dialog`/`Modal`, no `Progress`/linear-progress, no `Alert`/`Callout`, no icon set — all composed from primitives + tokens here.
- `Badge` `size="dense"` emits no font-size (size forced via token class).
