import type { AnalyticsSpec } from './lib/schema';
import { renderAmplitudeCall } from './lib/naming';

export function SpecPanel({ spec, page, onEdit, onRemove }: {
  spec: AnalyticsSpec; page: string; onEdit: (id: string) => void; onRemove: (id: string) => void;
}) {
  const events = spec.events.filter((e) => e.page === page);
  return (
    <div className="flex max-h-80 w-96 flex-col gap-2 overflow-auto rounded-4 border border-action-stroke bg-bg-white-bg p-3">
      <span className="text-caption-xs text-text-secondary">{events.length} event(s) on "{page}"</span>
      {events.map((e) => (
        <div key={e.id} className="flex flex-col gap-1 rounded-3 border border-action-stroke p-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-caption text-text-primary">{e.event}</span>
            <span className="text-caption-xs text-text-secondary">{e.trigger}{e.element ? ` · ${e.element.label}` : ''}</span>
          </div>
          <code className="text-caption-xs text-text-secondary">{renderAmplitudeCall(e)}</code>
          <div className="flex justify-end gap-2">
            <button type="button" className="text-caption-xs text-primary" onClick={() => onEdit(e.id)}>Edit</button>
            <button type="button" className="text-caption-xs text-error-main" onClick={() => onRemove(e.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
