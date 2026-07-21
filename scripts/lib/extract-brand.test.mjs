import { extractBrandTokens } from './extract-brand.mjs';

test('collects all concrete token values, skips var() placeholders', () => {
  const tokens = extractBrandTokens([
    ':root{ --color-primary:#0097db; --spacing-btn-md-vertical-padding:0.75rem; --placeholder:var(--placeholder); }',
  ]);
  expect(tokens['--color-primary']).toBe('#0097db');
  expect(tokens['--spacing-btn-md-vertical-padding']).toBe('0.75rem');
  expect(tokens['--placeholder']).toBeUndefined();
});
