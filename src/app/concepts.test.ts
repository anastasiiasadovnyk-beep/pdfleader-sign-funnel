import { listConcepts } from './concepts';

test('builds concept entries keyed by product/slug from depth-2 globs', () => {
  const screens = { '/src/concepts/tbp/demo/Screen.tsx': () => Promise.resolve({ default: () => null }) };
  const metas = { '/src/concepts/tbp/demo/meta.ts': { title: 'Demo' } };
  const mocks = { '/src/concepts/tbp/demo/mock.ts': () => Promise.resolve({ default: {} }) };
  const entries = listConcepts(screens as any, metas as any, mocks as any);
  expect(entries).toHaveLength(1);
  expect(entries[0]).toMatchObject({ product: 'tbp', slug: 'demo', title: 'Demo', brand: 'tbp' });
});
