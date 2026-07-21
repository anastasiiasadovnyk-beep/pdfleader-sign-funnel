import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { PRODUCTS } from './lib/product-config.mjs';
import { extractBrandTokens } from './lib/extract-brand.mjs';

mkdirSync('brands', { recursive: true });
for (const p of PRODUCTS) {
  if (!existsSync(p.repoPath)) { console.warn(`reindex-products: ${p.key} repo not found at ${p.repoPath}; keeping committed brand + profile`); continue; }
  const sources = p.brandGlobs
    .map((g) => path.join(p.repoPath, g))
    .filter(existsSync)
    .map((f) => readFileSync(f, 'utf8'));
  const tokens = extractBrandTokens(sources);
  if (Object.keys(tokens).length) {
    const body = Object.entries(tokens).map(([k, v]) => `  ${k}: ${v};`).join('\n');
    writeFileSync(`brands/${p.key}.css`, `[data-brand='${p.key}'] {\n${body}\n}\n`);
    console.log(`reindex-products: wrote brands/${p.key}.css (${Object.keys(tokens).length} tokens)`);
  }
}
console.log('reindex-products: product-profiles/*.md are maintained from codebase analysis; edit via profiling agents.');
