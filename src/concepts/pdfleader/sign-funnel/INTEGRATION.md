# Sign funnel — integration spec (pdfleader)

## Purpose

Document-signing funnel for **PDFLeader**: the user opens a document in the editor, starts the **Sign** tool, chooses a sealing type (Simple vs Digital), creates a signature (Draw / Type / Upload), places it on the page, tweaks it from a contextual toolbar (color / thickness / Verified toggle) and — after the unchanged payment step — lands on the thank-you page to download the signed file (and the audit trail for Digital).

Figma source: `figma://5ETpNeUNy0Ja7SXlKfxUGh?node-id=15376-61642` (section "Sign": Desktop + Mobile + Audit trail document). Payment screens are explicitly out of scope ("Payment екрани без змін").

## Signature type across the flow

One flow serves both sealing types — nothing branches. `editor` → `thank-you` → `dashboard`, and the two later pages adapt:

- **thank-you** — a digital signature adds the "Download audit trail" CTA; a simple one shows the single download button.
- **dashboard** — one page for both. The row the user just signed is first and carries their kind; the other signed row takes the opposite kind so both indicators and both row menus are visible at once.
- Flow pages are independent routes, each seeded by its own mock with no shared store, so the choice travels in `sessionStorage` via `lib/signatureChoice.ts` (written on "Done", read on mount, falling back to the mock). **In-product this is store/router state and those two helpers go away.** The fallback is what keeps `?scenario=` previews and the fidelity run deterministic.
- Arriving on thank-you announces the signed document with the green toast for 5 s (`TOAST_MS`), then it auto-dismisses; a scenario-pinned toast is left untimed so previews hold still. The design only shows this toast after a download click — showing it on arrival is the requested behaviour, not a design detail.
- **Dashboard indicators**: green = digital (sealed, has an audit trail), grey = simple. Its row menu is the split that matters — only digital offers "Download audit trail". Unsigned files get no indicator and the short menu.

- **Row downloads confirm themselves.** The dashboard's row "Download" and the digital-only "Download audit trail" both raise the same green toast as the thank-you page (5 s, same copy, `dash-toast*` regions).
- **Tooltips** hang off the info icons: both "Best used for" cards in the select-type dialog and the "Verified" toggle in the signed toolbar (which only exists once a signature is placed). `InfoTooltip` is composed — ui-pes ships no Tooltip — on the `--color-bg-tooltip` surface. **The tooltip copy is placeholder**: it is not present in the referenced Figma frame (`15528:54900` has the icons but no tooltip content), so the three strings in `mock.ts` are marked `PLACEHOLDER` and are a one-line change each.

- **The placed signature is a selection.** It lands selected — blue frame, eight handles, red inner outline, plus the contextual toolbar. A pointer-down anywhere that is not the signature or its toolbar deselects it: the chrome and the toolbar go, the signature stays on the page. Clicking the signature again reselects it (and can start a drag in the same gesture). Both pieces of signature UI carry `data-signature-ui`, which is how the document-level listener tells "inside" from "outside" — so toolbar controls don't deselect what they're editing.

- **Done opens the export panel, it does not leave the editor.** `ExportPanel` is a right-hand DS `BaseDrawer` (`direction="right"`): editable file name, six format cards (PDF preselected), "Proceed to checkout" and "Print". Checkout is what hands the sealing choice on and continues to thank-you → dashboard. Scenario `exportOpen` renders it for review.
- **Downloads are real.** The thank-you CTAs and the dashboard's row download / audit-trail item hand the browser an actual file (`lib/downloadFile.ts`: blob + `<a download>`), which is what makes the browser run its own download indicator — that animation is Chrome's, not ours, and only appears for a genuine download. With no signing service the bytes are a minimal valid one-page PDF built in code (real xref, opens in a viewer). **On integration point the anchor at the signed file from the signing service and delete `buildPdf`.**
- **Restart.** The PDFLeader logo on thank-you and on the dashboard clears the sealing choice and returns to the start of the flow, so the editor reopens unsigned — a clean slate between usability-test runs. `onRestart` comes from the sandbox route (`MultiPage` navigates to `flow.start`).

## Flow

`flow.ts`: `editor` → `thank-you`. The sandbox injects `onNext`/`onBack`; in pdfleader-fe the editor's **Done** must route to the payment funnel and the payment success must route to the thank-you page — wire those in the router layer, not inside the pages.

