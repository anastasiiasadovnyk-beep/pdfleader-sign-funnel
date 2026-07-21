import { readFileSync } from 'node:fs';

export function validateTokens(src, catalogMd) {
  const known = new Set([...catalogMd.matchAll(/`--([A-Za-z0-9_-]+)`/g)].map((m) => m[1]));
  const findings = [];
  for (const m of src.matchAll(/var\(--([A-Za-z0-9_-]+)/g)) {
    if (!known.has(m[1])) findings.push(`unknown token var(--${m[1]}) not in ds-catalog`);
  }
  return findings;
}

export const loadColorCatalog = () => readFileSync('ds-catalog/color-tokens.md', 'utf8');
