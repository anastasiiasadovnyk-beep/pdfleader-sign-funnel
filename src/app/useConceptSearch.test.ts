import { filterConcepts } from './useConceptSearch';

const E = (product: string, slug: string, title: string) => ({
  product,
  slug,
  title,
  brand: product,
  kind: 'single' as const,
  load: async () => ({ default: () => null }),
  loadMock: async () => ({ default: {} }),
});

const entries = [
  E('pdfguru', 'documents-empty', 'Documents — empty'),
  E('tbp', 'ui-pes-showcase', 'UI-PES showcase'),
  E('pdfleader', 'document-detail', 'Document detail'),
] as any;

test('empty query returns all', () => {
  expect(filterConcepts(entries, '').length).toBe(3);
});

test('matches title/slug/product case-insensitively', () => {
  expect(filterConcepts(entries, 'document').map((e) => e.slug)).toContain('documents-empty');
  expect(filterConcepts(entries, 'document').map((e) => e.slug)).toContain('document-detail');
  expect(filterConcepts(entries, 'TBP').map((e) => e.product)).toEqual(['tbp']);
  expect(filterConcepts(entries, 'showcase')[0].slug).toBe('ui-pes-showcase');
});

test('no match returns empty', () => {
  expect(filterConcepts(entries, 'zzzzz')).toEqual([]);
});
