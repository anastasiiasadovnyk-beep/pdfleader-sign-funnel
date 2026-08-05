# Vocal Remover — result page (A/B test group B)

## Purpose
The **result** screen a TheBestPDF user lands on after the vocal-remover split
completes (i.e. right after the `vocal-remover-processing` modal closes at 100%).
It previews the separated stems (first 30 seconds playable), offers the
full-length downloads, lets the user replace the source file, and collects a
thumbs rating.

This concept is **variant B** of an A/B test on the result page:
- **Group A (control)** — the result page that ships today.
- **Group B (this concept)** — the redesigned "Voice is removed" layout: a
  centered title + reassurance row, a single card holding the original file, a
  "Download both (.zip)" CTA, and three waveform-player rows (Instrumental /
  Vocals / Origin) with a rate-the-result prompt.

Only variant B lives here — variant A is the existing production page. Wiring
(§ Integration steps) mounts B behind the experiment flag and leaves A untouched.

## Props / data contract
`Screen` is pure — props in, UI out. `mock.ts` is the fixture that stands in
until wired to real state; delete it on integration.

| Prop | Type | Real source in tbp-fe |
|---|---|---|
| `title` | `string` | i18n `t('vocal_remover.result.title')` → "Voice is removed". |
| `subtitle` | `string` | i18n `t('vocal_remover.result.subtitle')`. |
| `features` | `ResultFeature[]` | i18n array `t('vocal_remover.result.features')` (static reassurance copy). |
| `originalLabel` | `string` | i18n `t('vocal_remover.result.original')`. |
| `original.name` | `string` | uploaded file name from the `vocalRemover` slice. |
| `original.sizeLabel` | `string` | `formatBytes(file.size)` util → "12.87 MB". |
| `original.durationLabel` | `string` | probed track duration → "1:25s". |
| `changeLabel` | `string` | i18n `t('vocal_remover.result.change')`. |
| `separatedLabel` | `string` | i18n `t('vocal_remover.result.separated')`. |
| `downloadAllLabel` | `string` | i18n `t('vocal_remover.result.download_all')`. |
| `tracks` | `SeparatedTrack[]` | split-result payload — one entry per stem (`instrumental`, `vocals`) plus the `original` full track; `previewRatio`/`locked` come from the entitlement (free = 30s preview, paid = full). |
| `rateLabel` | `string` | i18n `t('vocal_remover.result.rate')`. |
| `thanksLabel` | `string` | i18n `t('vocal_remover.result.thanks')` → "Thanks for your feedback" (shown for 3s after rating). |
| `initialPlayingId` / `initialRating` | seed for `useResultModel` | usually `null`; set only when restoring UI state. |
| `onChangeFile` | `() => void` | fires after the user picks a new audio file in the OS picker (the concept opens `<input type="file" accept="audio/*">` on "Change"). In-product: dispatch the re-upload and re-open the **processing modal** (the `tbp/vocal-remover-processing` concept — shipped in PR #2363 "add vocal remover processing modal (UI only)", already on main). |
| `onDownloadAll` | `() => void` | dispatch the "download both (.zip)" thunk (gated by plan). |
| `onDownloadTrack` | `(id) => void` | dispatch per-stem download (gated by plan). |
| `onTogglePlay` | `(id) => void` | play/pause the stem's `<audio>` element. |
| `onRate` | `('up' \| 'down') => void` | dispatch the result-rating event. |

## State model (this concept owns interaction locally)
`hooks/useResultModel.ts` holds `playingId` + `rating` (`useState`, seeded from
`initial*` props) and exposes `{ state, actions }`:
- `state.playingId` — which stem row shows the pause icon / played waveform.
- `state.rating` — the selected thumb (`up` / `down`), highlighted primary.
- `actions` — `togglePlay`, `downloadTrack`, `downloadAll`, `changeFile`, `rate`,
  each wrapping the matching prop callback.

On integration, **replace this hook with Redux**: `playingId`/`rating` become
slice state (or local audio-player state), `actions` become dispatched
thunks/actions. The `lib/waveform.ts` helpers are pure and can move to `utils/`
as-is (or be replaced by real per-stem peak data from the decode step).

## States (scenarios in `mock.ts`)
- **default** — nothing playing, no rating; stems preview-gated (`previewRatio 0.36`), original full.
- **playing** (`export const playing`) — the Vocals stem is playing, playhead partway (`playedRatio 0.18`, `currentTimeLabel 0:12`).
- **rated** (`export const rated`) — a thumbs-up is selected.
- **locked vs full** — `track.locked` + `previewRatio < 1` renders the greyed
  preview tail; a fully-entitled stem (or the original) uses `previewRatio 1`.

## Regions (see `design.json` for the asserted contract)
- `title` / `subtitle` — centered header. **nearestToken:** title is Figma 32/700,
  built with `text-desktop-title-3` (32/800 — size exact, weight one step up).
- `feature` — check-marked reassurance row (`CheckIcon` primary + `text-body-2 text-primary`). nearestToken: label is 14/500, built as `text-body-2` (14/400).
- `card` / `track-item` — **DS gap:** no ui-pes `Card`; composed as
  `rounded-3 bg-bg-white-bg` (card adds `shadow-modal-card`, items add `border-os-divider`).
- `original` row — grey pill (`rounded-2 bg-bg-light-grey`) + `Button` (text/action) "Change".
- `download-all` — `Button color=primary size=md` + inline `DownloadIcon`.
- `track-badge` — ui-pes `Badge` (`filled-tonal`, `color=success|primary|grey`, `size=dense`).
  **DS gap:** dense `Badge` sets no font-size; forced via `text-caption-xs font-bold` (11px — nearest to Figma 10px).
- `waveform` — **DS gap:** no ui-pes waveform/scrubber; composed from token-styled
  bars (`bg-os-standard-input-line` played / `bg-primary` progress / `bg-os-divider` locked) + a round thumb.
- `play-btn` / `download-btn` — ui-pes `IconButton` (`outlined` / `filled-tonal`, `color=primary`, `size=ms`).
- `rate` — "Rate the result:" + two `IconButton` thumbs (selected → `color=primary`, filled glyph). On a rating the row cross-fades (opacity + translate, 300ms) to a "Thanks for your feedback" confirmation with a green tonal check for 3s, then fades back to the prompt with the chosen thumb active. The 3s confirmation is local presentational state inside `RateResult` (a `setTimeout`); the persistent rating lives in `useResultModel`.

## Integration steps (tbp-fe)
1. **Experiment** — register the result-page test (e.g. GrowthBook flag
   `vocal_remover_result_variant`). Render group A (existing page) when the flag
   is `A`/control and this concept when `B`.
2. **Component** — copy `Screen.tsx` + `components/*` + `hooks/*` + `lib/*` to
   `src/pages/vocalRemover/components/ResultB/`. Keep it a pure `FC`; the page
   renders it in place of the current result once `status === 'done'`.
3. **Assets** — the header logo is the app's shared `<Header/>` in-product; drop
   `components/Header.tsx` + `assets/logo-thebestpdf.svg` and render the result
   inside the existing page shell.
4. **Data** — feed props from the `vocalRemover` slice via `useSelector`
   (`original`, `tracks`, entitlement → `previewRatio`/`locked`); swap
   `useResultModel` for the audio-player + rating state. Delete `mock.ts`.
5. **i18n** — replace the literal strings with `t('vocal_remover.result.*')`
   keys in `src/locales/en/translation.json` (`title`, `subtitle`, `features`,
   `original`, `change`, `separated`, `download_all`, `rate`).
6. **Audio** — back `onTogglePlay` with per-stem `<audio>` refs; free-tier
   playback stops at the `previewRatio` boundary (the locked tail is not fetched).
7. **Analytics** — attach `ab_test` context so every event carries the variant;
   dispatch the events in `analytics.json` (page view, download all / per stem,
   play, rate). Context props (`device`, `orientation`, `ab_test`, …) are
   auto-attached by the analytics middleware.

## Copy note for the team
The Figma source copy contains a typo — **"full-lenght"** (should be
"full-length") — in both the subtitle and the "Full-lenght tracks" feature. It is
reproduced verbatim here to match the design contract; fix it in the i18n
strings on integration (it does not affect the layout).

## DS gaps flagged (also in repo `DS-GAPS.md`)
- No `Card` primitive — card + track rows composed from `rounded-* bg-bg-white-bg` (+ border/shadow).
- No waveform / audio-scrubber component — composed from token bars + a thumb.
- Dense `Badge` emits no font-size — size forced via `text-caption-xs` (no ~10px token).
- No icon set — check / refresh / download / play / pause / music / mic / thumbs are inline SVGs.
