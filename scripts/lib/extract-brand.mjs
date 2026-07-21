import { parseCssVars } from './css-tokens.mjs';

export function extractBrandTokens(cssSources) {
  const tokens = {};
  for (const css of cssSources) {
    for (const v of parseCssVars(css)) {
      if (!v.value.startsWith('var(')) tokens[`--${v.name}`] = v.value;
    }
  }
  return tokens;
}
