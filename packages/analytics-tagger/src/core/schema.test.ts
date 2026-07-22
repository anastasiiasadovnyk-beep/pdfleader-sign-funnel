import { emptySpec, upsertEvent, removeEvent, nextEventId, migrateV1, coerceSpec } from './schema';

test('emptySpec is v2', () => {
  expect(emptySpec('pdfguru', 'funnel')).toEqual({ version: 2, product: 'pdfguru', concept: 'funnel', events: [] });
});
test('upsert/remove/nextId', () => {
  let s = emptySpec('pdfguru', 'f');
  expect(nextEventId(s)).toBe('evt_1');
  s = upsertEvent(s, { id: 'evt_1', page: 'a', category: 'interaction', trigger: 'click', event: 'x_tap', data: {}, notes: '' });
  expect(s.events).toHaveLength(1);
  expect(nextEventId(s)).toBe('evt_2');
  s = upsertEvent(s, { id: 'evt_1', page: 'a', category: 'interaction', trigger: 'click', event: 'y_tap', data: {}, notes: '' });
  expect(s.events[0].event).toBe('y_tap');
  s = removeEvent(s, 'evt_1');
  expect(s.events).toHaveLength(0);
});
test('migrateV1 maps triggers and element', () => {
  const v1 = { version: 1, product: 'pdfguru', concept: 'f', events: [
    { id: 'evt_1', page: 'a', trigger: 'click', event: 'x_tap', data: { method: 'click' },
      element: { tag: 'button', role: null, label: 'Go', occurrence: 0 }, notes: '' },
    { id: 'evt_2', page: 'a', trigger: 'page_load', event: 'a_view', data: {}, notes: '' },
  ] };
  const v2 = migrateV1(v1 as any);
  expect(v2.version).toBe(2);
  expect(v2.events[0]).toMatchObject({ category: 'interaction', trigger: 'click', event: 'x_tap' });
  expect(v2.events[0].element).toMatchObject({ selector: '', tag: 'button', role: null, label: 'Go' });
  expect(v2.events[1]).toMatchObject({ category: 'navigation', trigger: 'page_view' });
});
test('coerceSpec passes v2 through and migrates v1', () => {
  const v2 = emptySpec('tbp', 'x');
  expect(coerceSpec(v2)).toBe(v2);
  expect(coerceSpec({ version: 1, product: 'tbp', concept: 'x', events: [] } as any).version).toBe(2);
});
