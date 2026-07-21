# Vibe Concepts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A standalone Vite sandbox + `vibe-concept` Claude skill that turns a Figma reference + prompt into a previewable, ui-pes-built, integration-ready screen concept for pdfguru-fe / tbp-fe / pdfleader-fe.

**Architecture:** One repo, two halves. A Vite+React19+Tailwind4 preview app renders `src/concepts/<name>/` folders (pure `Screen.tsx` + typed `mock`) in a gallery, applying a per-product brand token layer. A `.claude/skills/vibe-concept` skill reads two generated catalogs — `ds-catalog/` (from ui-pes) and `product-profiles/` (from the three repos) — drills into ui-pes source, emits the concept, runs quality gates, and self-verifies against the reference.

**Tech Stack:** Vite 6, React 19, Tailwind 4 (`@tailwindcss/vite`), TypeScript 5, Vitest 4, `@universe-forma/ui-pes` (GitHub npm registry), Node 20, plain-Node ESM scripts.

## Global Constraints

- Node ≥ 20; ESM only (`"type": "module"`).
- React 19, TypeScript strict, Tailwind 4.
- Design system dependency: `@universe-forma/ui-pes` from `https://npm.pkg.github.com` (requires `.npmrc` + a `GITHUB_TOKEN`/`NODE_AUTH_TOKEN` with `read:packages`).
- ui-pes tokens are self-referential placeholders; real values are product-supplied — never hardcode token values in catalogs.
- Concept `Screen.tsx` is pure: props in, UI out. Only ui-pes imports + Tailwind token classes. No data-fetch, store, router, or i18n inside it.
- Comments: none unless a non-obvious WHY; hard cap 2 lines; no banner comments.
- Commits: `<type>(<scope>): <subject>`, subject line only, no body, never a `Co-Authored-By` line.
- Third-party reuse: anydesign (MIT) patterns must be attributed in `VENDOR.md`; do not copy files from unlicensed repos.

---

### Task 1: Sandbox scaffold rendering ui-pes

**Files:**
- Create: `package.json`, `.npmrc`, `.gitignore`, `tsconfig.json`, `vite.config.ts`, `index.html`
- Create: `src/app/main.tsx`, `src/app/App.tsx`, `src/styles/sandbox.css`

**Interfaces:**
- Produces: a running dev server (`npm run dev`) mounting `<App/>`; `src/styles/sandbox.css` imports ui-pes `theme.css`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "ui-design-vibe-concepts",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "reindex": "node scripts/reindex-ds.mjs && node scripts/reindex-products.mjs",
    "reindex:ds": "node scripts/reindex-ds.mjs",
    "reindex:products": "node scripts/reindex-products.mjs",
    "gate": "node scripts/gates/run.mjs"
  },
  "dependencies": {
    "@universe-forma/ui-pes": "^0.5.45",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.1.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.11",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.5.2",
    "tailwindcss": "^4.1.11",
    "typescript": "^5.9.3",
    "vite": "^6.0.0",
    "vitest": "^4.1.2"
  }
}
```

- [ ] **Step 2: Create `.npmrc` and `.gitignore`**

`.npmrc`:
```
@universe-forma:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

`.gitignore`:
```
node_modules
dist
*.local
.DS_Store
```

- [ ] **Step 3: Create `vite.config.ts`, `tsconfig.json`, `index.html`**

`vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { open: true },
});
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["vite/client", "vitest/globals"],
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "scripts"]
}
```

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vibe Concepts</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/app/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create styles + app entry**

`src/styles/sandbox.css` (ui-pes only exports `"."`, so its `theme.css` is imported via the relative node_modules path — the same approach the real products use):
```css
@import '../../node_modules/@universe-forma/ui-pes/es/theme.css';
@import 'tailwindcss';

body { margin: 0; }
```

`src/app/App.tsx`:
```tsx
import { Button } from '@universe-forma/ui-pes';

export function App() {
  return (
    <main className="p-8">
      <h1 className="text-desktop-title-3">Vibe Concepts</h1>
      <Button>Design system online</Button>
    </main>
  );
}
```

`src/app/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/sandbox.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 5: Install and verify the dev server boots**

Run: `NODE_AUTH_TOKEN=$GITHUB_TOKEN npm install && npm run build`
Expected: install succeeds (ui-pes resolves from GitHub registry) and `tsc -b && vite build` completes with no type errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(sandbox): scaffold vite react tailwind app consuming ui-pes"
```

---

### Task 2: Per-product brand token layer + brand switching

