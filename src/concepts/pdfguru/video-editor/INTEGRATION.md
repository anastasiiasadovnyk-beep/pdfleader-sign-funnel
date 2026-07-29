# Video Editor — integration spec

A 2-page pdfguru funnel for the online video editor: a marketing landing with a
drag-and-drop upload, then a full editor (top bar, collapsible tool sidebar,
canvas/viewer and a multi-track timeline). Serves a user who lands to trim,
resize, add text/media, and export a video.

Ported from the pdfguru-fe `features/videoEditor` feature. It self-hosts the
few host-app dependencies it needed (`useMediaQuery`, the app route prefix, and
the PDF Guru / Trustpilot SVGs) so the concept is standalone.

## Flow
`landing` → `editor`. Declared in `flow.ts`; the route layer reads it to render
the flow bar and drive `onNext`/`onBack` between pages. In the real app a
processing screen sits between the two; here upload goes straight into the
editor, which owns its own loading state.

## Pages

### landing
| Prop | Type | Meaning / source in the real app |
|---|---|---|
| `onNext` | `() => void` | Supplied by the product router — advances to `editor` once a valid file is accepted |

Renders from static copy. Upload validation (type/size) lives in
`hooks/useVideoUpload`; `model/constants` holds the accepted formats and size cap.

### editor
| Prop | Type | Meaning / source in the real app |
|---|---|---|
| `onBack` | `() => void` | Supplied by the product router — returns to `landing` (also the header's "Done") |

Owns all of its state via `hooks/useEditorState` (project name, active tool,
sidebar/sheet, playhead, zoom, canvas aspect) and `hooks/useTimelineEditor`
(tracks, clips, selection, undo/redo, split/trim/move). Seeded from
`model/editorData`. Choosing an export format is a no-op stub — the result
processing modal is a later screen.

`onNext`/`onBack` are never implemented inside a page beyond the flow-host
stubs; real navigation lives in the product router per `flow.ts`'s `next` edges.

## States
Each page renders a single default state. The editor is fully interactive
(add/select/trim/split clips, undo/redo, play/scrub, responsive desktop sidebar
vs. mobile bottom-sheet) but backed by in-memory mock data, not a real video
pipeline.

## Dependencies beyond ui-pes
- `react-icons` — tool/format iconography (`md`, `si` sets).
- `antd` — a few editor controls (sliders/selects in the clip & timeline panels).
Both are real npm packages added to this repo; swap for the product's own
equivalents at integration time if desired.

## Integration steps (target product: pdfguru)
1. **Path** — `features/videoEditor/` (the feature already ships this layout:
   `pages/`, `components/`, `hooks/`, `model/`, `assets/`).
2. **Export style** — pages are default exports here for the concept host; the
   feature's real `index.ts` uses named page exports (`VideoEditorLandingPage`,
   `VideoEditorPage`).
3. **Route** — two routes (`video-editor`, `video-editor/edit`) in pdfguru's
   router + path-constants; wire `onNext`/`onBack` to the router's `navigate`.
4. **Host deps** — restore the app's `useMediaQuery`, route prefix, and shared
   brand SVGs; drop the local copies added for the concept.
5. **Data wiring** — replace the `useEditorState` / `useTimelineEditor` mock
   seed (`model/editorData`) and `useVideoUpload` with the real upload + editing
   state layer and export pipeline.
6. **i18n** — move the literal copy in `model/constants` and the pages into
   pdfguru's `videoEditor.*` i18n namespace.
