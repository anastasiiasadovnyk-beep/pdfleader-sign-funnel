import { conceptEntries } from './concepts';
import type { ConceptEntry } from './concepts';

export function filterConcepts(entries: ConceptEntry[], query: string): ConceptEntry[] {
  const q = query.trim().toLowerCase();
  const base = [...entries].sort((a, b) => a.product.localeCompare(b.product) || a.title.localeCompare(b.title));
  if (!q) return base;
  const scored = base
    .map((e) => {
      const hay = `${e.title} ${e.product} ${e.slug}`.toLowerCase();
      if (!hay.includes(q)) return null;
      let score = 0;
      if (e.product.toLowerCase() === q) score += 3;
      if (e.title.toLowerCase().startsWith(q)) score += 2;
      if (e.slug.toLowerCase().startsWith(q)) score += 1;
      return { e, score };
    })
    .filter((x): x is { e: ConceptEntry; score: number } => x !== null)
    .sort((a, b) => b.score - a.score);
  return scored.map((x) => x.e);
}

export function useConceptSearch(query: string): ConceptEntry[] {
  return filterConcepts(conceptEntries(), query);
}
