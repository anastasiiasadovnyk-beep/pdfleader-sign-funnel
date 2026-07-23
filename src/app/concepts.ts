import type { ComponentType } from 'react';
import type { Brand } from './BrandProvider';

export type ConceptMeta = { title: string };
export type FlowPage = { slug: string; title: string; next?: string | string[] };
export type Flow = { start: string; pages: FlowPage[] };
export type PageEntry = {
  slug: string;
  title: string;
  next?: string | string[];
  load: () => Promise<{ default: ComponentType<any> }>;
  loadMock: () => Promise<Record<string, unknown>>;
};
export type ConceptEntry = {
  product: Brand;
  slug: string;
  title: string;
  brand: Brand;
  kind: 'single' | 'multi';
  load: () => Promise<{ default: ComponentType<any> }>;
  loadMock: () => Promise<Record<string, unknown>>;
  flow?: Flow;
  pages?: PageEntry[];
};

const partsOf = (p: string) => p.split('/');
const productOf = (p: string) => partsOf(p).slice(-3, -2)[0] as Brand;
const slugOf = (p: string) => partsOf(p).slice(-2, -1)[0];
// page path: /src/concepts/<product>/<slug>/pages/<page>/Screen.tsx
const pageProductOf = (p: string) => partsOf(p).slice(-5, -4)[0] as Brand;
const pageConceptOf = (p: string) => partsOf(p).slice(-4, -3)[0];
const pageNameOf = (p: string) => partsOf(p).slice(-2, -1)[0];

export function listConcepts(
  screens: Record<string, () => Promise<{ default: ComponentType<any> }>>,
  metas: Record<string, ConceptMeta>,
  mocks: Record<string, () => Promise<Record<string, unknown>>>,
  flows: Record<string, Flow> = {},
  pageScreens: Record<string, () => Promise<{ default: ComponentType<any> }>> = {},
  pageMocks: Record<string, () => Promise<Record<string, unknown>>> = {},
): ConceptEntry[] {
  const titleFor = (product: Brand, slug: string) => {
    const key = Object.keys(metas).find((m) => slugOf(m) === slug && productOf(m) === product);
    return metas[key!]?.title ?? slug;
  };

  const single: ConceptEntry[] = Object.keys(screens)
    .filter((p) => !productOf(p).startsWith('_'))
    .map((p) => {
      const product = productOf(p);
      const slug = slugOf(p);
      const mockKey = Object.keys(mocks).find((m) => slugOf(m) === slug && productOf(m) === product);
      return {
        product,
        slug,
        title: titleFor(product, slug),
        brand: product,
        kind: 'single' as const,
        load: screens[p],
        loadMock: mocks[mockKey!],
      };
    });

  const multi: ConceptEntry[] = Object.keys(flows)
    .filter((p) => !productOf(p).startsWith('_'))
    .map((p) => {
      const product = productOf(p);
      const slug = slugOf(p);
      const flow = flows[p];
      const pages: PageEntry[] = flow.pages.map((fp) => {
        const screenKey = Object.keys(pageScreens).find(
          (s) => pageProductOf(s) === product && pageConceptOf(s) === slug && pageNameOf(s) === fp.slug,
        );
        const mockKey = Object.keys(pageMocks).find(
          (m) => pageProductOf(m) === product && pageConceptOf(m) === slug && pageNameOf(m) === fp.slug,
        );
        return { slug: fp.slug, title: fp.title, next: fp.next, load: pageScreens[screenKey!], loadMock: pageMocks[mockKey!] };
      });
      const start = pages.find((pg) => pg.slug === flow.start) ?? pages[0];
      return {
        product,
        slug,
        title: titleFor(product, slug),
        brand: product,
        kind: 'multi' as const,
        load: start.load,
        loadMock: start.loadMock,
        flow,
        pages,
      };
    });

  return [...single, ...multi];
}

export const conceptEntries = () =>
  listConcepts(
    import.meta.glob<{ default: ComponentType<any> }>('/src/concepts/*/*/Screen.tsx'),
    import.meta.glob('/src/concepts/*/*/meta.ts', { eager: true, import: 'default' }) as Record<string, ConceptMeta>,
    import.meta.glob<Record<string, unknown>>('/src/concepts/*/*/mock.ts'),
    import.meta.glob('/src/concepts/*/*/flow.ts', { eager: true, import: 'default' }) as Record<string, Flow>,
    import.meta.glob<{ default: ComponentType<any> }>('/src/concepts/*/*/pages/*/Screen.tsx'),
    import.meta.glob<Record<string, unknown>>('/src/concepts/*/*/pages/*/mock.ts'),
  );
