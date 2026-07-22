import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { conceptDirs, conceptPages } from './lib/scan.mjs';

const SNAKE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
const TAGS = ['Button', 'IconButton', 'Input', 'Switch', 'Search', 'Tabs', 'button', 'a', 'input', 'select', 'textarea'];

export function scanInteractive(src) {
  const out = [];
  for (const tag of TAGS) {
    const re = new RegExp(`<${tag}(\\s[^>]*?)?(/?)>([^<]*)`, 'g');
    let m;
    while ((m = re.exec(src))) {
      const inner = (m[3] || '').trim();
      const aria = /aria-label=["']([^"']+)["']/.exec(m[1] || '');
      const ph = /placeholder=["']([^"']+)["']/.exec(m[1] || '');
      out.push({ type: tag, label: (aria?.[1] || inner || ph?.[1] || '').trim().slice(0, 60) });
    }
  }
  return out.filter((f) => f.type[0] === f.type[0].toUpperCase() || f.label);
}

export function analyzeConcept(spec, pages) {
  const warnings = [];
  const errors = [];
  if (!spec) {
    warnings.push('no analytics tagged (no analytics.json)');
    return { warnings, errors };
  }
  for (const e of spec.events) {
    if (!SNAKE.test(e.event)) errors.push(`invalid event name (must be snake_case): "${e.event}"`);
  }
  for (const page of pages) {
    const pageEvents = spec.events.filter((e) => e.page === page.slug);
    if (!pageEvents.some((e) => e.trigger === 'page_load')) {
      warnings.push(`page "${page.slug}" has no page_load event`);
    }
    const tagged = new Set(pageEvents.filter((e) => e.element).map((e) => e.element.label));
    for (const el of page.interactives) {
      if (el.label && !tagged.has(el.label)) warnings.push(`page "${page.slug}" untagged element: ${el.type} "${el.label}"`);
    }
  }
  return { warnings, errors };
}

export function analyzeAll() {
  const results = [];
  for (const { dir, product, slug } of conceptDirs()) {
    const { pages } = conceptPages(dir);
    const enriched = pages.map((p) => ({ slug: p.slug, interactives: scanInteractive(readFileSync(p.screen, 'utf8')) }));
    const specPath = path.join(dir, 'analytics.json');
    const spec = existsSync(specPath) ? JSON.parse(readFileSync(specPath, 'utf8')) : null;
    results.push({ product, slug, ...analyzeConcept(spec, enriched) });
  }
  return results;
}
