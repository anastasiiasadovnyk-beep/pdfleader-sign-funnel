import type { Flow } from './concepts';
import { pageIndex, pageCount } from './flowNav';

export function FlowBar({ flow, current, onJump }: { flow: Flow; current: string; onJump: (slug: string) => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-action-stroke bg-bg-white-bg px-4 py-2">
      <span className="text-caption-xs text-text-secondary">
        Step {pageIndex(flow, current) + 1} of {pageCount(flow)}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {flow.pages.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => onJump(p.slug)}
            className={`rounded-3 px-2 py-1 text-caption-xs ${p.slug === current ? 'bg-primary text-primary-contrast-text' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {p.title}
          </button>
        ))}
      </div>
    </div>
  );
}
