import { parseCssVars } from './css-tokens.mjs';

const KEEP = /^(color-|font-|radius-|shadow-)/;

export function extractBrandTokens(cssSources) {
  const tokens = {};
  for (const css of cssSources) {
    for (const v of parseCssVars(css)) {
      if (KEEP.test(v.name) && !v.value.startsWith('var(')) tokens[`--${v.name}`] = v.value;
    }
  }
  return tokens;
}
