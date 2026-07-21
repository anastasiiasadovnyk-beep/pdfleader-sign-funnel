import { extractBrandTokens } from './extract-brand.mjs';

test('collects color/font token values from css sources', () => {
  const tokens = extractBrandTokens([':root{ --color-primary:#0097db; --font-primary:Montserrat; --ignore-me:1px; }']);
  expect(tokens['--color-primary']).toBe('#0097db');
  expect(tokens['--font-primary']).toBe('Montserrat');
  expect(tokens['--ignore-me']).toBeUndefined();
});
