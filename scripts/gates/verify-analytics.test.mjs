import { analyzeConcept } from './verify-analytics.mjs';

test('null spec warns not-tagged', () => {
  const { warnings, errors } = analyzeConcept(null, [{ slug: 'screen' }]);
  expect(warnings.some((w) => w.includes('no analytics'))).toBe(true);
  expect(errors).toEqual([]);
});
test('invalid event name is an error (v1 or v2)', () => {
  const spec = { version: 2, product: 'p', concept: 'c', events: [
    { id: 'e', page: 'screen', category: 'interaction', trigger: 'click', event: 'BadName', data: {}, notes: '' },
  ] };
  expect(analyzeConcept(spec, [{ slug: 'screen' }]).errors.some((e) => e.includes('BadName'))).toBe(true);
});
test('page with no page-view event warns', () => {
  const spec = { version: 2, product: 'p', concept: 'c', events: [
    { id: 'e', page: 'screen', category: 'interaction', trigger: 'click', event: 'x_tap', data: {}, notes: '' },
  ] };
  expect(analyzeConcept(spec, [{ slug: 'screen' }]).warnings.some((w) => w.includes('page-view'))).toBe(true);
});
test('valid tagged page passes clean', () => {
  const spec = { version: 2, product: 'p', concept: 'c', events: [
    { id: 'e', page: 'screen', category: 'navigation', trigger: 'page_view', event: 'screen_view', data: {}, notes: '' },
  ] };
  const { warnings, errors } = analyzeConcept(spec, [{ slug: 'screen' }]);
  expect(errors).toEqual([]);
  expect(warnings).toEqual([]);
});
