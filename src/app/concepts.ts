import type { ComponentType } from 'react';
import type { Brand } from './BrandProvider';

export type ConceptMeta = { title: string };
export type ConceptEntry = {
  product: Brand;
  slug: string;
  title: string;
  brand: Brand;
  load: () => Promise<{ default: ComponentType<any> }>;
  loadMock: () => Promise<{ default: unknown }>;
};

// path: /src/concepts/<product>/<slug>/Screen.tsx
const partsOf = (p: string) => p.split('/');
const productOf = (p: string) => partsOf(p).slice(-3, -2)[0] as Brand;
const slugOf = (p: string) => partsOf(p).slice(-2, -1)[0];

export function listConcepts(
  screens: Record<string, () => Promise<{ default: ComponentType<any> }>>,
  metas: Record<string, ConceptMeta>,
  mocks: Record<string, () => Promise<{ default: unknown }>>,
): ConceptEntry[] {
  return Object.keys(screens)
    .filter((p) => !productOf(p).startsWith('_'))
    .map((p) => {
      const product = productOf(p);
      const slug = slugOf(p);
      const metaKey = Object.keys(metas).find((m) => slugOf(m) === slug && productOf(m) === product);
      const mockKey = Object.keys(mocks).find((m) => slugOf(m) === slug && productOf(m) === product);
      return {
        product,
        slug,
        title: metas[metaKey!]?.title ?? slug,
        brand: product,
        load: screens[p],
        loadMock: mocks[mockKey!],
      };
    });
}

export const conceptEntries = () =>
  listConcepts(
    import.meta.glob<{ default: ComponentType<any> }>('/src/concepts/*/*/Screen.tsx'),
    import.meta.glob('/src/concepts/*/*/meta.ts', { eager: true, import: 'default' }) as Record<string, ConceptMeta>,
    import.meta.glob<{ default: unknown }>('/src/concepts/*/*/mock.ts'),
  );
