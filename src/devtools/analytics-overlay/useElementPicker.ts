import { useEffect, useState } from 'react';
import type { ElementAnchor } from './lib/schema';

const INTERACTIVE = 'button, a, input, select, textarea, [role="button"], [role="tab"], [role="switch"]';

function anchorFor(el: Element): ElementAnchor {
  const tag = el.tagName.toLowerCase();
  const role = el.getAttribute('role');
  const label = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 60);
  const peers = Array.from(document.querySelectorAll(INTERACTIVE)).filter(
    (n) => n.tagName === el.tagName && (n.getAttribute('aria-label') || n.textContent || '').trim().slice(0, 60) === label,
  );
  return { tag, role, label, occurrence: Math.max(0, peers.indexOf(el)) };
}

export function useElementPicker(active: boolean, onPick: (anchor: ElementAnchor, rect: DOMRect) => void) {
  const [hover, setHover] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (!active) { setHover(null); return; }
    const target = (e: Event) => (e.target as Element)?.closest(INTERACTIVE);
    const move = (e: MouseEvent) => { const el = target(e); setHover(el ? el.getBoundingClientRect() : null); };
    const click = (e: MouseEvent) => {
      const el = target(e);
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      onPick(anchorFor(el), el.getBoundingClientRect());
    };
    document.addEventListener('mousemove', move, true);
    document.addEventListener('click', click, true);
    return () => { document.removeEventListener('mousemove', move, true); document.removeEventListener('click', click, true); };
  }, [active, onPick]);
  return hover;
}
