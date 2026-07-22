import { useState } from 'react';
import type { AnalyticsEvent, ElementAnchor, Trigger } from './lib/schema';
import { deriveEventName, isSnakeCase } from './lib/naming';

type Props = {
  page: string;
  anchor?: ElementAnchor;
  initial?: AnalyticsEvent;
  id: string;
  onSave: (event: AnalyticsEvent) => void;
  onCancel: () => void;
};

export function EventForm({ page, anchor, initial, id, onSave, onCancel }: Props) {
  const [trigger, setTrigger] = useState<Trigger>(initial?.trigger ?? (anchor ? 'click' : 'page_load'));
  const [name, setName] = useState(initial?.event ?? deriveEventName(anchor?.label ?? page, trigger));
  const [rows, setRows] = useState<[string, string][]>(Object.entries(initial?.data ?? {}));
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const valid = isSnakeCase(name);

  const save = () => {
    const data = Object.fromEntries(rows.filter(([k]) => k.trim()));
    onSave({ id, page, trigger, event: name, data, element: anchor ?? initial?.element, notes });
  };

  return (
    <div className="flex w-80 flex-col gap-3 rounded-4 border border-action-stroke bg-bg-white-bg p-4 shadow-lg">
      <label className="flex flex-col gap-1 text-caption-xs text-text-secondary">
        Trigger
        <select className="rounded-3 border border-action-stroke px-2 py-1 text-body-2 text-text-primary" value={trigger}
          onChange={(e) => { const t = e.target.value as Trigger; setTrigger(t); setName(deriveEventName(anchor?.label ?? page, t)); }}>
          <option value="click">click</option>
          <option value="page_load">page_load</option>
          <option value="input_change">input_change</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-caption-xs text-text-secondary">
        Event name
        <input className={`rounded-3 border px-2 py-1 text-body-2 ${valid ? 'border-action-stroke text-text-primary' : 'border-error-main text-error-main'}`}
          value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="flex flex-col gap-1">
        <span className="text-caption-xs text-text-secondary">data</span>
        {rows.map(([k, v], i) => (
          <div key={i} className="flex gap-1">
            <input className="w-1/2 rounded-3 border border-action-stroke px-2 py-1 text-caption-xs" placeholder="key" value={k}
              onChange={(e) => setRows(rows.map((r, j) => (j === i ? [e.target.value, r[1]] : r)))} />
            <input className="w-1/2 rounded-3 border border-action-stroke px-2 py-1 text-caption-xs" placeholder="value" value={v}
              onChange={(e) => setRows(rows.map((r, j) => (j === i ? [r[0], e.target.value] : r)))} />
          </div>
        ))}
        <button type="button" className="text-caption-xs text-primary" onClick={() => setRows([...rows, ['', '']])}>+ add prop</button>
      </div>
      <textarea className="rounded-3 border border-action-stroke px-2 py-1 text-caption-xs" placeholder="notes" value={notes}
        onChange={(e) => setNotes(e.target.value)} />
      <div className="flex justify-end gap-2">
        <button type="button" className="text-caption-xs text-text-secondary" onClick={onCancel}>Cancel</button>
        <button type="button" disabled={!valid} className="rounded-3 bg-primary px-3 py-1 text-caption-xs text-primary-contrast-text disabled:opacity-40" onClick={save}>Save event</button>
      </div>
    </div>
  );
}
