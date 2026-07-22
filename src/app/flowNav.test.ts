import { resolvePage, nextTargets, prevSlug, pageIndex, pageCount } from './flowNav';
import type { Flow } from './concepts';

const flow: Flow = { start: 'a', pages: [
  { slug: 'a', title: 'A', next: 'b' },
  { slug: 'b', title: 'B', next: ['c', 'a'] },
  { slug: 'c', title: 'C' },
] };

test('resolvePage falls back to start for missing/unknown param', () => {
  expect(resolvePage(flow)).toBe('a');
  expect(resolvePage(flow, 'zzz')).toBe('a');
  expect(resolvePage(flow, 'b')).toBe('b');
});
test('nextTargets normalizes to array', () => {
  expect(nextTargets(flow, 'a')).toEqual(['b']);
  expect(nextTargets(flow, 'b')).toEqual(['c', 'a']);
  expect(nextTargets(flow, 'c')).toEqual([]);
});
test('prevSlug returns previous page in declared order', () => {
  expect(prevSlug(flow, 'a')).toBeNull();
  expect(prevSlug(flow, 'b')).toBe('a');
  expect(prevSlug(flow, 'c')).toBe('b');
});
test('index and count', () => {
  expect(pageIndex(flow, 'b')).toBe(1);
  expect(pageCount(flow)).toBe(3);
});
