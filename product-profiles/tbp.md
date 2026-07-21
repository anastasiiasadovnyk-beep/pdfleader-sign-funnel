# Product Profile — tbp-fe (TheBestPDF)

React + TypeScript SPA consuming `@universe-forma/ui-pes`. Use this to shape a concept so it drops into tbp-fe.

## 1. Architecture
`src/` folder roles:
- `pages/` — full page/screen components; page = `pages/<name>/index.tsx`, often **default export**, may have `styles.tsx` (styled-components) + `components/`.
- `features/` — feature-scoped modules (landing, dashboard, checkout, pdf-to-html, …).
- `layouts/` — wrapper layouts (requireAuth, authForm, …).
- `store/` — **Redux Toolkit** slices + middleware (user, subscriptions, documents, qrEditor).
- `components/`, `hooks/`, `providers/`, `services/` (analytics/amplitude), `types/` (`interfaces/`, `enums/`, `constants/`), `locales/`, `utils/`.

A new page = `pages/<name>/index.tsx`, wrapped with `<Helmet>` for SEO, rendering layouts + content.

## 2. Page/feature anatomy
```
pages/aboutUs/
├── index.tsx            # AboutUsPage (default export)
└── components/…         # reviews, useCases, …
```
Component shape:
```tsx
import type { FC } from 'react';
import { cn } from '@universe-forma/ui-pes';
import { Helmet } from 'react-helmet';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

const AboutUsPage: FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  return (
    <>
      <Helmet>…</Helmet>
      <Header />
      <div className="mx-auto flex w-full max-w-[1440px] …">…</div>
    </>
  );
};
export default AboutUsPage;
```

## 3. Routing
`src/App.tsx`, React Router v6, lazy-loaded (often named-export modules):
```tsx
const RemoveWatermarkPage = lazy(() => import('pages/removeWatermark').then((m) => ({ default: m.RemoveWatermarkPage })));
<Route path='subscription-offer' element={<SubscriptionOfferPage />} />
// locale-aware: <Route path=':language?' …>
```
Some routes generated from service lists via `generateServiceRoutes()`.

## 4. Data layer
**Redux Toolkit** + async thunks in `store/` slices; `configureStore({ reducer: combineReducers({...}), middleware: [apiMiddleware, downloadMiddleware, analyticsMiddleware] })`.
```tsx
const dispatch = useDispatch();
const userId = useSelector(userIdSelector);
dispatch(postContactForm(...));
```
No RTK Query / React Query. Types in `src/types/{interfaces,enums,constants}` (`IService`, `EModalTypes`).

## 5. ui-pes usage
```tsx
import { Button, cn } from '@universe-forma/ui-pes';
<Button className={cn('px-4', isActive && 'bg-primary')}>…</Button>
```
Minimal ui-pes adoption; mostly Tailwind + styled-components. `cn()` is the primary reused util.

## 6. Styling
Tailwind + styled-components hybrid. Tailwind for layout/spacing utilities; `styles.tsx` styled-components for complex scoped styles; CSS-var tokens (`var(--Text-color-main, #212e45)`).

## 7. i18n
`i18next` + `react-i18next` (chained backend). `const { t } = useTranslation();` → `t('about_us_page.hero_stats.1.value')`. Files `src/locales/{lang}/translation.json`, dot-notation keys.

## 8. Naming
Folders `kebab-case`; component files `PascalCase`/`index.tsx`; pages **default** export; interfaces `I*`, enums `E*`; styles `styles.tsx`/`styles.ts`; props `{ComponentName}Props`.

## Integration recipe (concept → tbp-fe)
1. Copy the concept's pure component to `src/pages/<name>/index.tsx` as a **default export** `FC`; wrap with `<Helmet>` for SEO; add `<Header/>`/layout as needed.
2. Route: add `lazy(() => import('pages/<name>'))` + `<Route path='<name>' … />` in `src/App.tsx`.
3. Data: keep the concept's `types.ts` props as the seam; feed via `useSelector` selectors; wire callbacks to RTK thunks in `store/`; delete `mock.ts`.
4. Styling: keep Tailwind token classes; migrate any heavy scoped styling to `styles.tsx` if the team prefers styled-components.
5. i18n: replace literals with `t('<name>.*')` keys in `src/locales/en/translation.json`.
