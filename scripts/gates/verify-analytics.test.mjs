import { scanInteractive, analyzeConcept } from './verify-analytics.mjs';

test('scanInteractive finds ui-pes + native interactives with labels', () => {
  const src = `
    <Button onClick={onNext}>Choose file</Button>
    <button type="button">Skip</button>
    <Input placeholder="Email" />
  `;
  const found = scanInteractive(src);
  expect(found.some((f) => f.label === 'Choose file')).toBe(true);
  expect(found.some((f) => f.label === 'Skip')).toBe(true);
  expect(found.some((f) => f.type === 'Input')).toBe(true);
});

test('analyzeConcept flags invalid names as errors', () => {
  const spec = { version: 1, product: 'p', concept: 'c', events: [
    { id: 'evt_1', page: 'screen', trigger: 'click', event: 'BadName', data: {}, notes: '' },
  ] };
  const { errors } = analyzeConcept(spec, [{ slug: 'screen', interactives: [] }]);
  expect(errors.some((e) => e.includes('BadName'))).toBe(true);
});

test('analyzeConcept warns on missing page_load and untagged elements', () => {
  const spec = { version: 1, product: 'p', concept: 'c', events: [] };
  const { warnings } = analyzeConcept(spec, [{ slug: 'screen', interactives: [{ type: 'Button', label: 'Go' }] }]);
  expect(warnings.some((w) => w.includes('page_load'))).toBe(true);
  expect(warnings.some((w) => w.includes('Go'))).toBe(true);
});

test('analyzeConcept: null spec warns not-tagged', () => {
  const { warnings } = analyzeConcept(null, [{ slug: 'screen', interactives: [] }]);
  expect(warnings.some((w) => w.includes('no analytics'))).toBe(true);
});