**Files:**
- Create: `brands/pdfguru.css`, `brands/tbp.css`, `brands/pdfleader.css` (seed values; regenerated in Task 6)
- Create: `src/app/BrandProvider.tsx`
- Test: `src/app/BrandProvider.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `type Brand = 'pdfguru' | 'tbp' | 'pdfleader'`; `<BrandProvider brand={Brand}>` that sets `data-brand` on a wrapper so the matching brand CSS applies its `:root`-level token values.

- [ ] **Step 1: Create seed brand CSS files**

`brands/pdfguru.css` (seed — real values come from reindex in Task 6):
```css
[data-brand='pdfguru'] {
  --color-primary: #d7143a;
  --color-primary-contrast-text: #ffffff;
  --color-text-primary: #000000de;
  --color-bg-white-bg: #ffffff;
  --font-primary: 'Montserrat', sans-serif;
}
```

`brands/tbp.css`:
```css
[data-brand='tbp'] {
  --color-primary: #2f6bff;
  --color-primary-contrast-text: #ffffff;
  --color-text-primary: #212e45;
  --color-bg-white-bg: #ffffff;
  --font-primary: 'Inter', sans-serif;
}
```

`brands/pdfleader.css`:
```css
[data-brand='pdfleader'] {
  --color-primary: #0097db;
  --color-primary-contrast-text: #ffffff;
  --color-text-primary: #393939;
  --color-bg-white-bg: #ffffff;
  --font-primary: 'Montserrat', sans-serif;
}
```

- [ ] **Step 2: Import brand files into sandbox styles**

Append to `src/styles/sandbox.css`:
```css
@import '../../brands/pdfguru.css';
@import '../../brands/tbp.css';
@import '../../brands/pdfleader.css';
```

- [ ] **Step 3: Write the failing test**

`src/app/BrandProvider.test.tsx`:
```tsx
import { render } from '@testing-library/react';
import { BrandProvider } from './BrandProvider';

