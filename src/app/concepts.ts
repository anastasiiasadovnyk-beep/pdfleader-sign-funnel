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
  return Object.keys(screens)
    .filter((path) => !slugOf(path).startsWith('_'))
    .map((path) => {
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
    import.meta.glob<{ default: ComponentType<any> }>('/src/concepts/*/Screen.tsx'),
    import.meta.glob('/src/concepts/*/meta.ts', { eager: true, import: 'default' }) as Record<string, ConceptMeta>,
    import.meta.glob<{ default: unknown }>('/src/concepts/*/mock.ts'),
  );
