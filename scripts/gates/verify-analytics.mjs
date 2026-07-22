import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { conceptDirs, conceptPages } from './lib/scan.mjs';

const SNAKE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
const PAGE_VIEW_TRIGGERS = new Set(['page_view', 'page_load']);

export function analyzeConcept(spec, pages) {
  const warnings = [];
  const errors = [];
  if (!spec) { warnings.push('no analytics tagged (no analytics.json)'); return { warnings, errors }; }
  if (!Array.isArray(spec.events)) { errors.push('malformed analytics.json: events is not an array'); return { warnings, errors }; }
  for (const e of spec.events) {
    if (typeof e.event !== 'string' || !SNAKE.test(e.event)) errors.push(`invalid event name (must be snake_case): "${e.event}"`);
  }
  for (const page of pages) {
    const pageEvents = spec.events.filter((e) => e.page === page.slug);
    if (!pageEvents.some((e) => PAGE_VIEW_TRIGGERS.has(e.trigger))) warnings.push(`page "${page.slug}" has no page-view event`);
  }
  return { warnings, errors };
}

export function analyzeAll() {
  const results = [];
  for (const { dir, product, slug } of conceptDirs()) {
    const { pages } = conceptPages(dir);
    const specPath = path.join(dir, 'analytics.json');
    const spec = existsSync(specPath) ? JSON.parse(readFileSync(specPath, 'utf8')) : null;
    results.push({ product, slug, ...analyzeConcept(spec, pages.map((p) => ({ slug: p.slug }))) });
  }
  return results;
}