test('sets data-brand attribute on wrapper', () => {
  const { container } = render(<BrandProvider brand="tbp">x</BrandProvider>);
  expect(container.querySelector('[data-brand="tbp"]')).not.toBeNull();
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run src/app/BrandProvider.test.tsx`
Expected: FAIL — cannot resolve `./BrandProvider`.
(If `@testing-library/react` is missing, add it: `npm i -D @testing-library/react @testing-library/jest-dom jsdom`, and set `test.environment: 'jsdom'` in a `vitest.config.ts`.)

- [ ] **Step 5: Implement `BrandProvider`**

`src/app/BrandProvider.tsx`:
```tsx
import type { ReactNode } from 'react';

export type Brand = 'pdfguru' | 'tbp' | 'pdfleader';

export function BrandProvider({ brand, children }: { brand: Brand; children: ReactNode }) {
  return <div data-brand={brand} className="min-h-screen bg-bg-white-bg text-text-primary">{children}</div>;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/app/BrandProvider.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(sandbox): per-product brand token layer and BrandProvider"
```

---

### Task 3: Auto-route concepts + gallery

**Files:**
- Create: `src/app/concepts.ts`, `src/app/Gallery.tsx`, `src/app/ConceptRoute.tsx`
- Modify: `src/app/App.tsx`
- Test: `src/app/concepts.test.ts`

**Interfaces:**
- Consumes: `Brand`, `BrandProvider` from Task 2.
- Produces: `type ConceptModule = { default: React.ComponentType<any> }`; `type ConceptEntry = { slug: string; title: string; brand: Brand; load: () => Promise<ConceptModule>; loadMock: () => Promise<{ default: unknown }> }`; `listConcepts(globScreens, globMetas): ConceptEntry[]`.

- [ ] **Step 1: Write the failing test**

`src/app/concepts.test.ts`:
```ts
import { listConcepts } from './concepts';

test('builds concept entries from screen + meta globs', () => {
  const screens = { '/src/concepts/demo/Screen.tsx': () => Promise.resolve({ default: () => null }) };
  const metas = { '/src/concepts/demo/meta.ts': { title: 'Demo', brand: 'tbp' } };
  const mocks = { '/src/concepts/demo/mock.ts': () => Promise.resolve({ default: {} }) };
  const entries = listConcepts(screens as any, metas as any, mocks as any);
  expect(entries).toHaveLength(1);
  expect(entries[0]).toMatchObject({ slug: 'demo', title: 'Demo', brand: 'tbp' });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/concepts.test.ts`
Expected: FAIL — cannot resolve `./concepts`.

- [ ] **Step 3: Implement `concepts.ts`**

`src/app/concepts.ts`:
```ts
import type { ComponentType } from 'react';
import type { Brand } from './BrandProvider';

export type ConceptMeta = { title: string; brand: Brand };
export type ConceptEntry = {
  slug: string;
  title: string;
  brand: Brand;
  load: () => Promise<{ default: ComponentType<any> }>;
  loadMock: () => Promise<{ default: unknown }>;
};

const slugOf = (p: string) => p.split('/').slice(-2, -1)[0];

export function listConcepts(
  screens: Record<string, () => Promise<{ default: ComponentType<any> }>>,
  metas: Record<string, ConceptMeta>,
  mocks: Record<string, () => Promise<{ default: unknown }>>,
): ConceptEntry[] {
  return Object.keys(screens).map((path) => {
    const slug = slugOf(path);
    const meta = metas[Object.keys(metas).find((m) => slugOf(m) === slug)!] ?? { title: slug, brand: 'pdfguru' as Brand };
    return {
      slug,
      title: meta.title,
      brand: meta.brand,
      load: screens[path],
      loadMock: mocks[Object.keys(mocks).find((m) => slugOf(m) === slug)!],
    };
  });
}

export const conceptEntries = () =>
  listConcepts(
    import.meta.glob('/src/concepts/*/Screen.tsx'),
    import.meta.glob('/src/concepts/*/meta.ts', { eager: true, import: 'default' }) as Record<string, ConceptMeta>,
    import.meta.glob('/src/concepts/*/mock.ts'),
  );
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/concepts.test.ts`
Expected: PASS.

- [ ] **Step 5: Implement Gallery, ConceptRoute, and wire the router**

`src/app/Gallery.tsx`:
```tsx
import { Link } from 'react-router-dom';
import { conceptEntries } from './concepts';

export function Gallery() {
  const entries = conceptEntries();
  return (
    <main className="p-8">
      <h1 className="text-desktop-title-3 mb-6">Vibe Concepts</h1>
      {entries.length === 0 && <p className="text-body">No concepts yet. Ask Claude to build one.</p>}
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {entries.map((e) => (
          <li key={e.slug} className="rounded-3 border border-action-stroke p-4">
            <Link to={`/c/${e.slug}`} className="text-subtitle-emph">{e.title}</Link>
            <p className="text-caption text-text-secondary">{e.brand}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

`src/app/ConceptRoute.tsx`:
```tsx
import { lazy, Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { conceptEntries } from './concepts';
import { BrandProvider } from './BrandProvider';

export function ConceptRoute() {
  const { slug } = useParams();
  const entry = conceptEntries().find((e) => e.slug === slug);
  const [mock, setMock] = useState<unknown>(null);
  useEffect(() => { entry?.loadMock().then((m) => setMock(m.default)); }, [slug]);
  if (!entry) return <p className="p-8">Unknown concept.</p>;
  const Screen = lazy(entry.load);
  return (
    <BrandProvider brand={entry.brand}>
      <Suspense fallback={<p className="p-8">Loading…</p>}>
        {mock !== null && <Screen {...(mock as object)} />}
      </Suspense>
    </BrandProvider>
  );
}
```

Replace `src/app/App.tsx`:
```tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Gallery } from './Gallery';
import { ConceptRoute } from './ConceptRoute';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/c/:slug" element={<ConceptRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: builds with no type errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(sandbox): auto-route concepts and gallery"
```

---

### Task 4: Concept contract + seed concept

**Files:**
- Create: `src/concepts/_template/{Screen.tsx,types.ts,mock.ts,meta.ts,INTEGRATION.md}`
- Create: `src/concepts/documents-empty/{Screen.tsx,types.ts,mock.ts,meta.ts,INTEGRATION.md}`

**Interfaces:**
- Consumes: `Brand` from Task 2.
- Produces: the canonical 5-file concept shape every generated concept follows; a working seed concept proving the render path end to end.

- [ ] **Step 1: Create the `_template` reference files**

`src/concepts/_template/types.ts`:
```ts
export type TemplateProps = { title: string };
```
`src/concepts/_template/Screen.tsx`:
```tsx
import type { TemplateProps } from './types';

export default function Screen({ title }: TemplateProps) {
  return <h1 className="text-desktop-title-3 p-8">{title}</h1>;
}
```
`src/concepts/_template/mock.ts`:
```ts
import type { TemplateProps } from './types';
const mock: TemplateProps = { title: 'Template concept' };
export default mock;
```
`src/concepts/_template/meta.ts`:
```ts
import type { Brand } from '@/app/BrandProvider';
const meta: { title: string; brand: Brand } = { title: 'Template', brand: 'pdfguru' };
export default meta;
```
`src/concepts/_template/INTEGRATION.md`:
```md
# Integration recipe (template)
Replace with the target product's recipe: path, export style, route registration, data wiring, i18n keys.
```

- [ ] **Step 2: Exclude `_template` from the gallery**

Modify `src/app/concepts.ts` — filter template slugs in `listConcepts`:
```ts
  return Object.keys(screens)
    .filter((path) => !slugOf(path).startsWith('_'))
    .map((path) => {
```

- [ ] **Step 3: Create the `documents-empty` seed concept**

`src/concepts/documents-empty/types.ts`:
```ts
export type DocumentsEmptyProps = {
  onUpload: () => void;
  ctaLabel: string;
  heading: string;
  subheading: string;
};
```
`src/concepts/documents-empty/Screen.tsx`:
```tsx
import { Button } from '@universe-forma/ui-pes';
import type { DocumentsEmptyProps } from './types';

export default function Screen({ heading, subheading, ctaLabel, onUpload }: DocumentsEmptyProps) {
  return (
    <section className="mx-auto flex max-w-[720px] flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-desktop-title-4">{heading}</h1>
      <p className="text-body text-text-secondary">{subheading}</p>
      <Button onClick={onUpload}>{ctaLabel}</Button>
    </section>
  );
}
```
`src/concepts/documents-empty/mock.ts`:
```ts
import type { DocumentsEmptyProps } from './types';
const mock: DocumentsEmptyProps = {
  heading: 'No documents yet',
  subheading: 'Upload a PDF to get started.',
  ctaLabel: 'Upload PDF',
  onUpload: () => console.log('upload'),
};
export default mock;
```
`src/concepts/documents-empty/meta.ts`:
```ts
import type { Brand } from '@/app/BrandProvider';
const meta: { title: string; brand: Brand } = { title: 'Documents — empty state', brand: 'pdfguru' };
export default meta;
```
`src/concepts/documents-empty/INTEGRATION.md`:
```md
# Integration — documents-empty → pdfguru-fe
- Path: `src/pages/documents-empty/index.tsx` (default export `DocumentsEmptyPage`).
- Route: add `lazy(() => import('pages/documents-empty'))` + `<Route path='documents-empty' .../>` in `src/App.tsx`; add key to `src/ts/constants/page-links.ts`.
- Data: pass real props; wire `onUpload` to the upload thunk; delete `mock.ts`.
- i18n: replace literals with `t('documents_empty.*')` keys in `src/locales/en/*`.
```

- [ ] **Step 4: Verify the seed concept renders in build**

Run: `npm run build`
Expected: build passes; `conceptEntries()` includes `documents-empty` and excludes `_template`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(concepts): concept contract template and documents-empty seed"
```

---

### Task 5: `reindex-ds` — generate the ui-pes catalog

**Files:**
- Create: `scripts/lib/css-tokens.mjs`, `scripts/reindex-ds.mjs`
- Test: `scripts/lib/css-tokens.test.mjs`
- Output (generated): `ds-catalog/{components,color-tokens,typography,spacing}.md`

**Interfaces:**
- Consumes: installed `node_modules/@universe-forma/ui-pes` (`es/theme.css`, `es/index.d.ts`).
- Produces: `parseCssVars(css: string): { name: string; value: string; category: string }[]` and `tailwindUtilFor(name: string): string | null`.

- [ ] **Step 1: Write the failing test**

`scripts/lib/css-tokens.test.mjs`:
```js
import { parseCssVars, tailwindUtilFor } from './css-tokens.mjs';

test('parses css custom properties and categorizes', () => {
  const css = ':root{ --color-primary: #fff; --radius-2: 0.5rem; --spacing-4: 16px; }';
  const vars = parseCssVars(css);
  expect(vars.find((v) => v.name === 'color-primary')?.category).toBe('color');
  expect(vars.find((v) => v.name === 'radius-2')?.category).toBe('radius');
});

test('maps color token to tailwind utility hint', () => {
  expect(tailwindUtilFor('color-primary')).toBe('bg-primary / text-primary / border-primary');
  expect(tailwindUtilFor('radius-2')).toBe('rounded-2');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/lib/css-tokens.test.mjs`
Expected: FAIL — cannot resolve `./css-tokens.mjs`.

- [ ] **Step 3: Implement `css-tokens.mjs`** (regex adapted from anydesign, MIT — attribute in VENDOR.md)

`scripts/lib/css-tokens.mjs`:
```js
const CSS_VAR_RE = /--([A-Za-z0-9_-]+)\s*:\s*([^;}]+?)\s*(?:!important\s*)?(?:;|(?=\}))/gs;

const categorize = (name) => {
  if (name.startsWith('color-')) return 'color';
  if (name.startsWith('radius-')) return 'radius';
  if (name.startsWith('spacing-') || name.startsWith('space-')) return 'spacing';
  if (name.startsWith('breakpoint-')) return 'breakpoint';
  if (name.startsWith('font-') || name.includes('text-')) return 'typography';
  return 'other';
};

export function parseCssVars(css) {
  const out = [];
  for (const m of css.matchAll(CSS_VAR_RE)) {
    out.push({ name: m[1], value: m[2].trim(), category: categorize(m[1]) });
  }
  return out;
}

export function tailwindUtilFor(name) {
  if (name.startsWith('color-')) {
    const base = name.replace(/^color-/, '');
    return `bg-${base} / text-${base} / border-${base}`;
  }
  if (name.startsWith('radius-')) return `rounded-${name.replace(/^radius-/, '')}`;
  if (name.startsWith('spacing-')) return `p-${name.replace(/^spacing-/, '')} / m-${name.replace(/^spacing-/, '')}`;
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/lib/css-tokens.test.mjs`
Expected: PASS.

- [ ] **Step 5: Implement `reindex-ds.mjs`**

`scripts/reindex-ds.mjs`:
```js
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { parseCssVars, tailwindUtilFor } from './lib/css-tokens.mjs';

const require = createRequire(import.meta.url);
const pkgDir = path.dirname(require.resolve('@universe-forma/ui-pes/package.json'));
const version = JSON.parse(readFileSync(path.join(pkgDir, 'package.json'), 'utf8')).version;
const css = readFileSync(path.join(pkgDir, 'es/theme.css'), 'utf8');
const dts = readFileSync(path.join(pkgDir, 'es/index.d.ts'), 'utf8');

mkdirSync('ds-catalog', { recursive: true });
const vars = parseCssVars(css);
const banner = `<!-- generated by reindex-ds from @universe-forma/ui-pes@${version}. Token values are product-supplied; use the utility, not a hardcoded value. -->\n`;

const tableFor = (cat) => {
  const rows = vars.filter((v) => v.category === cat)
    .map((v) => `| \`--${v.name}\` | ${tailwindUtilFor(v.name) ?? '—'} |`).join('\n');
  return `${banner}# ${cat} tokens (ui-pes ${version})\n\n| Token | Tailwind utility |\n|---|---|\n${rows}\n`;
};

writeFileSync('ds-catalog/color-tokens.md', tableFor('color'));
writeFileSync('ds-catalog/spacing.md', `${tableFor('spacing')}\n${tableFor('radius')}`);
writeFileSync('ds-catalog/typography.md', tableFor('typography'));

const exports = [...dts.matchAll(/export\s+\{([^}]+)\}/g)]
  .flatMap((m) => m[1].split(',').map((s) => s.trim().split(' as ')[0].trim()))
  .filter((n) => n && /^[A-Z]/.test(n));
const componentRows = [...new Set(exports)].map((n) => `| \`${n}\` | \`import { ${n} } from '@universe-forma/ui-pes'\` |`).join('\n');
writeFileSync('ds-catalog/components.md',
  `${banner}# Components (ui-pes ${version})\n\nNever invent a component. If missing, compose from these + tokens and flag it.\n\n| Component | Import |\n|---|---|\n${componentRows}\n`);

console.log(`reindex-ds: wrote ds-catalog for ui-pes@${version} (${vars.length} tokens, ${new Set(exports).size} components)`);
```

- [ ] **Step 6: Run reindex and verify output**

Run: `node scripts/reindex-ds.mjs`
Expected: prints the summary; `ds-catalog/components.md` lists `Button`, `Input`, `Badge`, etc.; token files contain the token→utility tables. Commit the generated `ds-catalog/`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(catalog): reindex-ds generates ui-pes ds-catalog"
```

---

### Task 6: `reindex-products` — profiles + brand extraction

**Files:**
- Create: `scripts/lib/product-config.mjs`, `scripts/lib/extract-brand.mjs`, `scripts/reindex-products.mjs`
- Test: `scripts/lib/extract-brand.test.mjs`
- Output (generated/seeded): `product-profiles/{pdfguru,tbp,pdfleader}.md`, refreshed `brands/*.css`

**Interfaces:**
- Consumes: `parseCssVars` from Task 5; optional local product repos at configured paths.
- Produces: `PRODUCTS: { key, repoPath, brandCssGlobs }[]`; `extractBrandTokens(cssFiles: string[]): Record<string,string>` returning `--var → value` pairs found in `:root`/theme files.

- [ ] **Step 1: Write the failing test**

`scripts/lib/extract-brand.test.mjs`:
```js
import { extractBrandTokens } from './extract-brand.mjs';

test('collects color/font token values from css sources', () => {
  const tokens = extractBrandTokens([':root{ --color-primary:#0097db; --font-primary:Montserrat; --ignore-me:1px; }']);
  expect(tokens['--color-primary']).toBe('#0097db');
  expect(tokens['--font-primary']).toBe('Montserrat');
  expect(tokens['--ignore-me']).toBeUndefined();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/lib/extract-brand.test.mjs`
Expected: FAIL — cannot resolve `./extract-brand.mjs`.

- [ ] **Step 3: Implement config + extractor**

`scripts/lib/product-config.mjs`:
```js
export const PRODUCTS = [
  { key: 'pdfguru', repoPath: process.env.PDFGURU_FE ?? '../pdfguru-fe', brandGlobs: ['src/styles/vars.css', 'src/styles/themes.css'] },
  { key: 'tbp', repoPath: process.env.TBP_FE ?? '../tbp-fe', brandGlobs: ['src/styles/vars.css', 'src/styles/theme.css'] },
  { key: 'pdfleader', repoPath: process.env.PDFLEADER_FE ?? '../pdfleader-fe', brandGlobs: ['src/shared/assets/styles/vars.css', 'src/app/styles/theme.css'] },
];
```

`scripts/lib/extract-brand.mjs`:
```js
import { parseCssVars } from './css-tokens.mjs';

const KEEP = /^(color-|font-|radius-|shadow-)/;

export function extractBrandTokens(cssSources) {
  const tokens = {};
  for (const css of cssSources) {
    for (const v of parseCssVars(css)) {
      if (KEEP.test(v.name) && !v.value.startsWith('var(')) tokens[`--${v.name}`] = v.value;
    }
  }
  return tokens;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/lib/extract-brand.test.mjs`
Expected: PASS.

- [ ] **Step 5: Implement `reindex-products.mjs`**

`scripts/reindex-products.mjs`:
```js
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { PRODUCTS } from './lib/product-config.mjs';
import { extractBrandTokens } from './lib/extract-brand.mjs';

mkdirSync('brands', { recursive: true });
for (const p of PRODUCTS) {
  if (!existsSync(p.repoPath)) { console.warn(`reindex-products: ${p.key} repo not found at ${p.repoPath}; keeping committed brand + profile`); continue; }
  const sources = p.brandGlobs
    .map((g) => path.join(p.repoPath, g))
    .filter(existsSync)
    .map((f) => readFileSync(f, 'utf8'));
  const tokens = extractBrandTokens(sources);
  if (Object.keys(tokens).length) {
    const body = Object.entries(tokens).map(([k, v]) => `  ${k}: ${v};`).join('\n');
    writeFileSync(`brands/${p.key}.css`, `[data-brand='${p.key}'] {\n${body}\n}\n`);
    console.log(`reindex-products: wrote brands/${p.key}.css (${Object.keys(tokens).length} tokens)`);
  }
}
console.log('reindex-products: product-profiles/*.md are maintained from codebase analysis; edit via profiling agents.');
```

- [ ] **Step 6: Seed the three product profiles**

Create `product-profiles/pdfguru.md`, `product-profiles/tbp.md`, `product-profiles/pdfleader.md` from the codebase analysis captured in the spec. Each MUST contain these 8 sections: Architecture, Page/feature anatomy, Routing, Data layer, ui-pes usage, Styling, i18n, Naming. Use the exact snippets already gathered (e.g. pdfleader FSD slice layout with `ui/ model/ lib/ index.ts`; pdfguru `pages/<name>/index.tsx` default export + Redux thunk; tbp `pages/` + Redux Toolkit + styled-components). End each with an "Integration recipe" section mirroring the `INTEGRATION.md` shape.

- [ ] **Step 7: Run and verify**

Run: `node scripts/reindex-products.mjs`
Expected: for each present repo, prints token counts and refreshes `brands/<key>.css`; missing repos warn without failing. Profiles exist with all 8 sections.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(catalog): reindex-products brand extraction and product profiles"
```

---

### Task 7: Quality gates

**Files:**
- Create: `scripts/gates/lib/scan.mjs`, `scripts/gates/lint-hardcodes.mjs`, `scripts/gates/validate-tokens.mjs`, `scripts/gates/verify-states.mjs`, `scripts/gates/run.mjs`
- Test: `scripts/gates/lint-hardcodes.test.mjs`, `scripts/gates/verify-states.test.mjs`

**Interfaces:**
- Consumes: concept source files under `src/concepts/*/Screen.tsx`.
- Produces: `lintHardcodes(src: string): string[]`, `verifyStates(src: string): string[]` — each returns an array of finding messages (empty = pass).

- [ ] **Step 1: Write the failing tests**

`scripts/gates/lint-hardcodes.test.mjs`:
```js
import { lintHardcodes } from './lint-hardcodes.mjs';

test('flags raw hex and raw tailwind palette utility', () => {
  const bad = `<div className="bg-gray-500" style={{ color: '#ff0000' }} />`;
  const findings = lintHardcodes(bad);
  expect(findings.length).toBeGreaterThanOrEqual(2);
});

test('passes clean token-based markup', () => {
  const good = `<div className="bg-bg-white-bg text-text-primary rounded-2" />`;
  expect(lintHardcodes(good)).toEqual([]);
});
```

`scripts/gates/verify-states.test.mjs`:
```js
import { verifyStates } from './verify-states.mjs';

test('flags a button with onClick but no disabled handling', () => {
  const src = `<button onClick={go}>Go</button>`;
  expect(verifyStates(src).length).toBeGreaterThanOrEqual(1);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run scripts/gates`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the gate modules**

`scripts/gates/lint-hardcodes.mjs`:
```js
const RAW_HEX = /#[0-9a-fA-F]{3,8}\b/g;
const RAW_PX = /:\s*\d+px/g;
const RAW_PALETTE = /\b(?:bg|text|border)-(?:gray|slate|zinc|red|blue|green|yellow|neutral)-\d{2,3}\b/g;

export function lintHardcodes(src) {
  const findings = [];
  if (RAW_HEX.test(src)) findings.push('raw hex color — use a ui-pes color token utility');
  if (RAW_PALETTE.test(src)) findings.push('raw tailwind palette utility — use a semantic ui-pes token');
  if (RAW_PX.test(src)) findings.push('raw px value — prefer a spacing/radius token utility');
  return findings;
}
```

`scripts/gates/validate-tokens.mjs`:
```js
import { readFileSync } from 'node:fs';

export function validateTokens(src, catalogMd) {
  const known = new Set([...catalogMd.matchAll(/`--([A-Za-z0-9_-]+)`/g)].map((m) => m[1]));
  const findings = [];
  for (const m of src.matchAll(/var\(--([A-Za-z0-9_-]+)/g)) {
    if (!known.has(m[1])) findings.push(`unknown token var(--${m[1]}) not in ds-catalog`);
  }
  return findings;
}

export const loadColorCatalog = () => readFileSync('ds-catalog/color-tokens.md', 'utf8');
```

`scripts/gates/verify-states.mjs`:
```js
export function verifyStates(src) {
  const findings = [];
  const hasNativeButton = /<button\b/.test(src);
  if (hasNativeButton && !/disabled/.test(src)) findings.push('native <button> without disabled handling — use ui-pes Button or add disabled');
  return findings;
}
```

`scripts/gates/lib/scan.mjs`:
```js
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

export function conceptScreens() {
  const root = 'src/concepts';
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter((d) => !d.startsWith('_'))
    .map((d) => path.join(root, d, 'Screen.tsx'))
    .filter(existsSync)
    .map((f) => ({ file: f, src: readFileSync(f, 'utf8') }));
}
```

`scripts/gates/run.mjs`:
```js
import { conceptScreens } from './lib/scan.mjs';
import { lintHardcodes } from './lint-hardcodes.mjs';
import { verifyStates } from './verify-states.mjs';
import { validateTokens, loadColorCatalog } from './validate-tokens.mjs';

const only = process.argv[2];
const catalog = loadColorCatalog();
let failed = false;
for (const { file, src } of conceptScreens()) {
  if (only && !file.includes(only)) continue;
  const findings = [...lintHardcodes(src), ...verifyStates(src), ...validateTokens(src, catalog)];
  if (findings.length) {
    failed = true;
    console.error(`\n✗ ${file}`);
    findings.forEach((f) => console.error(`  - ${f}`));
  } else {
    console.log(`✓ ${file}`);
  }
}
if (failed) process.exit(1);
console.log('\nAll gates passed.');
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run scripts/gates`
Expected: PASS.

- [ ] **Step 5: Run the gate against the seed concept**

Run: `node scripts/gates/run.mjs`
Expected: `✓ src/concepts/documents-empty/Screen.tsx` and `All gates passed.`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(gates): hardcode, token, and state quality gates"
```

---

### Task 8: The `vibe-concept` skill

**Files:**
- Create: `.claude/skills/vibe-concept/SKILL.md`
- Create: `.claude/skills/vibe-concept/references/{intake,ds-catalog,conventions,self-review}.md`

**Interfaces:**
- Consumes: `ds-catalog/`, `product-profiles/`, `brands/`, `scripts/gates/run.mjs`, the concept contract from Task 4, Figma MCP.
- Produces: a discoverable skill that emits a concept folder and passes the gates.

- [ ] **Step 1: Author `SKILL.md` (thin orchestrator)**

`.claude/skills/vibe-concept/SKILL.md` — frontmatter `name: vibe-concept`, description triggering on "build a concept / screen / page from Figma / design / mockup for pdfguru|tbp|pdfleader". Body: the 6-step workflow (intake → pick product → consult catalog → emit 5-file concept → run gates → screenshot self-verify), with a reference table pointing at the four reference files and the HARD RULES (never invent a component; Screen.tsx pure; no hardcoded values; run `node scripts/gates/run.mjs` before declaring done).

- [ ] **Step 2: Author `references/intake.md`**

Figma-URL-via-MCP-preferred → screenshot fallback → structured concept brief (regions, content, states, breakpoints). Adapt anydesign's 5-layer analysis (attribute in VENDOR.md). State the fallback explicitly when MCP is unavailable.

- [ ] **Step 3: Author `references/ds-catalog.md`**

How to read `ds-catalog/*` (overview) → pick components → drill into `node_modules/@universe-forma/ui-pes` source for exact props → map reference styles to token utilities. Restate: never invent; compose + flag gaps.

- [ ] **Step 4: Author `references/conventions.md`**

The 5-file concept contract, typed-props seam, mock fixture, INTEGRATION.md driven by the chosen `product-profiles/*.md`. Borrow copywriting + CSS-specificity discipline from frontend-design (cite, don't copy).

- [ ] **Step 5: Author `references/self-review.md`**

Run the gates; screenshot the sandbox route (`/c/<slug>`); compare to the reference; iterate until it matches; a11y floor (focus-visible, contrast, reduced motion). Definition of done = gates pass + visual match.

- [ ] **Step 6: Baseline + verify with writing-skills**

Follow superpowers:writing-skills: run a baseline subagent scenario (Figma ref + prompt, no skill) and capture failures (invents components, inline dirty data, no typed seam, hardcoded hex); confirm the skill's rules address each; run a with-skill scenario and verify a compliant concept that passes `node scripts/gates/run.mjs`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(skill): vibe-concept orchestrator and references"
```

---

### Task 9: Docs + attribution

**Files:**
- Create/Modify: `README.md`, `VENDOR.md`

**Interfaces:**
- Consumes: everything above.
- Produces: a designer quickstart and third-party attribution.

- [ ] **Step 1: Write `README.md`**

Designer quickstart: prerequisites (Node 20, a `NODE_AUTH_TOKEN` for the ui-pes registry), `npm install`, `npm run dev`, how to invoke the skill (paste Figma URL or drop a screenshot, pick a product), where concepts appear (the gallery), `npm run gate`, and `npm run reindex` (with the optional `PDFGURU_FE`/`TBP_FE`/`PDFLEADER_FE` env paths to refresh profiles + brands).

- [ ] **Step 2: Write `VENDOR.md`**

Attribute `uxKero/anydesign` (MIT) for the CSS-var extraction regex and analysis-framework approach; note that ux-ui-agent-skills and dobzha were studied for concepts only (not copied) because they are unlicensed.

- [ ] **Step 3: Verify the whole pipeline**

Run: `npm run build && npm run test && node scripts/gates/run.mjs`
Expected: build clean, tests pass, gates pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: readme quickstart and vendor attribution"
```

---

## Self-Review

**Spec coverage:** Sandbox (T1–3), concept contract + mock fixtures (T4), ds-catalog (T5), product profiles + brand layer (T2/T6), gates (T7), vibe-concept skill with intake/ds/conventions/self-review + writing-skills authoring (T8), docs + vendor attribution (T9), reindex story (T5/T6 + npm scripts in T1). Brand token layer was added beyond the spec to make per-product previews render correctly — a discovered gap; the spec's "Reindex story" should note brand extraction (minor doc follow-up).

**Placeholder scan:** No "TBD"/"handle edge cases"/"similar to Task N". T6 Step 6 and T8 are content-authoring tasks (profiles / skill prose) whose inputs (8 sections, 6-step workflow, exact rules) are fully specified rather than shown verbatim, since their content is markdown documentation grounded in already-captured analysis, not code.

**Type consistency:** `Brand`, `ConceptEntry`, `listConcepts`, `parseCssVars`, `tailwindUtilFor`, `extractBrandTokens`, `lintHardcodes`, `verifyStates`, `validateTokens` are defined once and referenced consistently across tasks.
