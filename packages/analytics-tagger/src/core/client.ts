import type { AnalyticsSpec } from './schema';
import { coerceSpec, emptySpec } from './schema';

const url = (product: string, concept: string) => `/__analytics/${product}/${concept}`;
const storageKey = (product: string, concept: string) => `aftag:spec:${product}:${concept}`;

// Prod is a static S3 build with no server, so /__analytics (a Vite dev-only
// middleware writing local files) doesn't exist there — fall back to localStorage.
export async function loadSpec(product: string, concept: string): Promise<AnalyticsSpec> {
  if (!import.meta.env.DEV) {
    try {
      const raw = localStorage.getItem(storageKey(product, concept));
      return raw ? coerceSpec(JSON.parse(raw)) : emptySpec(product, concept);
    } catch { return emptySpec(product, concept); }
  }
  try {
    const res = await fetch(url(product, concept));
    if (!res.ok) return emptySpec(product, concept);
    return coerceSpec(await res.json());
  } catch { return emptySpec(product, concept); }
}
export async function saveSpec(spec: AnalyticsSpec): Promise<boolean> {
  if (!import.meta.env.DEV) {
    try {
      localStorage.setItem(storageKey(spec.product, spec.concept), JSON.stringify(spec));
      return true;
    } catch { return false; }
  }
  try {
    const res = await fetch(url(spec.product, spec.concept), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(spec) });
    return res.ok;
  } catch { return false; }
}
export function downloadSpec(spec: AnalyticsSpec): void {
  const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href; a.download = `${spec.product}-${spec.concept}.analytics.json`; a.click();
  URL.revokeObjectURL(href);
}
export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}
