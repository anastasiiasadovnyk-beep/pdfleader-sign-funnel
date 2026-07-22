import { triggerById } from './taxonomy';
import type { AnalyticsEvent, AnalyticsSpec } from './schema';

const SNAKE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
export const isSnakeCase = (s: string) => SNAKE.test(s);
export const suffixFor = (triggerId: string) => triggerById(triggerId)?.suffix ?? '';

const slug = (label: string) => label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
export function deriveEventName(label: string, triggerId: string): string {
  const base = slug(label);
  const suffix = triggerId === 'custom' ? '' : suffixFor(triggerId);
  if (!suffix) return base;
  return base ? `${base}_${suffix}` : suffix;
}

export function renderAmplitudeCall(event: AnalyticsEvent): string {
  const keys = Object.keys(event.data);
  if (!keys.length) return `dispatch(sendAnalyticEvent({ event: '${event.event}' }))`;
  const data = keys.map((k) => `${k}: '${event.data[k]}'`).join(', ');
  return `dispatch(sendAnalyticEvent({ event: '${event.event}', data: { ${data} } }))`;
}

export const existingNames = (spec: AnalyticsSpec): string[] => Array.from(new Set(spec.events.map((e) => e.event)));

export function renderTrackingPlan(spec: AnalyticsSpec): string {
  const header = '| page | category | trigger | event | element | data | call |\n|---|---|---|---|---|---|---|';
  const rows = spec.events.map((e) =>
    `| ${e.page} | ${e.category} | ${e.trigger} | \`${e.event}\` | ${e.element?.selector ?? '—'} | ${Object.keys(e.data).join(', ') || '—'} | \`${renderAmplitudeCall(e)}\` |`,
  );
  return [`# ${spec.product} / ${spec.concept} — tracking plan`, '', header, ...rows, ''].join('\n');
}
