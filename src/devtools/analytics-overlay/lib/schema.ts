export type Trigger = 'click' | 'page_load' | 'input_change';
export type ElementAnchor = { tag: string; role: string | null; label: string; occurrence: number };
export type AnalyticsEvent = {
  id: string;
  page: string;
  trigger: Trigger;
  event: string;
  data: Record<string, string>;
  element?: ElementAnchor;
  notes: string;
};
export type AnalyticsSpec = { version: 1; product: string; concept: string; events: AnalyticsEvent[] };

export const emptySpec = (product: string, concept: string): AnalyticsSpec => ({ version: 1, product, concept, events: [] });

export function upsertEvent(spec: AnalyticsSpec, event: AnalyticsEvent): AnalyticsSpec {
  const i = spec.events.findIndex((e) => e.id === event.id);
  const events = i >= 0 ? spec.events.map((e) => (e.id === event.id ? event : e)) : [...spec.events, event];
  return { ...spec, events };
}

export const removeEvent = (spec: AnalyticsSpec, id: string): AnalyticsSpec => ({
  ...spec,
  events: spec.events.filter((e) => e.id !== id),
});

export function nextEventId(spec: AnalyticsSpec): string {
  const max = spec.events.reduce((m, e) => {
    const n = Number(e.id.replace('evt_', ''));
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `evt_${max + 1}`;
}
