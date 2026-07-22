import type { AnalyticsEvent, Trigger } from './schema';

const SNAKE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
export const isSnakeCase = (s: string) => SNAKE.test(s);

export function suggestSuffix(trigger: Trigger): string {
  return trigger === 'click' ? 'tap' : trigger === 'page_load' ? 'view' : 'change';
}

export function deriveEventName(label: string, trigger: Trigger): string {
  const base = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return base ? `${base}_${suggestSuffix(trigger)}` : suggestSuffix(trigger);
}

export function renderAmplitudeCall(event: AnalyticsEvent): string {
  const keys = Object.keys(event.data);
  if (!keys.length) return `dispatch(sendAnalyticEvent({ event: '${event.event}' }))`;
  const data = keys.map((k) => `${k}: '${event.data[k]}'`).join(', ');
  return `dispatch(sendAnalyticEvent({ event: '${event.event}', data: { ${data} } }))`;
}
