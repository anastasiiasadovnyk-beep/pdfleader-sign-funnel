import { useContext } from 'react';
import { TaggerContext } from './AnalyticsTagger';
import type { TabId } from './AnalyticsTagger';

const TABS: { id: TabId; label: string }[] = [
  { id: 'inspect', label: 'Inspect' },
  { id: 'events', label: 'Events' },
  { id: 'add', label: 'Add' },
  { id: 'coverage', label: 'Coverage' },
  { id: 'export', label: 'Export' },
];

function ComingSoon({ label }: { label: string }) {
  return <p className="aftag-placeholder">{label} — coming in A9.</p>;
}

function InspectTab() {
  const ctx = useContext(TaggerContext)!;
  return (
    <div className="aftag-tab-body">
      <p className="aftag-help">Hover elements on the page to preview them, click (or pick a trigger chip) to draft an event.</p>
      <button type="button" className="aftag-btn aftag-btn-primary" onClick={() => ctx.setInspecting(!ctx.inspecting)}>
        {ctx.inspecting ? 'Stop inspecting (Esc)' : 'Start inspecting'}
      </button>
    </div>
  );
}

function AddTab() {
  const ctx = useContext(TaggerContext)!;
  if (!ctx.draft) return <p className="aftag-placeholder">Pick an element in Inspect to start a draft — coming in A9.</p>;
  return (
    <div className="aftag-tab-body">
      <p className="aftag-help">Draft seeded from inspection. Full form lands in A9.</p>
      <dl className="aftag-draft-summary">
        <dt>trigger</dt><dd>{ctx.draft.trigger}</dd>
        <dt>selector</dt><dd>{ctx.draft.element?.selector}</dd>
      </dl>
    </div>
  );
}

function TabBody({ tab }: { tab: TabId }) {
  switch (tab) {
    case 'inspect': return <InspectTab />;
    case 'add': return <AddTab />;
    case 'events': return <ComingSoon label="Events" />;
    case 'coverage': return <ComingSoon label="Coverage" />;
    case 'export': return <ComingSoon label="Export" />;
  }
}

export function Drawer({ onClose }: { onClose: () => void }) {
  const ctx = useContext(TaggerContext)!;
  return (
    <div className="aftag-drawer">
      <div className="aftag-drawer-header">
        <span className="aftag-drawer-title">Analytics tagger</span>
        <button type="button" className="aftag-icon-btn" onClick={onClose} aria-label="Close">
          &times;
        </button>
      </div>
      <div className="aftag-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={ctx.tab === t.id}
            className={`aftag-tab${ctx.tab === t.id ? ' aftag-tab-active' : ''}`}
            onClick={() => ctx.setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="aftag-drawer-body">
        <TabBody tab={ctx.tab} />
      </div>
    </div>
  );
}
