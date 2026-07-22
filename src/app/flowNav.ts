import type { Flow } from './concepts';

export const pageCount = (flow: Flow) => flow.pages.length;
export const pageIndex = (flow: Flow, slug: string) => flow.pages.findIndex((p) => p.slug === slug);

export function resolvePage(flow: Flow, pageParam?: string): string {
  if (pageParam && flow.pages.some((p) => p.slug === pageParam)) return pageParam;
  return flow.start;
}

export function nextTargets(flow: Flow, slug: string): string[] {
  const page = flow.pages.find((p) => p.slug === slug);
  if (!page?.next) return [];
  return Array.isArray(page.next) ? page.next : [page.next];
}

export function prevSlug(flow: Flow, slug: string): string | null {
  const i = pageIndex(flow, slug);
  return i > 0 ? flow.pages[i - 1].slug : null;
}
