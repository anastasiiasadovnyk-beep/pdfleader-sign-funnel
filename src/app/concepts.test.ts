import { listConcepts } from './concepts';

test('builds concept entries keyed by product/slug from depth-2 globs', () => {
  const screens = { '/src/concepts/tbp/demo/Screen.tsx': () => Promise.resolve({ default: () => null }) };
  const metas = { '/src/concepts/tbp/demo/meta.ts': { title: 'Demo' } };
  const mocks = { '/src/concepts/tbp/demo/mock.ts': () => Promise.resolve({ default: {} }) };
  const entries = listConcepts(screens as any, metas as any, mocks as any);
  expect(entries).toHaveLength(1);
  expect(entries[0]).toMatchObject({ product: 'tbp', slug: 'demo', title: 'Demo', brand: 'tbp' });
});

test('single-page entry has kind "single"', () => {
  const screens = { '/src/concepts/tbp/demo/Screen.tsx': () => Promise.resolve({ default: () => null }) };
  const metas = { '/src/concepts/tbp/demo/meta.ts': { title: 'Demo' } };
  const mocks = { '/src/concepts/tbp/demo/mock.ts': () => Promise.resolve({ default: {} }) };
  const [entry] = listConcepts(screens as any, metas as any, mocks as any);
  expect(entry.kind).toBe('single');
});

test('builds a multipage entry from flow + page globs', () => {
  const flows = { '/src/concepts/pdfguru/funnel/flow.ts': { start: 'a', pages: [
    { slug: 'a', title: 'Step A', next: 'b' }, { slug: 'b', title: 'Step B' },
  ] } };
  const metas = { '/src/concepts/pdfguru/funnel/meta.ts': { title: 'Funnel' } };
  const pageScreens = {
    '/src/concepts/pdfguru/funnel/pages/a/Screen.tsx': () => Promise.resolve({ default: () => null }),
    '/src/concepts/pdfguru/funnel/pages/b/Screen.tsx': () => Promise.resolve({ default: () => null }),
  };
  const pageMocks = {
    '/src/concepts/pdfguru/funnel/pages/a/mock.ts': () => Promise.resolve({ default: {} }),
    '/src/concepts/pdfguru/funnel/pages/b/mock.ts': () => Promise.resolve({ default: {} }),
  };
  const [entry] = listConcepts({} as any, metas as any, {} as any, flows as any, pageScreens as any, pageMocks as any);
  expect(entry).toMatchObject({ product: 'pdfguru', slug: 'funnel', kind: 'multi', title: 'Funnel' });
  expect(entry.pages?.map((p) => p.slug)).toEqual(['a', 'b']);
  expect(entry.flow?.start).toBe('a');
  expect(entry.pages?.[0].next).toBe('b');
});
