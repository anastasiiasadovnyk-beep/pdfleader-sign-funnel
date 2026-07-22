import { finder } from '@medv/finder';
import type { ElementAnchor } from './schema';

export function anchorFor(el: Element, root?: Element): ElementAnchor {
  let selector = '';
  try {
    selector = finder(el, root ? { root: root as Element } : undefined);
  } catch {
    selector = el.tagName.toLowerCase();
  }
  const text = (el.textContent || '').trim().slice(0, 80);
  return {
    selector,
    tag: el.tagName.toLowerCase(),
    role: el.getAttribute('role'),
    label: (el.getAttribute('aria-label') || text).slice(0, 80),
    text: text || undefined,
  };
}
