import type { ElementAnchor } from '../core/schema';

const CHIPS = ['tap', 'view', 'hover', 'change'];

export function ElementHighlight({
  rect,
  anchor,
  onChip,
}: {
  rect: DOMRect | null;
  anchor: ElementAnchor | null;
  onChip: (triggerId: string) => void;
}) {
  if (!rect) return null;
  const tooltipTop = rect.top > 60 ? rect.top - 8 : rect.bottom + 8;
  return (
    <>
      <div
        className="aftag-highlight-box"
        style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
      />
      {anchor && (
        <div
          className="aftag-highlight-tooltip"
          style={{ left: rect.left, top: tooltipTop, transform: rect.top > 60 ? 'translateY(-100%)' : undefined }}
        >
          <div className="aftag-highlight-meta">
            <span className="aftag-highlight-tag">{anchor.tag}</span>
            <span className="aftag-highlight-selector">{anchor.selector}</span>
            {anchor.text && <span className="aftag-highlight-text">{anchor.text}</span>}
          </div>
          <div className="aftag-highlight-chips">
            {CHIPS.map((id) => (
              <button key={id} type="button" className="aftag-chip" onClick={() => onChip(id)}>
                {id}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
