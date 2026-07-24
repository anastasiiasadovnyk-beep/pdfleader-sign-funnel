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
| No `Card` primitive | `rounded-4 bg-bg-white-bg` divs | ab-testing-modal, payment-details |
| No icon set | inline SVG (`stroke="currentColor"`, token `h-*/w-*`) | all |

## Component prop gaps
| Gap | Impact | Seen in |
|---|---|---|
| `Button` has no `success` color (only `primary`/`secondary`/`action`/`error`) | green CTAs composed via `bg-success-main text-success-contrast-text` override | payment-details |
| `Badge` ships no default `type`; `size="dense"` sets no font-size | badge padding/radius/font compounds never apply → size forced via token/arbitrary | ab-testing-modal |

## Token / build gaps
| Gap | Impact | Status |
|---|---|---|
| Type-token utilities (`text-badge-sm`, `text-chip-badge`) only emit if literally scanned | sizes silently fell back to 16px | **fixed in sandbox** via generated `src/styles/ds-safelist.css`; upstream ui-pes could ship them unconditionally |

## Asset gaps (not DS components — brand/third-party art)
Card-brand marks (Mastercard/Maestro/Visa/Amex/JCB), wallet buttons (PayPal/Google Pay/Apple Pay), trust badges (Norton/Symantec), file-type thumbnails (DOCX/PDF) — no shared asset source; concepts use token-styled inline SVG/placeholders. Seen in payment-details.
