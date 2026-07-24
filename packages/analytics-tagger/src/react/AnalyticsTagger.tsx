import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AnalyticsEvent, AnalyticsSpec, ElementAnchor } from '../core/schema';
import { emptySpec, nextEventId } from '../core/schema';
import { loadSpec, saveSpec } from '../core/client';
import { Launcher } from './Launcher';
import { Drawer } from './Drawer';
import { ElementHighlight } from './ElementHighlight';
import { useInspector } from './useInspector';
import '../styles.css';

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

const STORAGE_KEY = 'aftag:enabled';
const OFF_VALUES = new Set(['0', 'false', 'off', 'no']);
const readEnabled = () => { try { return sessionStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; } };

export function AnalyticsTagger({ product, concept, page }: AnalyticsTaggerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagParam = searchParams.get('tag');

  // Once ?tag is seen the tool stays on across navigation (per-tab), until Disable or ?tag=0.
  const [enabled, setEnabled] = useState(readEnabled);
  const [spec, setSpec] = useState<AnalyticsSpec>(() => emptySpec(product, concept));
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabId>('inspect');
  const [inspecting, setInspecting] = useState(false);
  const [draft, setDraft] = useState<DraftEvent | null>(null);

  useEffect(() => {
    if (tagParam == null) return;
    const off = OFF_VALUES.has(tagParam.toLowerCase());
    try { off ? sessionStorage.removeItem(STORAGE_KEY) : sessionStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setEnabled(!off);
  }, [tagParam]);

  const disable = useCallback(() => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setEnabled(false);
    setOpen(false);
    setInspecting(false);
    if (searchParams.has('tag')) {
      const next = new URLSearchParams(searchParams);
      next.delete('tag');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const enable = useCallback(() => {
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setEnabled(true);
  }, []);

  const toggle = useCallback(() => {
    if (!enabled) { enable(); setOpen(true); return; }
    setOpen((v) => !v);
  }, [enabled, enable]);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadSpec(product, concept).then((s) => { if (alive) setSpec(s); });
    return () => { alive = false; };
  }, [enabled, product, concept]);

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
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (inspecting) { setInspecting(false); return; }
      if (draft) setDraft(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, inspecting, draft]);

  const eventCount = useMemo(() => spec.events.filter((e) => e.page === page).length, [spec, page]);

  const context = useMemo<TaggerContextValue>(() => ({
    product, concept, page, spec, persist, draft, setDraft, tab, setTab, inspecting, setInspecting,
  }), [product, concept, page, spec, persist, draft, tab, inspecting]);

  return (
    <div className="aftag-root">
      <Launcher count={eventCount} onToggle={toggle} />
      {enabled && (
        <TaggerContext.Provider value={context}>
          {open && <Drawer onClose={() => setOpen(false)} onDisable={disable} />}
          {inspecting && <ElementHighlight rect={rect} anchor={hoverAnchor} onChip={onChip} />}
        </TaggerContext.Provider>
      )}
    </div>
  );
}
