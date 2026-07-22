import { useContext, useMemo, useState } from 'react';
import { TaggerContext } from '../AnalyticsTagger';
import type { DraftEvent } from '../AnalyticsTagger';
import { upsertEvent, nextEventId } from '../../core/schema';
import type { AnalyticsEvent, EventCategory } from '../../core/schema';
import { CATEGORIES, triggersByCategory, triggerById, PROPERTY_KEYS, PROPERTY_VALUES } from '../../core/taxonomy';
import { deriveEventName, isSnakeCase, renderAmplitudeCall, existingNames } from '../../core/naming';

function blankDraft(id: string, page: string): DraftEvent {
  return { id, page, category: 'navigation', trigger: 'page_view', event: '', data: {}, notes: '' };
}

export function AddTab() {
  const ctx = useContext(TaggerContext)!;
  const [nameEdited, setNameEdited] = useState(false);

  const draft = ctx.draft;

  const names = useMemo(() => existingNames(ctx.spec), [ctx.spec]);

  if (!draft) {
    return (
      <div className="aftag-tab-body">
        <p className="aftag-placeholder">Pick an element in Inspect, or start a blank draft.</p>
        <button
          type="button"
          className="aftag-btn aftag-btn-primary"
          onClick={() => { ctx.setDraft(blankDraft(nextEventId(ctx.spec), ctx.page)); setNameEdited(false); }}
        >
          New event
        </button>
      </div>
    );
  }

  const category = draft.category ?? 'interaction';
  const triggerId = draft.trigger ?? 'click';
  const trigger = triggerById(triggerId);
  const eventName = draft.event ?? '';
  const nameValid = isSnakeCase(eventName);
  const data = draft.data ?? {};
  const propEntries = Object.entries(data);

  const update = (patch: Partial<DraftEvent>) => ctx.setDraft({ ...draft, ...patch });

  const reseedName = (nextTriggerId: string) => {
    if (nameEdited) return {};
    const seed = deriveEventName(draft.element?.label ?? ctx.page, nextTriggerId);
    return { event: seed };
  };

  const onCategoryChange = (nextCategory: EventCategory) => {
    const firstTrigger = triggersByCategory(nextCategory)[0];
    const nextTriggerId = firstTrigger?.id ?? 'custom';
    update({ category: nextCategory, trigger: nextTriggerId, ...reseedName(nextTriggerId) });
  };

  const onTriggerChange = (nextTriggerId: string) => {
    update({ trigger: nextTriggerId, ...reseedName(nextTriggerId) });
  };

  const setPropKey = (index: number, key: string) => {
    const entries = [...propEntries];
    const [, value] = entries[index];
    entries.splice(index, 1, [key, value]);
    update({ data: Object.fromEntries(entries) });
  };
  const setPropValue = (index: number, value: string) => {
    const entries = [...propEntries];
    const [key] = entries[index];
    entries.splice(index, 1, [key, value]);
    update({ data: Object.fromEntries(entries) });
  };
  const removeProp = (index: number) => {
    const entries = [...propEntries];
    entries.splice(index, 1);
    update({ data: Object.fromEntries(entries) });
  };
  const addProp = () => {
    const suggested = trigger?.suggestedProps.find((k) => !(k in data));
    const key = suggested ?? '';
    update({ data: { ...data, [key]: '' } });
  };

  const suggestedFirst = [
    ...(trigger?.suggestedProps ?? []),
    ...PROPERTY_KEYS.filter((k) => !trigger?.suggestedProps.includes(k)),
  ];

  const canSave = nameValid && eventName.length > 0;

  const save = () => {
    if (!canSave) return;
    const event: AnalyticsEvent = {
      id: draft.id,
      page: draft.page ?? ctx.page,
      category,
      trigger: triggerId,
      event: eventName,
      data,
      element: draft.element,
      notes: draft.notes ?? '',
    };
    ctx.persist(upsertEvent(ctx.spec, event));
    ctx.setDraft(null);
    setNameEdited(false);
    ctx.setTab('events');
  };

  return (
    <div className="aftag-tab-body">
      <label className="aftag-field">
        <span className="aftag-field-label">Category</span>
        <select className="aftag-input" value={category} onChange={(e) => onCategoryChange(e.target.value as EventCategory)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      <label className="aftag-field">
        <span className="aftag-field-label">Trigger</span>
        <select className="aftag-input" value={triggerId} onChange={(e) => onTriggerChange(e.target.value)}>
          {triggersByCategory(category).map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </label>

      <label className="aftag-field">
        <span className="aftag-field-label">Event name</span>
        <input
          className={`aftag-input${nameValid ? '' : ' aftag-input-invalid'}`}
          list="aftag-existing-names"
          value={eventName}
          onChange={(e) => { setNameEdited(true); update({ event: e.target.value }); }}
          placeholder="snake_case_event_name"
        />
        <datalist id="aftag-existing-names">
          {names.map((n) => <option key={n} value={n} />)}
        </datalist>
        {!nameValid && eventName.length > 0 && <span className="aftag-error">Must be snake_case.</span>}
      </label>

      {trigger?.needsElement !== false && (
        <label className="aftag-field">
          <span className="aftag-field-label">Element selector</span>
          <div className="aftag-row">
            <input
              className="aftag-input"
              value={draft.element?.selector ?? ''}
              onChange={(e) => update({ element: draft.element ? { ...draft.element, selector: e.target.value } : { selector: e.target.value, tag: '', role: null, label: '' } })}
            />
            <button type="button" className="aftag-btn" onClick={() => ctx.setInspecting(true)}>Re-pick</button>
          </div>
        </label>
      )}

      <div className="aftag-field">
        <span className="aftag-field-label">Properties</span>
        {propEntries.map(([key, value], i) => (
          <div className="aftag-row" key={i}>
            <input className="aftag-input" list="aftag-prop-keys" value={key} onChange={(e) => setPropKey(i, e.target.value)} placeholder="key" />
            <input className="aftag-input" list={`aftag-prop-values-${key}`} value={value} onChange={(e) => setPropValue(i, e.target.value)} placeholder="value" />
            <button type="button" className="aftag-icon-btn" onClick={() => removeProp(i)} aria-label="Remove property">&times;</button>
            <datalist id={`aftag-prop-values-${key}`}>
              {(PROPERTY_VALUES[key] ?? []).map((v) => <option key={v} value={v} />)}
            </datalist>
          </div>
        ))}
        <datalist id="aftag-prop-keys">
          {suggestedFirst.map((k) => <option key={k} value={k} />)}
        </datalist>
        <button type="button" className="aftag-btn" onClick={addProp}>Add property</button>
      </div>

      <label className="aftag-field">
        <span className="aftag-field-label">Notes</span>
        <textarea className="aftag-input" rows={2} value={draft.notes ?? ''} onChange={(e) => update({ notes: e.target.value })} />
      </label>

      <div className="aftag-preview">
        <code>{renderAmplitudeCall({ id: draft.id, page: draft.page ?? ctx.page, category, trigger: triggerId, event: eventName, data, element: draft.element, notes: draft.notes ?? '' })}</code>
      </div>

      <div className="aftag-row">
        <button type="button" className="aftag-btn aftag-btn-primary" disabled={!canSave} onClick={save}>Save</button>
        <button type="button" className="aftag-btn" onClick={() => { ctx.setDraft(blankDraft(nextEventId(ctx.spec), ctx.page)); setNameEdited(false); }}>New event</button>
      </div>
    </div>
  );
}
