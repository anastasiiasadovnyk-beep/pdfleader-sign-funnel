import { isSnakeCase, suffixFor, deriveEventName, renderAmplitudeCall, renderTrackingPlan } from './naming';

test('isSnakeCase', () => {
  expect(isSnakeCase('file_upload_status')).toBe(true);
  expect(isSnakeCase('Bad')).toBe(false);
  expect(isSnakeCase('')).toBe(false);
});
test('suffixFor + deriveEventName by trigger', () => {
  expect(suffixFor('click')).toBe('tap');
  expect(deriveEventName('Upload PDF', 'click')).toBe('upload_pdf_tap');
  expect(deriveEventName('Home', 'page_view')).toBe('home_view');
  expect(deriveEventName('Email', 'input_change')).toBe('email_change');
});
test('deriveEventName custom trigger drops suffix', () => {
  expect(deriveEventName('File chosen', 'custom')).toBe('file_chosen');
});
test('renderAmplitudeCall', () => {
  expect(renderAmplitudeCall({ id: 'e', page: 'a', category: 'interaction', trigger: 'click', event: 'x_tap', data: {}, notes: '' }))
    .toBe("dispatch(sendAnalyticEvent({ event: 'x_tap' }))");
  expect(renderAmplitudeCall({ id: 'e', page: 'a', category: 'interaction', trigger: 'click', event: 'x_tap', data: { method: 'click' }, notes: '' }))
    .toBe("dispatch(sendAnalyticEvent({ event: 'x_tap', data: { method: 'click' } }))");
});
test('renderTrackingPlan lists events with page and event columns', () => {
  const plan = renderTrackingPlan({ version: 2, product: 'pdfguru', concept: 'f', events: [
    { id: 'e', page: 'a', category: 'interaction', trigger: 'click', event: 'x_tap', data: { method: 'click' }, notes: '' },
  ] });
  expect(plan).toContain('x_tap');
  expect(plan).toContain('a');
  expect(plan).toContain('click');
});
