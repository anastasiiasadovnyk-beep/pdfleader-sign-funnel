import { emptySpec, upsertEvent, removeEvent, nextEventId } from './schema';

test('emptySpec shape', () => {
  expect(emptySpec('pdfguru', 'funnel')).toEqual({ version: 1, product: 'pdfguru', concept: 'funnel', events: [] });
});
test('upsertEvent adds then replaces by id', () => {
  let s = emptySpec('pdfguru', 'funnel');
  s = upsertEvent(s, { id: 'evt_1', page: 'a', trigger: 'click', event: 'x_tap', data: {}, notes: '' });
  expect(s.events).toHaveLength(1);
  s = upsertEvent(s, { id: 'evt_1', page: 'a', trigger: 'click', event: 'y_tap', data: {}, notes: '' });
  expect(s.events).toHaveLength(1);
  expect(s.events[0].event).toBe('y_tap');
});
test('removeEvent + nextEventId', () => {
  let s = emptySpec('pdfguru', 'funnel');
  expect(nextEventId(s)).toBe('evt_1');
  s = upsertEvent(s, { id: 'evt_1', page: 'a', trigger: 'click', event: 'x_tap', data: {}, notes: '' });
  expect(nextEventId(s)).toBe('evt_2');
  s = removeEvent(s, 'evt_1');
  expect(s.events).toHaveLength(0);
});
