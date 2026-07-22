import { useContext } from 'react';
import { TaggerContext } from '../AnalyticsTagger';
import { useCoverage } from '../useCoverage';
import { nextEventId } from '../../core/schema';
import type { ElementAnchor } from '../../core/schema';

export function CoverageTab() {
  const ctx = useContext(TaggerContext)!;
  const { tagged, untagged, rescan } = useCoverage(ctx.page, ctx.spec);

  const tagThis = (anchor: ElementAnchor) => {
    ctx.setDraft({ id: nextEventId(ctx.spec), page: ctx.page, category: 'interaction', trigger: 'click', event: '', data: {}, element: anchor, notes: '' });
    ctx.setTab('add');
  };

  return (
    <div className="aftag-tab-body">
      <div className="aftag-row">
        <button type="button" className="aftag-btn" onClick={rescan}>Rescan</button>
      </div>

      <div className="aftag-group">
        <div className="aftag-group-header">
          <span>Untagged</span>
          <span className="aftag-badge">{untagged.length}</span>
        </div>
        {untagged.length === 0 && <p className="aftag-help">Everything interactive on this page is tagged.</p>}
        {untagged.map((anchor) => (
          <div className="aftag-event-row" key={anchor.selector}>
            <div className="aftag-event-main">
              <span className="aftag-event-name">{anchor.tag}</span>
              <span className="aftag-event-meta">{anchor.selector}</span>
            </div>
            <button type="button" className="aftag-btn" onClick={() => tagThis(anchor)}>Tag this</button>
          </div>
        ))}
      </div>

      <div className="aftag-group">
        <div className="aftag-group-header">
          <span>Tagged</span>
          <span className="aftag-badge">{tagged.length}</span>
        </div>
        {tagged.map((anchor) => (
          <div className="aftag-event-row" key={anchor.selector}>
            <div className="aftag-event-main">
              <span className="aftag-event-name">{anchor.tag}</span>
              <span className="aftag-event-meta">{anchor.selector}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
