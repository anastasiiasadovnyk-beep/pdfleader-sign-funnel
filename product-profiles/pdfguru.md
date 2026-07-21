# Product Profile — pdfguru-fe (PDF Guru)

React 19 + TypeScript SPA consuming `@universe-forma/ui-pes`. Use this to shape a concept so it drops into pdfguru-fe.

## 1. Architecture
`src/` folder roles:
- `pages/` — full page/screen implementations; a page is `pages/<name>/index.tsx` with a **default export** component, optional `components/`, `parts/`, `mobile/`, `hooks/`, `helpers/`, `constants/` subfolders.
- `sections/` — large reusable layout blocks (e.g. `upload-section`).
- `components/` — shared UI, icons, layouts.
- `features/` — feature flags / A-B gates.
- `providers/` — context/theme providers.
- `data/` — Redux: `actions/`, `reducers/`, `selectors/`, `store.ts`.
- `services/` — API, analytics, business logic.
- `hooks/`, `utils/`, `types/`, `ts/` (enums/constants), `styles/`, `locales/`.

A new page = `pages/<name>/index.tsx` (default export) composing parts + ui-pes.

## 2. Page/feature anatomy
```
pages/account/
├── index.tsx            # default export AccountPage
├── styles.css
├── components/…         # page-local components
├── parts/               # sub-sections (accountHeader, filesTable, …)
├── mobile/index.tsx     # mobile variant
├── hooks/  helpers/  constants/
```
Component shape:
```tsx
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

interface AccountHeaderProps { searchValue: string; setSearchValue: (v: string) => void; files: ApiFile[]; }

export const AccountHeader = ({ searchValue, setSearchValue, files }: AccountHeaderProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  return <section className="flex w-full items-center justify-between">…</section>;
};
```
Hook order: i18n → local state → hooks → selectors.

## 3. Routing
`src/App.tsx`, React Router v6, lazy pages:
```tsx
const AccountPage = lazy(() => import('pages/account'));
// inside <Routes>, under APP_PATH_PREFIX + ':language?' LocaleGuard:
<Route path='account' element={<AccountIndexPage />} />
```
Path constants in `src/ts/constants/page-links.ts` (`APP_PATH_PREFIX = '/app'`, `PAGE_LINKS`).

## 4. Data layer
Classic **Redux + redux-thunk** (`createStore` + `applyMiddleware(thunk, apiMiddleware, …)`).
```tsx
// actions/documents.ts
export const saveUploadedFile = (file: File) => async (dispatch: Dispatch) => { … };
// selectors/documents.ts
export const documentsDataSelector = () => (state: RootState) => state.documents.data;
// in component
const documents = useSelector(documentsDataSelector());
const dispatch = useDispatch();
```
Types in `src/types/`, `src/ts/`.

## 5. ui-pes usage
Direct imports, no wrapper layer:
```tsx
import { Button, Input, cn } from '@universe-forma/ui-pes';
<Button className={cn('px-4', isActive && 'bg-primary')}>…</Button>
```

## 6. Styling
Tailwind 4. `src/styles/index.css` imports ui-pes `theme.css` + local `vars.css`/`themes.css` and adds an `@theme` block. Components use Tailwind utility classes + token references.

## 7. i18n
`i18next` + `react-i18next`. `const { t } = useTranslation();` → `t('account_updated.tools.title')`. Keys in `src/locales/{language}/{namespace}.json`.

## 8. Naming
Folders `kebab-case`; components `PascalCase` (`export const AccountHeader`); pages `default` export; utilities/services `camelCase`; props interfaces `{ComponentName}Props`.

## Integration recipe (concept → pdfguru-fe)
1. Copy the concept's pure component to `src/pages/<name>/index.tsx`; convert to a **default export** page. Move sub-parts to `parts/`.
2. Route: add `const <Name>Page = lazy(() => import('pages/<name>'))` + `<Route path='<name>' … />` in `src/App.tsx`; add a key to `src/ts/constants/page-links.ts`.
3. Data: keep the concept's `types.ts` props as the seam; feed real data via `useSelector(...Selector())`; wire callbacks to thunks in `data/actions/`; delete `mock.ts`.
4. Styling: keep Tailwind token classes as-is (theme is shared).
5. i18n: replace literal strings with `t('<name>.*')` keys added to `src/locales/en/*`.