| Page | Design frames covered |
|---|---|
| `editor` | Sign / Editor · Select type (Simple/Digital) · Draw/Type/Upload (Default/Filled) · Un/Verified toolbar · mobile equivalents |
| `thank-you` | Thank You Page (Simple/Digital · Downloaded · Audit trail) · mobile equivalents |

## Props / data contract

### `pages/editor/types.ts` → `EditorScreenProps`

| Prop | Type | Real source in pdfleader-fe |
|---|---|---|
| `chrome` | `EditorChromeProps` | editor shell state: zoom from editor slice, tool list is static config, `pageThumbs` from the document-pages selector (rendered page rasters), `currentPage` from viewer state |
| `mobileChrome` | `MobileChromeCopy` | i18n `t('editor.mobile.*')` |
| `document` | `DocumentCanvasProps` | rendered page raster URL from the document service; `signFieldLabel` i18n `t('sign.fieldMarker')` |
| `selectTypeModal` | `SelectTypeModalCopy` | i18n `t('sign.selectType.*')`; `previewImageUrl` static asset |
| `createSignModal` | `CreateSignModalCopy` | i18n `t('sign.create.*')` — **the Figma frames keep DS Dialog placeholder strings ("Title"/"Subheader"/"Tertiary"/"Secondary"/"Primary"); the shipped copy is proposed and must be reviewed by content design** |
| `signedToolbar` | `SignedToolbarCopy` | i18n `t('sign.toolbar.*')`; `signIdValue` from the signing service response |
| `signatureAssets` | `SignatureAssets` | **mock-only** — in the product the drawn/typed/uploaded signature is user-generated (canvas strokes / font-rendered text / uploaded image), not static PNGs |
| `initialStep`, `initialSignatureType`, `initialMethod`, `initialFilled`, `initialVerified` | scenario seeds | drop on integration — state lives in the sign slice |
| `onNext` | `() => void` | route to payment funnel (`PAGE_LINKS`) |

### `pages/thank-you/types.ts` → `ThankYouScreenProps`

| Prop | Type | Real source |
|---|---|---|
| `signatureType` | `'simple' \| 'digital'` | order/signing state — drives the audit-trail CTA |
| `stepper` | `StepperCopy` | checkout stepper config (step 3 active) |
| `heading`, `subheading` | `string` | i18n `t('thankYou.*')` |
| `downloadFileLabel`, `downloadAuditLabel` | `string` | i18n |
| `paymentDetails` | `PaymentDetailsCopy` | order summary selector (plan, account id, amount, date, order id) |
| `contact` | `ContactCopy` | static support config |
| `toast` | `ToastCopy` | i18n `t('thankYou.toast.*')` |
| `footer` | `FooterCopy` | shared marketing footer config |
| `initialToast` | scenario seed | drop on integration |

## States

### editor (scenario = mock export)
- `default` — editor at rest, Sign tool idle, no modal.
- `selectType` / `selectTypeDigital` — "Sign the document" modal, Simple/Digital card selected (blue border + corner check).
- `sigDraw` / `sigDrawFilled` — creation modal, Draw tab, empty ↔ drawn ink (undo enables when filled).
- `sigType` / `sigTypeFilled` — Type tab, empty ↔ typed signature.
- `sigUpload` / `sigUploadFilled` — Upload tab, dropzone ↔ uploaded signature preview.
- `signedUnverified` — signature placed, contextual toolbar, Verified toggle **off** (Simple flow).
- `signedVerified` — Verified toggle **on**, `Sign ID` caption under the placed signature, green seal badge on the page-1 thumbnail (Digital flow).

Interactions inside the page (view-model `hooks/useSignFunnelModel.ts`): Sign tool / purple `sign` field → select type → Continue → create → tab switching, swatches, thickness, draw/type/upload fill, Clear, **Accept and Sign** places the signature; toolbar toggles Verified, delete removes; Done → `onNext`.

### thank-you
- `default` (Simple, 1 CTA) / `digital` (2 CTAs).
- `signedDownloaded` / `digitalDownloaded` / `auditDownloaded` — 5-second success toast (auto-dismiss + close button). Downloads do **not** auto-start on page load (Figma annotation).

