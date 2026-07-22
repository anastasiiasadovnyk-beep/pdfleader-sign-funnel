import type { Flow } from './concepts';

const flows = import.meta.glob('/src/concepts/*/*/flow.ts', { eager: true, import: 'default' }) as Record<string, Flow>;
const pageScreens = import.meta.glob('/src/concepts/*/*/pages/*/Screen.tsx');

test('every flow.ts has a valid start and resolvable next targets', () => {
  for (const [file, flow] of Object.entries(flows)) {
    const slugs = new Set(flow.pages.map((p) => p.slug));
    expect(slugs.has(flow.start), `${file}: start "${flow.start}" not a declared page`).toBe(true);
    for (const p of flow.pages) {
      const nexts = p.next ? (Array.isArray(p.next) ? p.next : [p.next]) : [];
      for (const n of nexts) {
        expect(slugs.has(n), `${file}: page "${p.slug}" next "${n}" not a declared page`).toBe(true);
      }
    }
  }
});

test('every flow.ts declared page slug has a matching page Screen folder', () => {
  for (const [file, flow] of Object.entries(flows)) {
    const prefix = file.slice(0, file.lastIndexOf('flow.ts'));
    for (const p of flow.pages) {
      const key = `${prefix}pages/${p.slug}/Screen.tsx`;
      expect(key in pageScreens, `${file}: page "${p.slug}" has no ${key}`).toBe(true);
    }
  }
});
