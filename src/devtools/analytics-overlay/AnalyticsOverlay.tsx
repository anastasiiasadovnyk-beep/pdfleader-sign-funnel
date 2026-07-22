import { useCallback, useEffect, useState } from 'react';
import type { AnalyticsEvent, AnalyticsSpec, ElementAnchor } from './lib/schema';
import { emptySpec, nextEventId, removeEvent, upsertEvent } from './lib/schema';
import { loadSpec, saveSpec, downloadSpec } from './client';
import { useElementPicker } from './useElementPicker';
import { EventForm } from './EventForm';
import { SpecPanel } from './SpecPanel';

export function AnalyticsOverlay({ product, concept, page }: { product: string; concept: string; page: string }) {
  const [spec, setSpec] = useState<AnalyticsSpec>(emptySpec(product, concept));
  const [tagMode, setTagMode] = useState(false);
  const [draft, setDraft] = useState<{ id: string; anchor?: ElementAnchor; initial?: AnalyticsEvent } | null>(null);

  useEffect(() => { loadSpec(product, concept).then(setSpec); }, [product, concept]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setTagMode(false); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  const onPick = useCallback((anchor: ElementAnchor) => {
    setTagMode(false);
    setSpec((s) => { setDraft({ id: nextEventId(s), anchor }); return s; });
  }, []);
  const hover = useElementPicker(tagMode, onPick);

  const persist = (next: AnalyticsSpec) => { setSpec(next); saveSpec(next); };
  const onSaveEvent = (event: AnalyticsEvent) => { persist(upsertEvent(spec, event)); setDraft(null); };
  const addPageLoad = () => setDraft({ id: nextEventId(spec) });
  const editEvent = (id: string) => { const e = spec.events.find((x) => x.id === id); if (e) setDraft({ id, anchor: e.element, initial: e }); };

  return (
    <>
      {hover && (
        <div className="pointer-events-none fixed z-50 border-2 border-primary"
          style={{ left: hover.left, top: hover.top, width: hover.width, height: hover.height }} />
      )}
      <div className="fixed right-4 top-4 z-50 flex flex-col items-end gap-2">
        <div className="flex gap-2 rounded-4 border border-action-stroke bg-bg-white-bg p-2 shadow-lg">
          <button type="button" className={`rounded-3 px-3 py-1 text-caption-xs ${tagMode ? 'bg-primary text-primary-contrast-text' : 'text-text-primary'}`}
            onClick={() => setTagMode((v) => !v)}>{tagMode ? 'Picking… (esc)' : 'Tag'}</button>
          <button type="button" className="rounded-3 px-3 py-1 text-caption-xs text-text-primary" onClick={addPageLoad}>+ page_load</button>
          <button type="button" className="rounded-3 px-3 py-1 text-caption-xs text-text-primary" onClick={() => downloadSpec(spec)}>Download</button>
        </div>
        {draft && (
          <EventForm page={page} id={draft.id} anchor={draft.anchor} initial={draft.initial}
            onSave={onSaveEvent} onCancel={() => setDraft(null)} />
        )}
        <SpecPanel spec={spec} page={page} onEdit={editEvent} onRemove={(id) => persist(removeEvent(spec, id))} />
      </div>
    </>
  );
}
