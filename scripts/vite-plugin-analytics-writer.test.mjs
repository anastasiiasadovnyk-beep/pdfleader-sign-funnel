import path from 'node:path';
import { resolveConceptPath } from './vite-plugin-analytics-writer.mjs';

const root = '/repo';

test('valid product + slug resolves inside src/concepts', () => {
  expect(resolveConceptPath(root, 'pdfguru', 'funnel')).toBe(
    path.join(root, 'src/concepts/pdfguru/funnel/analytics.json'),
  );
});

test('rejects unknown product', () => {
  expect(resolveConceptPath(root, 'evil', 'funnel')).toBe(null);
});

test('rejects path traversal in slug', () => {
  expect(resolveConceptPath(root, 'pdfguru', '../../etc')).toBe(null);
  expect(resolveConceptPath(root, 'pdfguru', 'a/b')).toBe(null);
});