## Integration steps (pdfleader-fe, FSD)

1. **Editor page** → `pages-layer/document-sign/` with `ui/DocumentSignPage.tsx` (from `pages/editor/Screen.tsx`), `ui/` sub-components from `pages/editor/components/*` (Screen stays the composition root), `model/` from `hooks/useSignFunnelModel.ts` — replace `state` with the sign slice (`entities/sign/model/state/`), `actions` with dispatched actions, `derived` with selectors. `lib/` from `pages/editor/lib/`. Export via `index.ts` **named** export.
2. **Thank-you page** → `pages-layer/sign-thank-you/` same mapping (`useThankYouModel` → order slice + local toast state).
3. **Routing**: add both to `PAGE_LINKS` (`src/shared/constants/pageLinks.ts`); Done → payment funnel; payment success → thank-you.
4. **Data**: delete both `mock.ts` files; wire props per the tables above. Signature assets become the real canvas/type/upload artefacts from the signing service.
5. **i18n**: move all copy props to `i18next` keys (`sign.*`, `thankYou.*`); keep the `**bold**` markers of `uploadCaption` or split it into keyed segments.
6. **Styling**: token utility classes carry over; pdfleader mobile threshold is 760px in-product vs the sandbox's `md` (1024) — re-check the `max-md:` splits against the product breakpoint.
7. **Analytics**: map `analytics.json` events onto the product tracker (see the file; names follow the `_tap`/`_view`/`_change` convention).

## DS gaps hit (also see DS-GAPS.md)

- **Modal/Dialog** — composed (`div` over `bg-common-black/30` scrim; `rounded-6` surface).
- **Stepper**, **Card**, **Upload dropzone**, **Color-swatch picker**, **Toolbar**, **Divider**, **Tooltip-style badges** — composed from tokens.
- **Declarative Toast** — ui-pes exports only imperative `showToast`; a scenario-driven static toast can't render through it, so `DownloadToast` is composed (`bg-success-24` + `backdrop-blur`, `rounded-6`). In-product, clicking a download CTA may use `showToast` instead — copy and tokens are identical.
- **Icon set** — Material Symbols Rounded font (`material-symbols` package, same as the reference), not part of ui-pes.
- **Type scale gaps** (asserted as nearest token, flagged in `design.json`): Outfit (design modal font) vs Montserrat (pdfleader `--font-primary`); badge 10px; tool labels 12/700 → `text-caption-emph` (13/700); TY hero 56/900 → `text-desktop-title-1` (48/800); card/dialog weights 600 → token weights 700–800; button radius 12px (design) vs `--radius-btn-md` 16px.
- **Placed signature is draggable.** `state.signaturePosition` (`{leftPct, topPct}`, bottom-left anchor in % of the page box) plus `actions.moveSignature`; `DocumentCanvas` runs the gesture on pointer events with `setPointerCapture`, so mouse and touch both work, and clamps the box inside the page on all four edges. Percentages rather than pixels so the position survives a resize, and `topPct` is the box's *bottom* edge — that is what keeps it sitting on the signature line at any width. Re-placing a signature resets it to `SIGNATURE_HOME`. Not yet keyboard-movable (drag only) — worth arrow-key nudging if the real editor needs it.
- **Signature ink recolouring** — the prototype shows static ink assets; color swatches switch state but don't recolour the raster (real canvas ink will).
- **Create-signature tab indicator** — ui-pes `TabsActiveAnimation` starts at zero size and transitions to the measured trigger, so the Draw pill animated in every time the dialog opened. `SignatureModal` holds the indicator's transition off for the first two frames (`useTabIndicatorReady`) so it just mounts active; switching tabs still slides. Delete the hook once ui-pes skips its first transition — see DS-GAPS.md.
- **Outlined-action border colour** — pdfleader's `--color-os-button-outline-action-border` is `#000000`, so `Button variant="outlined" color="action"` ("Manage pages", both modal "Cancel"s) draws a solid-black 2px outline where the design shows a subtle ~20%-black one. The buttons now use the DS token unmodified (no local override) so a brand-token fix lands automatically; until then these three read heavier than the reference. See DS-GAPS.md.

## Known deviations from the reference

