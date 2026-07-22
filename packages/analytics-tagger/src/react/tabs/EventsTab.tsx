import { useContext } from 'react';
import { TaggerContext } from '../AnalyticsTagger';
import { removeEvent } from '../../core/schema';
import type { AnalyticsEvent, EventCategory } from '../../core/schema';
import { CATEGORIES } from '../../core/taxonomy';

function locate(selector: string | undefined) {
  if (!selector) return;
  const el = document.querySelector(selector);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('aftag-flash');
  setTimeout(() => el.classList.remove('aftag-flash'), 900);
}

export function EventsTab() {
  const ctx = useContext(TaggerContext)!;
  const pageEvents = ctx.spec.events.filter((e) => e.page === ctx.page);

  const groups: { category: EventCategory; events: AnalyticsEvent[] }[] = CATEGORIES
    .map((category) => ({ category, events: pageEvents.filter((e) => e.category === category) }))
    .filter((g) => g.events.length > 0);

  const edit = (event: AnalyticsEvent) => {
    ctx.setDraft({ ...event });
    ctx.setTab('add');
  };
  const del = (id: string) => ctx.persist(removeEvent(ctx.spec, id));

  if (!pageEvents.length) return <p className="aftag-placeholder">No events tagged for this page yet.</p>;

  return (
    <div className="aftag-tab-body">
      {groups.map((g) => (
        <div key={g.category} className="aftag-group">
          <div className="aftag-group-header">
            <span>{g.category}</span>
            <span className="aftag-badge">{g.events.length}</span>
          </div>
          {g.events.map((event) => (
            <div className="aftag-event-row" key={event.id}>
              <div className="aftag-event-main">
                <span className="aftag-event-name">{event.event}</span>
                <span className="aftag-event-meta">{event.trigger}{event.element?.selector ? ` · ${event.element.selector}` : ''}</span>
              </div>
              <div className="aftag-row">
                {event.element?.selector && (
                  <button type="button" className="aftag-icon-btn" onClick={() => locate(event.element?.selector)} aria-label="Locate">◎</button>
                )}
                <button type="button" className="aftag-icon-btn" onClick={() => edit(event)} aria-label="Edit">✎</button>
                <button type="button" className="aftag-icon-btn" onClick={() => del(event.id)} aria-label="Delete">&times;</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
