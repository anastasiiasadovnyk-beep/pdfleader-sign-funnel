import { createServer } from 'vite';
import { chromium } from 'playwright';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const [product, slug] = process.argv.slice(2);
if (!product || !slug) {
  console.error('usage: node scripts/fidelity/run.mjs <product> <slug>');
  process.exit(2);
}

const conceptDir = `src/concepts/${product}/${slug}`;
if (!existsSync(conceptDir)) {
  console.error(`no concept at ${conceptDir}`);
  process.exit(2);
}

const specPath = path.join(conceptDir, 'design-spec.json');
const spec = existsSync(specPath) ? JSON.parse(readFileSync(specPath, 'utf8')) : null;
const viewports = spec?.viewports ?? { desktop: { w: 1440, h: 900 } };

const DEFAULT_TOL = { width: 2, height: 4, fontSize: 1, fontWeight: 0, borderRadius: 1, gap: 2, padding: 2 };
const numeric = (v) => typeof v === 'number';

const server = await createServer({ server: { port: 0 }, logLevel: 'error' });
await server.listen();
const base = server.resolvedUrls.local[0].replace(/\/$/, '');
const browser = await chromium.launch({ channel: 'chrome' });
const outDir = path.join(conceptDir, '.fidelity');
mkdirSync(outDir, { recursive: true });

const failures = [];
for (const [vpName, vp] of Object.entries(viewports)) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 2 });
  await page.goto(`${base}/preview/${product}/${slug}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outDir, `${vpName}.png`) });

  for (const r of (spec?.regions ?? []).filter((r) => !r.viewport || r.viewport === vpName)) {
    const measured = await page.evaluate((ff) => {
      const el = document.querySelector(`[data-ff="${ff}"]`);
      if (!el) return null;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const px = (v) => Math.round(parseFloat(v));
      return {
        width: Math.round(rect.width), height: Math.round(rect.height),
        fontFamily: cs.fontFamily.split(',')[0].replace(/["']/g, ''),
        fontSize: px(cs.fontSize), fontWeight: Number(cs.fontWeight),
        borderRadius: px(cs.borderTopLeftRadius), textTransform: cs.textTransform,
        gap: px(cs.gap) || 0, padding: px(cs.paddingLeft),
      };
    }, r.ff);
    if (!measured) { failures.push(`[${vpName}] region "${r.ff}" not found — add data-ff="${r.ff}" in the concept`); continue; }
    for (const [prop, want] of Object.entries(r.assert)) {
      const got = measured[prop];
      const ok = numeric(want)
        ? Math.abs(got - want) <= (r.tol?.[prop] ?? DEFAULT_TOL[prop] ?? 1)
        : String(got).toLowerCase().includes(String(want).toLowerCase());
      if (!ok) failures.push(`[${vpName}] ${r.ff}.${prop}: design=${want} built=${got}`);
    }
  }
  await page.close();
}
await browser.close();
await server.close();

console.log(`fidelity: screenshots → ${outDir}/`);
if (!spec) {
  console.log('no design-spec.json — screenshot only. Add one to enable computed-style assertions.');
  process.exit(0);
}
if (failures.length) {
  console.error(`\n✗ ${failures.length} fidelity delta(s):`);
  failures.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log(`✓ all ${spec.regions?.length ?? 0} fidelity assertions passed across ${Object.keys(viewports).length} viewport(s)`);
