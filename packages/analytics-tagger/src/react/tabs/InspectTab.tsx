import { useContext } from 'react';
import { TaggerContext } from '../AnalyticsTagger';

export function InspectTab() {
  const ctx = useContext(TaggerContext)!;
  const anchor = ctx.draft?.element;
  return (
    <div className="aftag-tab-body">
      <p className="aftag-help">Hover elements on the page to preview them, click (or pick a trigger chip) to draft an event.</p>
      <button type="button" className="aftag-btn aftag-btn-primary" onClick={() => ctx.setInspecting(!ctx.inspecting)}>
        {ctx.inspecting ? 'Stop inspecting (Esc)' : 'Start inspecting'}
      </button>
      {anchor && (
        <dl className="aftag-draft-summary">
          <dt>last picked</dt><dd>{anchor.tag}</dd>
          <dt>selector</dt><dd>{anchor.selector}</dd>
        </dl>
      )}
    </div>
  );
}
