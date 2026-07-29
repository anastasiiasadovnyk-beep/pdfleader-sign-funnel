import { type CSSProperties, type FC, type RefObject, useRef, useState } from 'react';

import { MdRotateRight } from 'react-icons/md';

import { cn } from '@universe-forma/ui-pes';

import type { TimelineClip } from '../../model/editorData';

type LayoutPatch = Partial<{
  xPct: number;
  yPct: number;
  scale: number;
  rotation: number;
  cropW: number;
  cropH: number;
}>;

interface CanvasElementProps {
  clip: TimelineClip;
  isSelected: boolean;
  stageRef: RefObject<HTMLDivElement | null>;
  onSelect: (clipId: string) => void;
  onLayout: (clipId: string, patch: LayoutPatch) => void;
  onEditText: (clipId: string, label: string) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * 8 resize dots around the selection frame (corners + edge midpoints). Each is
 * pinned to a frame corner/edge and centered on it via `translate`, so the dot
 * size can be driven in constant pixels independent of the element's scale.
 * `axis` marks the crop direction for edge handles ('x' = width, 'y' = height);
 * corner handles (no axis) scale uniformly.
 */
const HANDLES: { pos: CSSProperties; translate: string; cursor: string; axis?: 'x' | 'y' }[] = [
  { pos: { top: 0, left: 0 }, translate: 'translate(-50%, -50%)', cursor: 'cursor-nwse-resize' },
  { pos: { top: 0, left: '50%' }, translate: 'translate(-50%, -50%)', cursor: 'cursor-ns-resize', axis: 'y' },
  { pos: { top: 0, right: 0 }, translate: 'translate(50%, -50%)', cursor: 'cursor-nesw-resize' },
  { pos: { top: '50%', left: 0 }, translate: 'translate(-50%, -50%)', cursor: 'cursor-ew-resize', axis: 'x' },
  { pos: { top: '50%', right: 0 }, translate: 'translate(50%, -50%)', cursor: 'cursor-ew-resize', axis: 'x' },
  { pos: { bottom: 0, left: 0 }, translate: 'translate(-50%, 50%)', cursor: 'cursor-nesw-resize' },
  { pos: { bottom: 0, left: '50%' }, translate: 'translate(-50%, 50%)', cursor: 'cursor-ns-resize', axis: 'y' },
  { pos: { bottom: 0, right: 0 }, translate: 'translate(50%, 50%)', cursor: 'cursor-nwse-resize' }
];

const onWindowDrag = (move: (event: PointerEvent) => void) => {
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
};

/** A movable / resizable / rotatable element on the canvas with a selection frame. */
export const CanvasElement: FC<CanvasElementProps> = ({
  clip,
  isSelected,
  stageRef,
  onSelect,
  onLayout,
  onEditText
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const { xPct = 50, yPct = 50, scale = 1, rotation = 0, flipH, flipV, cropW = 1, cropH = 1 } = clip;
  const isVideo = clip.kind === 'video';
  // The element is drawn scaled, so the selection chrome (border + handles) is
  // counter-scaled by 1/scale to keep a constant on-screen size at any zoom/scale.
  const inv = 1 / scale;

  const startMove = (event: React.PointerEvent) => {
    if (editing) return;
    event.stopPropagation();
    onSelect(clip.id);
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    onWindowDrag((ev) =>
      onLayout(clip.id, {
        xPct: clamp(xPct + ((ev.clientX - startX) / rect.width) * 100, 0, 100),
        yPct: clamp(yPct + ((ev.clientY - startY) / rect.height) * 100, 0, 100)
      })
    );
  };

  const startResize = (event: React.PointerEvent) => {
    event.stopPropagation();
    event.preventDefault();
    onSelect(clip.id);
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const startDist = Math.hypot(event.clientX - cx, event.clientY - cy) || 1;
    onWindowDrag((ev) => {
      const dist = Math.hypot(ev.clientX - cx, ev.clientY - cy);
      onLayout(clip.id, { scale: clamp((scale * dist) / startDist, 0.3, 5) });
    });
  };

  /** Crop a video's width ('x') or height ('y') by dragging an edge handle. */
  const startCrop = (axis: 'x' | 'y') => (event: React.PointerEvent) => {
    event.stopPropagation();
    event.preventDefault();
    onSelect(clip.id);
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const start = axis === 'x' ? cropW : cropH;
    const startDist = (axis === 'x' ? Math.abs(event.clientX - cx) : Math.abs(event.clientY - cy)) || 1;
    onWindowDrag((ev) => {
      const dist = axis === 'x' ? Math.abs(ev.clientX - cx) : Math.abs(ev.clientY - cy);
      const next = clamp((start * dist) / startDist, 0.1, 1);
      onLayout(clip.id, axis === 'x' ? { cropW: next } : { cropH: next });
    });
  };

  const startRotate = (event: React.PointerEvent) => {
    event.stopPropagation();
    event.preventDefault();
    onSelect(clip.id);
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    onWindowDrag((ev) => {
      const angle = (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90;
      onLayout(clip.id, { rotation: Math.round(angle) });
    });
  };

  let content;
  if (clip.kind === 'text') {
    content = (
      <div
        contentEditable={editing}
        suppressContentEditableWarning
        onDoubleClick={() => setEditing(true)}
        onPointerDown={editing ? (event) => event.stopPropagation() : undefined}
        onBlur={(event) => {
          setEditing(false);
          onEditText(clip.id, event.currentTarget.textContent ?? '');
        }}
        className={cn(
          'whitespace-nowrap px-1 text-2xl text-common-white outline-none [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]',
          editing ? 'cursor-text' : 'cursor-move',
          clip.styleClassName
        )}
      >
        {clip.label}
      </div>
    );
  } else if (clip.kind === 'image') {
    content = clip.src ? (
      <img
        src={clip.src}
        alt=''
        draggable={false}
        className='h-24 w-40 rounded object-cover'
      />
    ) : (
      <div className={cn('h-24 w-40 rounded bg-gradient-to-br', clip.tone)} />
    );
  } else if (clip.kind === 'shape') {
    const Icon = clip.icon;
    content = Icon ? (
      <Icon
        className='size-20 [filter:drop-shadow(0_1px_4px_rgba(0,0,0,0.35))]'
        style={{ color: clip.color ?? '#ffffff' }}
      />
    ) : (
      <span className='text-6xl leading-none [filter:drop-shadow(0_1px_4px_rgba(0,0,0,0.35))]'>{clip.label}</span>
    );
  } else if (clip.src) {
    // Uploaded video — fills its (crop-sized) box, showing the first frame.
    content = (
      <video
        src={clip.src}
        muted
        playsInline
        preload='metadata'
        className='h-full w-full object-cover'
      />
    );
  } else {
    // Stock video: the gradient stands in for the frames.
    content = <div className={cn('h-full w-full bg-gradient-to-br', clip.tone)} />;
  }

  return (
    <div
      ref={ref}
      onPointerDown={startMove}
      className='absolute select-none'
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        // Video is fitted to the stage (100% × 100%) then trimmed by its crop.
        ...(isVideo ? { width: `${cropW * 100}%`, height: `${cropH * 100}%` } : {}),
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale * (flipH ? -1 : 1)}, ${scale * (flipV ? -1 : 1)})`,
        transformOrigin: 'center'
      }}
    >
      {content}
      {isSelected && (
        // Selection frame: 4px (constant) outside the element, stroke a constant 2px.
        <div
          className='pointer-events-none absolute border-solid border-primary'
          style={{ inset: `${-4 * inv}px`, borderWidth: `${2 * inv}px` }}
        >
          {HANDLES.map((handle, index) => (
            <span
              key={index}
              onPointerDown={isVideo && handle.axis ? startCrop(handle.axis) : startResize}
              style={{
                ...handle.pos,
                width: `${10 * inv}px`,
                height: `${10 * inv}px`,
                borderWidth: `${2 * inv}px`,
                transform: handle.translate
              }}
              className={cn(
                'pointer-events-auto absolute rounded-full border-solid border-primary bg-common-white',
                handle.cursor
              )}
            />
          ))}
          <span
            onPointerDown={startRotate}
            style={{
              left: '50%',
              top: 0,
              width: `${20 * inv}px`,
              height: `${20 * inv}px`,
              borderWidth: `${2 * inv}px`,
              transform: `translate(-50%, calc(-100% - ${8 * inv}px))`
            }}
            className='pointer-events-auto absolute flex cursor-grab items-center justify-center rounded-full border-solid border-primary bg-common-white text-primary'
          >
            <MdRotateRight style={{ width: `${12 * inv}px`, height: `${12 * inv}px` }} />
          </span>
        </div>
      )}
    </div>
  );
};
