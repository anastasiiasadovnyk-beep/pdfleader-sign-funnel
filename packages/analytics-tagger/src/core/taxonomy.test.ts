import { TRIGGERS, triggerById, triggersByCategory, PROPERTY_KEYS, PROPERTY_VALUES, CATEGORIES } from './taxonomy';

test('covers all 7 categories with multiple triggers', () => {
  expect(CATEGORIES).toEqual(['interaction', 'form', 'visibility', 'navigation', 'media', 'content', 'custom']);
  for (const c of CATEGORIES) expect(triggersByCategory(c).length).toBeGreaterThan(0);
  expect(TRIGGERS.length).toBeGreaterThanOrEqual(25);
});
test('core pdfguru suffixes present and correct', () => {
  expect(triggerById('click')!.suffix).toBe('tap');
  expect(triggerById('page_view')!.suffix).toBe('view');
  expect(triggerById('input_change')!.suffix).toBe('change');
  expect(triggerById('validation_error')!.suffix).toBe('status');
});
test('page_view needs no element; click needs element', () => {
  expect(triggerById('page_view')!.needsElement).toBe(false);
  expect(triggerById('click')!.needsElement).toBe(true);
});
test('property presets exclude auto-attached and include pdfguru vocab', () => {
  for (const k of ['method', 'status', 'place', 'funnel', 'file_format', 'source', 'features_name']) expect(PROPERTY_KEYS).toContain(k);
  for (const k of ['page', 'device', 'ab_test', 'orientation', 'version', 'userAgent']) expect(PROPERTY_KEYS).not.toContain(k);
  expect(PROPERTY_VALUES.method).toContain('drag_and_drop');
  expect(PROPERTY_VALUES.status).toContain('success');
  expect(PROPERTY_VALUES.funnel).toContain('merge_pdf');
});
