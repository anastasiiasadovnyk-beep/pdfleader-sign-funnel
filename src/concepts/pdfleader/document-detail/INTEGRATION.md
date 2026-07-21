# Integration — document-detail → pdfleader-fe

- Path: `pages-layer/documentDetail/` with `ui/DocumentDetailPage.tsx` (from this concept's `Screen.tsx`), `model/` for the data hook, and `index.ts` exporting `{ DocumentDetailPage }` (named export).
- Route: add `<Route path={PAGE_LINKS.DOCUMENT_DETAIL} element={<DocumentDetailPage />} />` in `src/app/App.tsx`; add the key to `src/shared/constants/pageLinks.ts`.
- Data: back `types.ts` props with an `entities/document` slice — a thunk (`getDocument`) populates `documentTitle`/`metadata`, mapped to `status: 'ready' | 'empty' | 'error'` from the request state (loading/not-found/rejected) via `useAppSelector`/`useAppDispatch`. `onDownload` dispatches the existing download thunk; `onDelete` dispatches the delete thunk and navigates back to the dashboard on success; `onRetry` re-dispatches `getDocument`. Delete `mock.ts` once wired.
- Styling: keep the Tailwind token classes as-is; move the metadata card's scoped styling into `ui/styles.tsx` styled-components only if it grows beyond the current single card.
- i18n: replace literals with `t('document_detail.*')` keys (`document_detail.download`, `document_detail.delete`, `document_detail.metadata.name`, `.size`, `.pages`, `.modified`, `document_detail.empty.heading`, `.empty.subheading`, `document_detail.error.heading`, `.error.subheading`, `document_detail.retry`) in `src/app/locales/en/translation.json`.

## DS gap flagged

ui-pes has no `Card`/`Panel`/description-list component. The metadata container is composed from a plain `div` (`rounded-3 border border-os-divider bg-bg-white-bg p-6`) + a native `<dl>/<dt>/<dd>` for label/value rows, using only token utilities. If the DS team adds a `Card` or `DescriptionList` primitive, swap this composition for it.
