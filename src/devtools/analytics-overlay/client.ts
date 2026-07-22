import type { AnalyticsSpec } from './lib/schema';
import { emptySpec } from './lib/schema';

const url = (product: string, concept: string) => `/__analytics/${product}/${concept}`;

export async function loadSpec(product: string, concept: string): Promise<AnalyticsSpec> {
  try {
    const res = await fetch(url(product, concept));
    if (!res.ok) return emptySpec(product, concept);
    return (await res.json()) as AnalyticsSpec;
  } catch {
    return emptySpec(product, concept);
  }
}

export async function saveSpec(spec: AnalyticsSpec): Promise<boolean> {
  try {
    const res = await fetch(url(spec.product, spec.concept), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(spec),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function downloadSpec(spec: AnalyticsSpec): void {
  const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = `${spec.product}-${spec.concept}.analytics.json`;
  a.click();
  URL.revokeObjectURL(href);
}
