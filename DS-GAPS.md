# ui-pes DS gaps (for the design-system team)

Standing register of `@universe-forma/ui-pes` gaps found while building concepts — so builders stop re-discovering the same ones and the DS team gets a single list. When a concept hits a gap, add/confirm it here (with the concept that hit it) instead of only flagging it in that concept's `INTEGRATION.md`.

Against **ui-pes 0.5.45**.

## Missing components (composed from primitives + tokens as a workaround)
| Gap | Workaround in concepts | Seen in |
|---|---|---|
| No `Dialog` / `Modal` (overlay + focus trap) | `div` shell (`rounded-6 bg-bg-white-bg shadow-xl`) over `bg-os-backdrop-overlay` | ab-testing-modal |
| No `Radio` | bordered circle + inner `bg-primary` dot in a `<button>` | ab-testing-modal |
| No `Slider` | composed track/fill/thumb + transparent native `<input type=range>` | ab-testing-modal |
| No `Divider` | `h-px bg-os-divider` | ab-testing-modal, payment-details |
| No `Checkbox` (only `Switch` ships) | `<button role="checkbox">` with token styling | payment-details |
| No `Stepper` / progress indicator | composed from token utilities | payment-details |
| No `Progress` / linear-progress bar | token track (`bg-primary-filled-50`) + `bg-primary` fill, width = `progress%` | vocal-remover-processing |
| No `Alert` / `Callout` (bordered info box) | `border-primary rounded-3 bg-bg-white-bg` box + tonal icon chip + text | vocal-remover-processing |
| No `Card` primitive | `rounded-4 bg-bg-white-bg` divs | ab-testing-modal, payment-details |
| No `Select` / combobox field (trigger + option list, selected state, rich two-line items) | token-styled `<button>` trigger + composed popover `<ul role=listbox>` (outside-click / Escape close, `bg-primary-opacity-8` selected row); `BaseDropdown` is action-menu-shaped, not a value select | mp4-to-gif |
| No icon set | inline SVG (`stroke="currentColor"`, token `h-*/w-*`) | all |
| No `Tooltip` — yet the brands define `--color-bg-tooltip`, so one is clearly intended | composed `InfoTooltip`: DS `IconButton` trigger + absolutely-positioned `bg-bg-tooltip` panel, open on hover/focus and toggled on click for keyboard and touch | sign-funnel |

## Component prop gaps
| Gap | Impact | Seen in |
|---|---|---|
| `Button` has no `success` color (only `primary`/`secondary`/`action`/`error`) | green CTAs composed via `bg-success-main text-success-contrast-text` override | payment-details |
| `Badge` ships no default `type`; `size="dense"` sets no font-size | badge padding/radius/font compounds never apply → size forced via token/arbitrary | ab-testing-modal |
| No small-bold type token (~10px/700) for a compact timecode chip | nearest is `text-caption-xs` (11px/400); asserted as a `nearestToken` approximation | mp4-to-gif |
| `TabsActiveAnimation` measures the active trigger in an effect, so its indicator mounts at width/height 0 with `transition-all duration-400` already live — and there is no prop to opt out (`TabsList` always renders it) | the active-tab pill visibly grows in from nothing every time a tabbed surface mounts; very obvious in a dialog. Worked around per-concept by holding `transition-none` on the indicator for the first two frames. **Upstream fix: skip the transition on the first measurement** (e.g. set the initial geometry before enabling `transition-all`), or expose an `animated` prop | sign-funnel |

## Token / build gaps
| Gap | Impact | Status |
|---|---|---|
| `--color-os-button-outline-action-border` is `#000000` in **pdfleader** and **pdfguru** (tbp ships a light `#dfe4ea`) | `Button variant="outlined" color="action"` draws a heavy solid-black 2px outline. Every design we've had shows a subtle outline (sign-funnel's Figma samples ≈ black @20%, i.e. `--color-action-20`), so concepts were overriding the token with `border-action-20 border` — masking the bug and losing the DS border-width token with it | **needs DS/brand decision** — suspected wrong brand value; fixing the token makes outlined-action buttons correct everywhere with no per-concept override |
| Type-token utilities (`text-badge-sm`, `text-chip-badge`) only emit if literally scanned | sizes silently fell back to 16px | **fixed in sandbox** via generated `src/styles/ds-safelist.css`; upstream ui-pes could ship them unconditionally |
| `theme.css` applies `font-family: var(--font-primary)` to `.text-button-lg` / `-md` / `-sm` but **omits `.text-button-ms`** | every `size="ms"` Button rendered in the default sans, not the brand face — the only DS type utility missing from that selector list. Size/weight/line-height were already right (theme.css aliases the ms type tokens to md's), so the brands are correct in not defining `--text-button-ms-*` | **fixed in sandbox** via `.text-button-ms { font-family: var(--font-primary) }` in `src/styles/sandbox.css`; upstream fix = add `.text-button-ms` to that selector list, then delete the patch |

## Asset gaps (not DS components — brand/third-party art)
Card-brand marks (Mastercard/Maestro/Visa/Amex/JCB), wallet buttons (PayPal/Google Pay/Apple Pay), trust badges (Norton/Symantec), file-type thumbnails (DOCX/PDF) — no shared asset source; concepts use token-styled inline SVG/placeholders. Seen in payment-details.
