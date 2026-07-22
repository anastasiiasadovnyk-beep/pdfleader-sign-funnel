import { useEffect, useState } from 'react';
import { anchorFor } from '../core/selector';
import type { ElementAnchor } from '../core/schema';

const INTERACTIVE = 'button, a, input, select, textarea, [role="button"], [role="tab"], [role="switch"], [data-track]';

function targetFor(e: Event): Element | null {
  const t = e.target as Element;
  if (t.closest('.aftag-root')) return null;
  return t.closest(INTERACTIVE) ?? t;
}

export function useInspector(active: boolean, onPick: (anchor: ElementAnchor, rect: DOMRect) => void) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [anchor, setAnchor] = useState<ElementAnchor | null>(null);

  useEffect(() => {
    if (!active) { setRect(null); setAnchor(null); return; }
    const move = (e: MouseEvent) => {
      const el = targetFor(e);
      setRect(el ? el.getBoundingClientRect() : null);
      setAnchor(el ? anchorFor(el) : null);
    };
    const click = (e: MouseEvent) => {
      const el = targetFor(e);
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      onPick(anchorFor(el), el.getBoundingClientRect());
    };
    document.addEventListener('mousemove', move, true);
    document.addEventListener('click', click, true);
    return () => {
      document.removeEventListener('mousemove', move, true);
      document.removeEventListener('click', click, true);
    };
  }, [active, onPick]);

  return { rect, anchor };
}
