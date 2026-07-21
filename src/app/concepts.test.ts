import { listConcepts } from './concepts';

test('builds concept entries from screen + meta globs', () => {
  const screens = { '/src/concepts/demo/Screen.tsx': () => Promise.resolve({ default: () => null }) };
  const metas = { '/src/concepts/demo/meta.ts': { title: 'Demo', brand: 'tbp' } };
  const mocks = { '/src/concepts/demo/mock.ts': () => Promise.resolve({ default: {} }) };
  const entries = listConcepts(screens as any, metas as any, mocks as any);
  expect(entries).toHaveLength(1);
  expect(entries[0]).toMatchObject({ slug: 'demo', title: 'Demo', brand: 'tbp' });
});
