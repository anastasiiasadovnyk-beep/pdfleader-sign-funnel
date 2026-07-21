# Product Profile — pdfleader-fe (PDFLeader)

React + TypeScript SPA consuming `@universe-forma/ui-pes`, built with **Feature-Sliced Design (FSD)**. Use this to shape a concept so it drops into pdfleader-fe.

## 1. Architecture (FSD)
Layers and import direction (enforced by `eslint-plugin-next-fsd`):
```
app/ → pages-layer/ → features/, widgets/ → entities/ → shared/   (no reverse imports)
```
- `app/` — entrypoint, global routing (`App.tsx`), providers, layout, i18n config, Redux store.
- `pages-layer/` — full pages (Dashboard, Editor, Checkout); compose features + entities.
- `widgets/` — cross-feature UI containers (Header, Footer, filePreview).
- `features/` — self-contained business features (compress, edit, split) with `model/ ui/ lib/ api/`.
- `entities/` — domain models (Document, User) with Redux slices/selectors/thunks + types + UI.
- `shared/` — reusable UI (button, modal), constants, hooks, api, styling.

A full "screen" lives in `pages-layer/<name>/`.

## 2. Slice anatomy
```
pages-layer/dashboard/
├── index.ts            # public API: export { DashboardPage }
├── ui/
│   ├── DashboardPage.tsx
│   ├── styles.tsx       # styled-components
│   └── documentsTable/{index.tsx,columns.tsx,styles.tsx}
├── model/               # useDocumentActions.ts, useShouldShowUpsellBanner.ts (hooks)
└── lib/                 # pure helpers (getRelativeTimeLabel.ts)
```
Feature slice mirrors this with `model/state/<name>.slice.ts` + `.schema.ts`. Public API is re-exported via `index.ts`.

## 3. Routing
`src/app/App.tsx`:
```tsx
<Routes>
  <Route path={PAGE_LINKS.DASHBOARD} element={<DashboardPage />} />
  <Route path={PAGE_LINKS.EDITOR} element={<EditorPage />} />
</Routes>
```
`PAGE_LINKS` in `src/shared/constants/pageLinks.ts`; locale-aware via `useGetPathWithLocale()`.

## 4. Data layer
**Redux Toolkit** slices + thunks + selectors, in `entities/*/model/state/`:
```ts
export const getDocuments = createAsyncThunk('documents/getDocuments', async (_, { rejectWithValue }) => api.getDocuments());
export const documentsDataSelector = () => (state: RootState) => state.documents.documents;
// in ui
const documents = useAppSelector(documentsDataSelector());
useAppDispatch()(getDocuments());
```
Persistence via storage wrappers (`DocumentsStorage`). Types/enums in slice `*.schema.ts`.

## 5. ui-pes usage
```tsx
import { Toaster, Button, cn, showToast } from '@universe-forma/ui-pes';
```
`shared/ui/` has local wrappers (`CommonButton`, `BaseModal`) that compose ui-pes — but concepts may import ui-pes directly.

## 6. Styling
styled-components + Tailwind. `ui/styles.tsx` styled-components with CSS-var tokens (`var(--Text-text_default, #393939)`) + inline media queries (760px mobile threshold).

## 7. i18n
`i18next` + `react-i18next`. `const { t } = useTranslation();` → `t('global.my_documents')`, `t('dashboard_page.meta.title')`. Files `src/app/locales/{lang}/translation.json`.

## 8. Naming
Files `camelCase` (`getRelativeTimeLabel.ts`, `useDocumentActions.ts`); components/types `PascalCase`; enums `E*` (`EFunnels`); selectors `*Selector`; hooks `use*`; slice exports `*Reducer`/`*Slice`; **public API only via `index.ts`** (named exports).

## Integration recipe (concept → pdfleader-fe)
1. Create `pages-layer/<name>/` with `ui/<Name>Page.tsx` (from the concept's pure component), `model/` for hooks, `lib/` for helpers, and `index.ts` exporting `{ <Name>Page }` (named, not default).
2. Route: add `<Route path={PAGE_LINKS.<NAME>} element={<<Name>Page />} />` in `src/app/App.tsx`; add the key to `src/shared/constants/pageLinks.ts`.
3. Data: keep the concept's `types.ts` props as the seam; back them with an `entities/<x>` slice via `useAppSelector`/`useAppDispatch`; delete `mock.ts`.
4. Styling: keep Tailwind token classes; migrate heavy scoped styling to `ui/styles.tsx` styled-components per convention.
5. i18n: replace literals with `t('<name>.*')` keys in `src/app/locales/en/translation.json`.
