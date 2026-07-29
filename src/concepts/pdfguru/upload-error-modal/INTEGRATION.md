# Integration — upload-error-modal → pdfguru-fe

## Purpose
The modal a pdfguru user sees when a file they tried to upload can't be accepted: unsupported type, corrupted/unreadable PDF, or over the size limit. Blocking dialog with a clear reason, optional file details, and two actions — pick another file (primary) or cancel the upload flow.

## Props / data contract
| Prop | Type | Real source in pdfguru-fe |
|---|---|---|
| `variant` | `'unsupportedType' \| 'corrupted' \| 'tooLarge'` | derived in the upload thunk from the validation error code |
| `title` | `string` | `t('upload_error.<variant>.title')` |
| `description` | `string` | `t('upload_error.<variant>.description')` |
| `fileName` | `string?` | name of the rejected file from the upload attempt (File.name) |
| `details` | `{ label, value }[]?` | validation payload — detected format, upload limit vs. actual size, parse error, etc. Labels come from `t('upload_error.details.*')`. |
| `retryLabel` | `string` | `t('upload_error.retry')` — e.g. "Choose another file" |
| `cancelLabel` | `string` | `t('upload_error.cancel')` |
| `onRetry` | `() => void` | dispatch upload-picker re-open thunk (clears the failed attempt) |
| `onCancel` | `() => void` | dispatch dismiss-upload thunk (abandons the flow) |
| `onClose` | `() => void` | dismiss the modal via the header × control (same as `onCancel` in most cases; kept separate for analytics granularity) |

## States (scenarios in `mock.ts`)
- **default** — `unsupportedType`. Alert-triangle icon + "That file type is not supported" + detected/supported format rows.
- **corrupted** — `corrupted`. File-with-X icon + "We can't read this file" + reason row.
- **tooLarge** — `tooLarge`. Scale icon + "This file is over the size limit" + size/limit rows.

All three share the same layout — the concept renders variant-specific icon and copy via props; there is no local state.

## Integration steps
1. Copy `Screen.tsx` to `src/pages/upload-error-modal/index.tsx` as a **default export** page; move `components/` to `parts/`.
2. Wrap in pdfguru's app dialog/modal primitive rather than the concept's backdrop `div` (the backdrop here is only for the sandbox); the app dialog owns overlay + focus trap + ESC handling.
3. Route: this modal is opened imperatively from the upload flow rather than a routed page — mount it inside `sections/upload-section` gated on the upload slice's `error` field, or open it via the existing modal-manager if pdfguru-fe has one.
4. Data: source `variant`, `fileName`, and `details` from the upload validation payload via `useSelector(uploadErrorSelector())`. Wire `onRetry` to the existing upload picker action and `onCancel`/`onClose` to a `clearUploadError` action in `data/actions/documents.ts`. Delete `mock.ts`.
5. i18n: replace all literals with `t('upload_error.*')` keys in `src/locales/en/*` — one namespace per variant title/description and shared `retry`/`cancel`/detail labels.

## DS gaps flagged (compose-from-primitives, no ui-pes primitive exists)
ui-pes 0.5.45 exports none of the following, so each is composed from token utilities and should be swapped for a real primitive when the DS ships one:
- **Dialog/Modal** — shell composed from a `div` (`rounded-6 bg-bg-white-bg shadow-xl`) over a `bg-os-backdrop-overlay` backdrop; use pdfguru's app dialog in-product (step 2). Already tracked in `DS-GAPS.md` under ab-testing-modal.
- **Icons** — ui-pes exports no icon set; the close (X), alert-triangle, file-with-X, and scale glyphs are inline SVGs (`stroke="currentColor"`) in `components/icons.tsx`. Already tracked in `DS-GAPS.md`.

Nothing new was hit that isn't already in `DS-GAPS.md`.
