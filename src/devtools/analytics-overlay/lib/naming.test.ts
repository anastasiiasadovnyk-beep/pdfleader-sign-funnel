import { isSnakeCase, suggestSuffix, deriveEventName, renderAmplitudeCall } from './naming';

test('isSnakeCase', () => {
  expect(isSnakeCase('file_upload_status')).toBe(true);
  expect(isSnakeCase('FileUpload')).toBe(false);
  expect(isSnakeCase('')).toBe(false);
  expect(isSnakeCase('_x')).toBe(false);
  expect(isSnakeCase('x__y')).toBe(false);
});
test('suggestSuffix', () => {
  expect(suggestSuffix('click')).toBe('tap');
  expect(suggestSuffix('page_load')).toBe('view');
  expect(suggestSuffix('input_change')).toBe('change');
});
test('deriveEventName from label + trigger', () => {
  expect(deriveEventName('Upload PDF', 'click')).toBe('upload_pdf_tap');
  expect(deriveEventName('Select plan', 'page_load')).toBe('select_plan_view');
});
test('renderAmplitudeCall with and without data', () => {
  expect(renderAmplitudeCall({ id: 'evt_1', page: 'a', trigger: 'click', event: 'x_tap', data: {}, notes: '' }))
    .toBe("dispatch(sendAnalyticEvent({ event: 'x_tap' }))");
  expect(renderAmplitudeCall({ id: 'evt_1', page: 'a', trigger: 'click', event: 'x_tap', data: { method: 'click' }, notes: '' }))
    .toBe("dispatch(sendAnalyticEvent({ event: 'x_tap', data: { method: 'click' } }))");
});
