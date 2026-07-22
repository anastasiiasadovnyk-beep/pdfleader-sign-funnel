import { useCallback, useEffect, useState } from 'react';
import { anchorFor } from '../core/selector';
import type { AnalyticsSpec, ElementAnchor } from '../core/schema';

const INTERACTIVE = 'button, a, input, select, textarea, [role="button"], [role="tab"], [role="switch"], [data-track]';

function scan(): ElementAnchor[] {
  const nodes = Array.from(document.querySelectorAll(INTERACTIVE)).filter((el) => !el.closest('.aftag-root'));
  const seen = new Set<string>();
  const anchors: ElementAnchor[] = [];
  for (const el of nodes) {
    const anchor = anchorFor(el);
    if (seen.has(anchor.selector)) continue;
    seen.add(anchor.selector);
    anchors.push(anchor);
  }
  return anchors;
}

export function useCoverage(page: string, spec: AnalyticsSpec) {
  const [anchors, setAnchors] = useState<ElementAnchor[]>(() => scan());

  const rescan = useCallback(() => setAnchors(scan()), []);

  useEffect(() => { rescan(); }, [rescan]);

  const taggedSelectors = new Set(
    spec.events.filter((e) => e.page === page && e.element?.selector).map((e) => e.element!.selector),
  );

  const tagged = anchors.filter((a) => taggedSelectors.has(a.selector));
  const untagged = anchors.filter((a) => !taggedSelectors.has(a.selector));

  return { tagged, untagged, rescan };
}
