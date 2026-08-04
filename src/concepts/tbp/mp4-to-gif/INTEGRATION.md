# MP4 to GIF — builder (TheBestPDF)

## Purpose
The editing step of the **MP4 → GIF** conversion tool in tbp-fe. The user has already
uploaded a clip; this screen lets them (1) trim up to `maxClipSec` seconds on a timeline,
(2) tune the GIF output (ratio, speed, frame rate, quality, loop), and (3) convert &
download. Desktop is a two-pane layout (video + timeline | settings); mobile stacks the
panes with a fixed bottom CTA.

## Props / data contract
`Screen` is pure — every value is a prop (`types.ts`). `mock.ts` is the fixture to delete on integration.

| Prop | Type | Real source in tbp-fe |
|---|---|---|
| `video` | `VideoMeta` | uploaded-file selector (`store/documents` slice): name, size, `durationSec` from probe |
| `ratios` / `speeds` / `fpsOptions` / `qualities` | option lists | static config in `types/constants` (or feature-flagged remote config) |
| `maxClipSec` / `minClipSec` | `number` | product constants (6 / 2) — the trim window can't exceed max or shrink below min |
| `hint`, `panelTitle`, `changeLabel`, `ctaLabel`, `*Label`, `*Hint` | `string` | i18n via `t('mp4_to_gif.*')` — see keys below |
| `initialTrim` | `TrimState` | default `{0, maxClipSec}`; or restored from slice |
| `initialSettings` | `GifSettings` | slice defaults (`{ ratioId, speedId, fpsId, qualityId, loop }`) |
| `onChangeFile` | `() => void` | dispatch reset-upload thunk / route back to upload |
| `onConvert` | `(settings, trim) => void` | dispatch `convertToGif({ settings, trim })` thunk → processing step |

Interaction state is owned by `hooks/useMp4ToGifModel.ts`, returned as `{ state, actions, derived }`:
replace `state` with the slice, `actions` with dispatches, `derived` with selectors — a mechanical swap.

## Layout
- **Desktop** is a full-height, non-scrolling shell (`h-screen`, `overflow-hidden`): the trim
  timeline is pinned at the bottom of the builder and always in view; the video preview flexes to
  fill the remaining space and is fitted to the selected ratio via a `ResizeObserver`
  (`VideoPreview`). The settings column scrolls (`overflow-y-auto`) **between** a fixed "GIF
  settings" header and a fixed "Convert & download" CTA bar. This holds when the viewport is short
  or the window is narrowed (down to the `md` breakpoint).
- **Mobile** stacks the panes with natural page scroll and the CTA pinned to a fixed bottom bar.

## States
- **default** — landscape 16:9 clip, 0:00–0:06 trimmed, 1x / 10 FPS / Balanced, loop on.
- **portrait** (`?scenario=portrait`) — 9:16 ratio; the preview frame is pillarboxed. Same as
  the second Figma builder variant. Selecting any ratio re-proportions the preview live.
- The trim window is drag-editable: handles trim each edge, the band slides the whole window.
  It is clamped to the clip bounds, capped at `maxClipSec` (shrink-only past it) and floored at
  `minClipSec` (2s). Picking a new file resets the window to `[0, min(maxClipSec, duration)]`.
- Not yet designed (extend the contract when specced): `converting` (CTA loading + progress),
  upload-`error`.

## Integration steps (tbp-fe)
1. **Page**: create `src/pages/mp4ToGif/index.tsx` as a default-export `FC`; wrap with `<Helmet>`
   for SEO and the shared `<Header/>` (drop this concept's `components/Header.tsx`). Render the
   builder card body from `Screen.tsx`.
2. **Components**: move `components/*` under `pages/mp4ToGif/components/` (tbp convention). Keep them
   pure. `lib/timeline.ts` → `utils/`; `hooks/useMp4ToGifModel.ts` → co-located or `store/` selectors.
3. **Route**: `App.tsx` → `lazy(() => import('pages/mp4ToGif'))` + `<Route path='mp4-to-gif' … />`
   (locale-aware, under the existing `:language?` group). Likely also wired via `generateServiceRoutes()`.
4. **Data**: feed `video` from the documents slice; wire `onConvert` to a `convertToGif` thunk
   (RTK) and `onChangeFile` to the upload reset; delete `mock.ts`.
5. **i18n**: add keys under `mp4_to_gif.*` in `src/locales/en/translation.json` — `hint`,
   `panel_title`, `change_label`, `cta_label`, `ratio.{label,hint}`, `speed.{label,hint}`,
   `fps.{label,hint}`, `quality.{label,hint}`, `loop.{label,hint}`, and per-option labels.

## DS gaps flagged (see repo `DS-GAPS.md`)
- **No Select / combobox field** — the Ratio / FPS / Quality controls are composed in
  `components/SelectField.tsx`: a token-styled `<button>` trigger (value + chevron) plus a popover
  `<ul role="listbox">` with a selected-row highlight (`bg-primary-opacity-8`), outside-click /
  Escape close, and rich two-line items (glyph + name + ratio) for Ratio. `BaseDropdown` is
  action-menu-shaped, not a value select — ui-pes should ship a real `Select`.
- **No `Card` primitive** — the builder card is a `rounded-5 bg-bg-white-bg shadow-modal-card` div.
- **No `Divider`** — `h-px bg-os-divider` (and a `w-px` vertical divider between panes).
- **No icon set** — inline SVGs in `components/icons.tsx` (`stroke="currentColor"`, token sizing).
- **No small bold type token for the timecode chip** — design badge is 10px/700 (Badge dense); the
  nearest ui-pes token is `text-caption-xs` (11px). Asserted as a `nearestToken` approximation.