- **"Save signature" / "Accept and Sign" are disabled until the canvas holds a signature.** The reference (with DS placeholder buttons) shows them enabled in the empty state; disabled-until-filled is a deliberate prototype guard against placing an empty signature — confirm with design.
- The mobile signedVerified reference frame includes a floating "Add text" mini-toolbar (belongs to the Text tool, outside the sign flow) — omitted.
- Payment details "Plan" value differs between reference breakpoints (desktop "7-Day Access", mobile "7-day Starter plan"); the desktop value is used on both.

- The mobile frame set has **no Draw/Type/Upload creation dialog** — the desktop modal is adapted as a fullscreen dialog on mobile (flagged for design review). The mobile "post-creation Accept and Sign" select screen is folded into the same flow.
- The mobile editor entry frame shows the **Text** tool tinted; the prototype tints **Sign** while the flow is active (consistent with desktop) — flagged.
- The W-9 page, page thumbnails and signature previews are rasters from the Figma render (`assets/`). `w9-page1.png` is the **full** page 1 (712×920, letter ratio — General Instructions included), not a crop, so the signature row sits mid-page rather than at the bottom edge.
- **The canvas holds the whole document, not one page.** `document.pages` is the ordered page list and the canvas stacks them in a scrolling column (`w9-page1…6.png`, 712px wide; pages 2–6 are grayscale, which halved their weight since they are black-on-white text). `document.signFieldPage` says which page carries the sign field, the typed values and the signature, so those overlays render once. Only the first page keeps `data-ff="document-page"` — the contract measures a single page and `querySelector` takes the first.
- **Typed form values are overlays, not baked pixels.** `document.formValues` (name / address / cityStateZip / ssn) sits in `VALUE_SLOTS` and `SSN_BOX_CENTRES`, measured from the page-1 raster (line 1 y 137-152, line 5 y 332-347, line 6 y 360-375, the nine 3-2-4 SSN boxes at y 433-459) and expressed in percentages. The page box is a `@container` and the type is sized in `cqw`, so the values scale with the page rather than the viewport — that is what keeps them inside their boxes on the 390px frame. SSN formatting is stripped and the digits are spread one per box. **The Date box is the exception: its value is baked into the page-1 raster**, so it has no overlay — if that raster is ever swapped for a truly blank form, Date needs a slot like the others.
- `thumb-p1…p6.png` are one-per-page sidebar thumbnails (240×311 = 2× the 120px slot) covering all six pages of Form W-9 (Rev. 3-2024) — page 4 previously repeated page 2's image and pages 5–6 were missing. `thumb-p1` is downscaled from the page-1 canvas raster so the thumbnail matches what the canvas shows; `thumb-p2…p6` are rendered from the official form PDF (vector → sharper than downscaling a raster). The Figma file only carries pages 1–4, which is why the earlier set stopped there. If page 1's canvas raster is replaced, regenerate `thumb-p1.png` from it to keep them matching.
- The sidebar scrolls internally (`overflow-y-auto` on a `h-full` panel): six pages are ~1240px, taller than the viewport, and the panel previously used `overflow-hidden` so pages 5–6 were unreachable. "Manage pages" is `sticky top-0` inside the scroller with an opaque `bg-bg-light-grey` band, so thumbnails travel underneath it while it stays reachable; `pb-6` keeps the last page 24px clear of the bottom edge. Same component backs the mobile drawer, so it scrolls there too.
- The purple `sign` chip and the pale signature field are baked into that raster; on top of them sits the real interactive overlay, which is what starts the flow (`onSignField` → the same `startSignFlow` as the toolbar Sign tool). The hit area is the **whole signature field**, not just the chip: the raster's chip (x 141–208) plus the pale field out to x 448, y 670–706 of 712×920 — it stops short of the Date field (x 474) so that stays inert. The button itself is transparent (the pale colour is the raster); the purple comes from an inner chip span holding its own 68px slice, and hovering anywhere in the field tints it. All of it is expressed in percentages so it tracks the image at any width. **Swapping the page image means re-measuring those percentages** in `DocumentCanvas.tsx` (and `placed-signature`'s `top`, anchored to the same signature line). In-product this overlay becomes the real PDF form-field hit box.
- **Signed-document badge appears only once a signature is on the page** (green seal when Verified, pending chip while it isn't). The Figma entry frame shows the green seal before signing; that was kept as-designed at first and then changed on request, since a badge on an unsigned page reads as already-signed.
