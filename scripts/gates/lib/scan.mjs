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

export function conceptDirs() {
  const root = 'src/concepts';
  if (!existsSync(root)) return [];
  const out = [];
  for (const product of readdirSync(root)) {
    if (product.startsWith('_')) continue;
    const productDir = path.join(root, product);
    if (!statSync(productDir).isDirectory()) continue;
    for (const slug of readdirSync(productDir)) {
      const dir = path.join(productDir, slug);
      if (statSync(dir).isDirectory()) out.push({ dir, product, slug });
    }
  }
  return out;
}

export function conceptPages(dir) {
  const flowPath = path.join(dir, 'flow.ts');
  if (!existsSync(flowPath)) {
    const screen = path.join(dir, 'Screen.tsx');
    return { multi: false, pages: existsSync(screen) ? [{ slug: 'screen', screen }] : [] };
  }
  const pagesDir = path.join(dir, 'pages');
  if (!existsSync(pagesDir)) return { multi: true, pages: [] };
  const pages = readdirSync(pagesDir)
    .filter((n) => statSync(path.join(pagesDir, n)).isDirectory())
    .map((slug) => ({ slug, screen: path.join(pagesDir, slug, 'Screen.tsx') }))
    .filter((p) => existsSync(p.screen));
  return { multi: true, pages };
}
