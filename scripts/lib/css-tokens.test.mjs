import { parseCssVars, tailwindUtilFor } from './css-tokens.mjs';

test('parses css custom properties and categorizes', () => {
  const css = ':root{ --color-primary: #fff; --radius-2: 0.5rem; --spacing-4: 16px; }';
  const vars = parseCssVars(css);
  expect(vars.find((v) => v.name === 'color-primary')?.category).toBe('color');
  expect(vars.find((v) => v.name === 'radius-2')?.category).toBe('radius');
});

test('maps color token to tailwind utility hint', () => {
  expect(tailwindUtilFor('color-primary')).toBe('bg-primary / text-primary / border-primary');
  expect(tailwindUtilFor('radius-2')).toBe('rounded-2');
});
