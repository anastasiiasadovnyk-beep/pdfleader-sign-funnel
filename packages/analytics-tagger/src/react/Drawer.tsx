import { useContext } from 'react';
import { TaggerContext } from './AnalyticsTagger';
import type { TabId } from './AnalyticsTagger';
import { InspectTab } from './tabs/InspectTab';
import { AddTab } from './tabs/AddTab';
import { EventsTab } from './tabs/EventsTab';
import { CoverageTab } from './tabs/CoverageTab';
import { ExportTab } from './tabs/ExportTab';

const TABS: { id: TabId; label: string }[] = [
  { id: 'inspect', label: 'Inspect' },
  { id: 'events', label: 'Events' },
  { id: 'add', label: 'Add' },
  { id: 'coverage', label: 'Coverage' },
  { id: 'export', label: 'Export' },
];

function TabBody({ tab }: { tab: TabId }) {
  switch (tab) {
    case 'inspect': return <InspectTab />;
    case 'add': return <AddTab />;
    case 'events': return <EventsTab />;
    case 'coverage': return <CoverageTab />;
    case 'export': return <ExportTab />;
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
