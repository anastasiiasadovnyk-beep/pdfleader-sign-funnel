import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TrimState } from '../types';
import { formatClock, pct, rulerMarkers, rulerStep } from '../lib/timeline';

type TrimTimelineProps = {
  durationSec: number;
  trim: TrimState;
  /** Hard cap on the selection length (the window can shrink below it, never grow past it). */
  maxClipSec: number;
  /** Smallest allowed selection so the band never collapses to nothing. */
  minClipSec?: number;
  hint: string;
  onChange: (trim: TrimState) => void;
};

type DragMode = 'start' | 'end' | 'move';
type DragState = { mode: DragMode; pointerX: number; origStart: number; origEnd: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The trim player: a seconds ruler over a track carrying a draggable selection.
 * Drag a handle to trim one edge (shrink-only past the cap); drag the band to
 * slide the whole window. Positions are percentages of the duration so the track
 * stays fluid; drag math converts pointer pixels to seconds via the track rect. */
export default function TrimTimeline({
  durationSec,
  trim,
  maxClipSec,
  minClipSec = 1,
  hint,
  onChange,
}: TrimTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);

  const markers = rulerMarkers(durationSec, rulerStep(durationSec));
  const startPct = pct(trim.startSec, durationSec);
  const endPct = pct(trim.endSec, durationSec);
  const widthPct = Math.max(0, endPct - startPct);

  const secPerPx = () => durationSec / (trackRef.current?.clientWidth || 1);

  const beginDrag = (mode: DragMode) => (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { mode, pointerX: e.clientX, origStart: trim.startSec, origEnd: trim.endSec };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const delta = (e.clientX - d.pointerX) * secPerPx();
    let { origStart: start, origEnd: end } = d;

    if (d.mode === 'start') {
      // Left edge: never crosses the right edge (min gap) and never opens past the cap.
      start = clamp(d.origStart + delta, Math.max(0, d.origEnd - maxClipSec), d.origEnd - minClipSec);
    } else if (d.mode === 'end') {
      // Right edge: bounded by the clip end and by start + cap.
      end = clamp(d.origEnd + delta, d.origStart + minClipSec, Math.min(durationSec, d.origStart + maxClipSec));
    } else {
      // Whole window slides, keeping its length.
      const width = d.origEnd - d.origStart;
      start = clamp(d.origStart + delta, 0, durationSec - width);
      end = start + width;
    }
    onChange({ startSec: start, endSec: end });
  };

  const endDrag = (e: ReactPointerEvent) => {
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="flex flex-col gap-4 px-5 pt-3 pb-8">
      <p data-ff="hint" className="text-center text-body-2 text-text-secondary">
        {hint}
      </p>

      <div className="relative select-none">
        {/* ruler */}
        <div className="relative h-6">
          {markers.map((sec, i) => {
            const isEnd = i === markers.length - 1;
            return (
              <div key={sec} className="absolute top-0 bottom-0" style={{ left: `${pct(sec, durationSec)}%` }}>
                <span className="absolute top-0 h-2 w-px bg-os-divider" />
                <span
                  data-ff={i === 0 ? 'ruler-label' : undefined}
                  className={`absolute top-2.5 text-caption leading-none whitespace-nowrap text-text-secondary ${
                    isEnd ? '-translate-x-full' : ''
                  }`}
                >
                  {formatClock(sec)}
                </span>
              </div>
            );
          })}
        </div>

        {/* track */}
        <div ref={trackRef} className="relative mt-1 h-10 rounded-2 bg-bg-light-grey">
          <div
            data-ff="trim-band"
            onPointerDown={beginDrag('move')}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            className="absolute inset-y-1 cursor-grab touch-none rounded-2 border-2 border-primary bg-primary-opacity-16 active:cursor-grabbing"
            style={{ left: `${startPct}%`, width: `${widthPct}%` }}
          >
            {/* left / right grab handles (wide hit area, thin visible bar) */}
            <span
              role="slider"
              aria-label="Trim start"
              aria-valuenow={Math.round(trim.startSec)}
              onPointerDown={beginDrag('start')}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              className="absolute top-1/2 left-0 flex h-8 w-4 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none items-center justify-center"
            >
              <span className="h-6 w-1.5 rounded-full bg-primary" />
            </span>
            <span
              role="slider"
              aria-label="Trim end"
              aria-valuenow={Math.round(trim.endSec)}
              onPointerDown={beginDrag('end')}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              className="absolute top-1/2 right-0 flex h-8 w-4 translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none items-center justify-center"
            >
              <span className="h-6 w-1.5 rounded-full bg-primary" />
            </span>

            {/* start / end timecode badges */}
            <span
              data-ff="badge-start"
              className="absolute -bottom-6 left-0 -translate-x-1/2 rounded-1 bg-bg-dark px-1.5 py-0.5 text-caption-xs text-common-white"
            >
              {formatClock(trim.startSec)}
            </span>
            <span className="absolute -bottom-6 right-0 translate-x-1/2 rounded-1 bg-bg-dark px-1.5 py-0.5 text-caption-xs text-common-white">
              {formatClock(trim.endSec)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
