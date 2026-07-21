# Integration — documents-empty → pdfguru-fe
- Path: `src/pages/documents-empty/index.tsx` (default export `DocumentsEmptyPage`).
- Route: add `lazy(() => import('pages/documents-empty'))` + `<Route path='documents-empty' .../>` in `src/App.tsx`; add key to `src/ts/constants/page-links.ts`.
- Data: pass real props; wire `onUpload` to the upload thunk; delete `mock.ts`.
- i18n: replace literals with `t('documents_empty.*')` keys in `src/locales/en/*`.
