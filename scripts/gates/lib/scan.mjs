import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';

function walkTsx(dir, out) {
  for (const e of readdirSync(dir)) {
    const full = path.join(dir, e);
    if (statSync(full).isDirectory()) walkTsx(full, out);
    else if (e.endsWith('.tsx') && !e.endsWith('.test.tsx')) out.push(full);
  }
}

export function conceptScreens() {
  const root = 'src/concepts';
  if (!existsSync(root)) return [];
  const out = [];
  for (const product of readdirSync(root)) {
    if (product.startsWith('_')) continue;
    const productDir = path.join(root, product);
    if (!statSync(productDir).isDirectory()) continue;
    walkTsx(productDir, out);
  }
  return out.map((f) => ({ file: f, src: readFileSync(f, 'utf8') }));
}
