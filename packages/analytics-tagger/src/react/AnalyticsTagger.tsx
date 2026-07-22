import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AnalyticsEvent, AnalyticsSpec, ElementAnchor } from '../core/schema';
import { emptySpec, nextEventId } from '../core/schema';
import { loadSpec, saveSpec } from '../core/client';
import { Launcher } from './Launcher';
import { Drawer } from './Drawer';
import { ElementHighlight } from './ElementHighlight';
import { useInspector } from './useInspector';

export type TabId = 'inspect' | 'events' | 'add' | 'coverage' | 'export';

export type DraftEvent = Partial<AnalyticsEvent> & { id: string };

export type TaggerContextValue = {
  product: string;
  concept: string;
  page: string;
  spec: AnalyticsSpec;
  persist: (next: AnalyticsSpec) => void;
  draft: DraftEvent | null;
  setDraft: (draft: DraftEvent | null) => void;
  tab: TabId;
  setTab: (tab: TabId) => void;
  inspecting: boolean;
  setInspecting: (inspecting: boolean) => void;
};

export const TaggerContext = createContext<TaggerContextValue | null>(null);

export type AnalyticsTaggerProps = { product: string; concept: string; page: string };

export function AnalyticsTagger({ product, concept, page }: AnalyticsTaggerProps) {
  const [searchParams] = useSearchParams();
  const tagParam = searchParams.get('tag');

  const [spec, setSpec] = useState<AnalyticsSpec>(() => emptySpec(product, concept));
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabId>('inspect');
  const [inspecting, setInspecting] = useState(false);
  const [draft, setDraft] = useState<DraftEvent | null>(null);

  useEffect(() => {
    if (!tagParam) return;
    let alive = true;
    loadSpec(product, concept).then((s) => { if (alive) setSpec(s); });
    return () => { alive = false; };
  }, [tagParam, product, concept]);

  useEffect(() => {
    // dynamic import keeps styles.css out of the prod bundle when the overlay never mounts
    if (tagParam) import('../styles.css');
  }, [tagParam]);

  const persist = useCallback((next: AnalyticsSpec) => {
    setSpec(next);
    saveSpec(next);
  }, []);

  const seedDraft = useCallback((anchor: ElementAnchor, triggerId: string) => {
    setDraft({ id: nextEventId(spec), page, trigger: triggerId, element: anchor, category: 'interaction', event: '', data: {}, notes: '' });
    setTab('add');
    setInspecting(false);
  }, [spec, page]);

  const onPick = useCallback((anchor: ElementAnchor, _rect: DOMRect) => {
    seedDraft(anchor, 'click');
  }, [seedDraft]);
  const { rect, anchor: hoverAnchor } = useInspector(inspecting, onPick);

  const onChip = useCallback((triggerId: string) => {
    if (hoverAnchor) seedDraft(hoverAnchor, triggerId);
  }, [hoverAnchor, seedDraft]);

  useEffect(() => {
    if (!tagParam) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (inspecting) { setInspecting(false); return; }
      if (draft) setDraft(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tagParam, inspecting, draft]);

  const eventCount = useMemo(() => spec.events.filter((e) => e.page === page).length, [spec, page]);

  const context = useMemo<TaggerContextValue>(() => ({
    product, concept, page, spec, persist, draft, setDraft, tab, setTab, inspecting, setInspecting,
  }), [product, concept, page, spec, persist, draft, tab, inspecting]);

  if (!tagParam) return null;

  return (
    <TaggerContext.Provider value={context}>
      <div className="aftag-root">
        <Launcher count={eventCount} onToggle={() => setOpen((v) => !v)} />
        {open && <Drawer onClose={() => setOpen(false)} />}
        {inspecting && <ElementHighlight rect={rect} anchor={hoverAnchor} onChip={onChip} />}
      </div>
    </TaggerContext.Provider>
  );
}
