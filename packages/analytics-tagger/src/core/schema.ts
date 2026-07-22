export type EventCategory = 'interaction' | 'form' | 'visibility' | 'navigation' | 'media' | 'content' | 'custom';
export type ElementAnchor = { selector: string; tag: string; role: string | null; label: string; text?: string };
export type AnalyticsEvent = {
  id: string;
  page: string;
  category: EventCategory;
  trigger: string;
  event: string;
  data: Record<string, string>;
  element?: ElementAnchor;
  notes: string;
};
export type AnalyticsSpec = { version: 2; product: string; concept: string; events: AnalyticsEvent[] };

export const emptySpec = (product: string, concept: string): AnalyticsSpec => ({ version: 2, product, concept, events: [] });

export function upsertEvent(spec: AnalyticsSpec, event: AnalyticsEvent): AnalyticsSpec {
  const i = spec.events.findIndex((e) => e.id === event.id);
  const events = i >= 0 ? spec.events.map((e) => (e.id === event.id ? event : e)) : [...spec.events, event];
  return { ...spec, events };
}
export const removeEvent = (spec: AnalyticsSpec, id: string): AnalyticsSpec => ({ ...spec, events: spec.events.filter((e) => e.id !== id) });
export function nextEventId(spec: AnalyticsSpec): string {
  const max = spec.events.reduce((m, e) => { const n = Number(e.id.replace('evt_', '')); return Number.isFinite(n) && n > m ? n : m; }, 0);
  return `evt_${max + 1}`;
}

const V1_TRIGGER: Record<string, { category: EventCategory; trigger: string }> = {
  click: { category: 'interaction', trigger: 'click' },
  page_load: { category: 'navigation', trigger: 'page_view' },
  input_change: { category: 'form', trigger: 'input_change' },
};
export function migrateV1(v1: { product: string; concept: string; events: any[] }): AnalyticsSpec {
  return {
    version: 2,
    product: v1.product,
    concept: v1.concept,
    events: (v1.events ?? []).map((e) => {
      const map = V1_TRIGGER[e.trigger] ?? { category: 'custom' as EventCategory, trigger: e.trigger };
      const element = e.element
        ? { selector: '', tag: e.element.tag, role: e.element.role ?? null, label: e.element.label ?? '' }
        : undefined;
      return { id: e.id, page: e.page, category: map.category, trigger: map.trigger, event: e.event, data: e.data ?? {}, element, notes: e.notes ?? '' };
    }),
  };
}
export function coerceSpec(raw: any): AnalyticsSpec {
  if (raw && raw.version === 2) return raw as AnalyticsSpec;
  if (raw && raw.version === 1) return migrateV1(raw);
  return emptySpec(raw?.product ?? '', raw?.concept ?? '');
}
