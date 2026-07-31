import { type FC, useLayoutEffect, useRef, useState } from 'react';

import 'material-symbols/rounded.css';

import { MdOutlineAudiotrack, MdOutlineCategory, MdOutlineImage, MdOutlineTextFields } from 'react-icons/md';

import { cn } from '@universe-forma/ui-pes';

import {
  OVERLAY_ROW_HEIGHT_PX,
  TOTAL_DURATION_SEC,
  VIDEO_ROW_HEIGHT_PX,
  isCanvasClip,
  layerRank,
  type TimelineClip,
  type TimelineTrack
} from '../../../model/editorData';

/** Shortest a clip can be trimmed to, in seconds. */
const MIN_CLIP_SEC = 2;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Seconds → MM:SS.d (tenths), matching the drag tooltip precision. */
const formatDragTime = (sec: number): string => {
  const clamped = Math.max(0, sec);
  const mm = Math.floor(clamped / 60);
  const ss = Math.floor(clamped % 60);
  const tenths = Math.floor((clamped * 10) % 10);
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}.${tenths}`;
};

/**
 * Track pointer movement on the window until release. `onFirstMove` fires once
 * when a real drag starts (so a plain click never records an undo step), then
 * `onDelta` reports the running delta in seconds.
 */
const trackPointer = (
  originX: number,
  pxPerSec: number,
  onFirstMove: () => void,
  onDelta: (deltaSec: number) => void
) => {
  let moved = false;
  const onMove = (event: PointerEvent) => {
    if (!moved) {
      moved = true;
      onFirstMove();
    }
    onDelta((event.clientX - originX) / pxPerSec);
  };
  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
};

type TrimEdge = 'start' | 'end';

const TrimHandle: FC<{ edge: TrimEdge; onPointerDown: (event: React.PointerEvent) => void }> = ({
  edge,
  onPointerDown
}) => (
  <span
    onPointerDown={onPointerDown}
    className={cn(
      'absolute inset-y-0 z-[2] flex w-3 cursor-ew-resize touch-none items-center justify-center bg-bg-white-bg/85',
      edge === 'start' ? 'left-0 rounded-l-2' : 'right-0 rounded-r-2'
    )}
  >
    <span className='h-1/2 w-0.5 rounded-full bg-text-primary/30' />
  </span>
);

interface ClipProps {
  clip: TimelineClip;
  trackId: string;
  pxPerSec: number;
  isSelected: boolean;
  onSelect: (clipId: string) => void;
  onBeginChange: () => void;
  onUpdate: (trackId: string, clipId: string, startSec: number, endSec: number) => void;
  onMoveToTrack: (clipId: string, targetTrackId: string) => void;
  onDragOverRow: (targetTrackId: string | null) => void;
  preparing?: boolean;
}

const Clip: FC<ClipProps> = ({
  clip,
  trackId,
  pxPerSec,
  isSelected,
  onSelect,
  onBeginChange,
  onUpdate,
  onMoveToTrack,
  onDragOverRow,
  preparing
}) => {
  const { startSec, endSec } = clip;
  const left = startSec * pxPerSec;
  const width = (endSec - startSec) * pxPerSec;
  const duration = endSec - startSec;
  const [dragging, setDragging] = useState(false);

  const startTrim = (edge: TrimEdge) => (event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect(clip.id);
    trackPointer(event.clientX, pxPerSec, onBeginChange, (deltaSec) => {
      if (edge === 'start') {
        onUpdate(trackId, clip.id, clamp(startSec + deltaSec, 0, endSec - MIN_CLIP_SEC), endSec);
      } else {
        onUpdate(trackId, clip.id, startSec, clamp(endSec + deltaSec, startSec + MIN_CLIP_SEC, TOTAL_DURATION_SEC));
      }
    });
  };

  const startMove = (event: React.PointerEvent) => {
    event.preventDefault();
    onSelect(clip.id);
    const originX = event.clientX;
    const canReorder = clip.kind !== 'audio';
    let moved = false;
    let lastX = event.clientX;
    let lastY = event.clientY;

    // The valid drop row under the pointer (a different, non-audio row), or null.
    const rowUnderPointer = () => {
      const row = document.elementFromPoint(lastX, lastY)?.closest('[data-track-id]');
      const id = row?.getAttribute('data-track-id');
      const kind = row?.getAttribute('data-track-kind');
      return id && id !== trackId && kind !== 'audio' ? id : null;
    };

    const onMove = (moveEvent: PointerEvent) => {
      lastX = moveEvent.clientX;
      lastY = moveEvent.clientY;
      if (!moved) {
        moved = true;
        onBeginChange();
        setDragging(true);
      }
      const nextStart = clamp(startSec + (moveEvent.clientX - originX) / pxPerSec, 0, TOTAL_DURATION_SEC - duration);
      onUpdate(trackId, clip.id, nextStart, nextStart + duration);
      if (canReorder) onDragOverRow(rowUnderPointer());
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      onDragOverRow(null);
      setDragging(false);
      if (!moved) return;
      // Dropped on another row → move it there (packed at the row's end).
      // Dropped in place → keep exactly where the user released it.
      const target = canReorder ? rowUnderPointer() : null;
      if (target) onMoveToTrack(clip.id, target);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const selectedRing = isSelected && 'ring-2 ring-primary';
  const handles = (
    <>
      <TrimHandle
        edge='start'
        onPointerDown={startTrim('start')}
      />
      <TrimHandle
        edge='end'
        onPointerDown={startTrim('end')}
      />
    </>
  );

  // Start-time tooltip shown above the item's left edge while dragging.
  const tooltip = dragging ? (
    <span
      className='pointer-events-none absolute -top-6 z-[6] whitespace-nowrap rounded bg-text-primary px-1.5 py-0.5 text-caption-xs text-common-white'
      style={{ left }}
    >
      {formatDragTime(startSec)}
    </span>
  ) : null;

  let content;
  if (clip.kind === 'text') {
    content = (
      <div
        onPointerDown={startMove}
        className={cn(
          'absolute inset-y-0 flex cursor-grab items-center gap-1.5 overflow-hidden rounded-2 border border-os-divider bg-bg-white-bg pr-3 pl-4 touch-none active:cursor-grabbing',
          selectedRing
        )}
        style={{ left, width }}
      >
        {handles}
        <MdOutlineTextFields className='size-4 shrink-0 text-text-secondary' />
        <span className='truncate text-caption text-text-primary'>{clip.label}</span>
      </div>
    );
  } else if (clip.kind === 'image') {
    // Purple chip with the Images-tab icon and the "Image" label.
    content = (
      <div
        onPointerDown={startMove}
        className={cn(
          'absolute inset-y-0 flex cursor-grab items-center gap-1.5 overflow-hidden rounded-2 px-4 touch-none active:cursor-grabbing',
          selectedRing
        )}
        style={{ left, width, backgroundColor: '#F7C5FF' }}
      >
        {handles}
        <MdOutlineImage className='size-4 shrink-0 text-text-primary' />
        <span className='truncate text-caption text-text-primary'>Image</span>
      </div>
    );
  } else if (clip.kind === 'audio') {
    content = (
      <div
        onPointerDown={startMove}
        className={cn(
          'absolute inset-y-0 flex cursor-grab items-center gap-1.5 overflow-hidden rounded-2 bg-blue-100 pr-3 pl-4 text-blue-700 touch-none active:cursor-grabbing',
          selectedRing
        )}
        style={{ left, width }}
      >
        {handles}
        <MdOutlineAudiotrack className='size-4 shrink-0' />
        <span className='truncate text-caption'>{clip.label}</span>
      </div>
    );
  } else if (clip.kind === 'subtitle') {
    // Light-red chip (base palette / red-light) with the Subtitles-tab glyph.
    content = (
      <div
        onPointerDown={startMove}
        className={cn(
          'absolute inset-y-0 flex cursor-grab items-center gap-1.5 overflow-hidden rounded-2 bg-material-bp-red-light pr-3 pl-4 touch-none active:cursor-grabbing',
          selectedRing
        )}
        style={{ left, width }}
      >
        {handles}
        <span
          aria-hidden='true'
          className='material-symbols-rounded shrink-0 leading-none text-text-primary'
          style={{ fontSize: 16, fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
        >
          subtitles
        </span>
        <span className='truncate text-caption text-text-primary'>{clip.label || 'Subtitle'}</span>
      </div>
    );
  } else if (clip.kind === 'tts') {
    // Light-blue chip (base palette / blue-light) with the TTS-tab glyph.
    content = (
      <div
        onPointerDown={startMove}
        className={cn(
          'absolute inset-y-0 flex cursor-grab items-center gap-1.5 overflow-hidden rounded-2 bg-material-bp-blue-light pr-3 pl-4 touch-none active:cursor-grabbing',
          selectedRing
        )}
        style={{ left, width }}
      >
        {handles}
        <span
          aria-hidden='true'
          className='material-symbols-rounded shrink-0 leading-none text-text-primary'
          style={{ fontSize: 16, fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
        >
          record_voice_over
        </span>
        <span className='truncate text-caption text-text-primary'>{clip.label || 'Text to speech'}</span>
      </div>
    );
  } else if (clip.kind === 'shape') {
    // Amber chip with the Elements-tab icon and the element's category label.
    content = (
      <div
        onPointerDown={startMove}
        className={cn(
          'absolute inset-y-0 flex cursor-grab items-center gap-1.5 overflow-hidden rounded-2 pr-3 pl-4 touch-none active:cursor-grabbing',
          selectedRing
        )}
        style={{ left, width, backgroundColor: '#FFEEB3' }}
      >
        {handles}
        <MdOutlineCategory className='size-4 shrink-0 text-text-primary' />
        <span className='truncate text-caption text-text-primary'>{clip.category ?? 'Element'}</span>
      </div>
    );
  } else if (preparing) {
    // Video still processing — a neutral "Preparing…" clip (no trim handles yet).
    content = (
      <div
        className='absolute inset-y-0 flex items-center justify-center overflow-hidden rounded-2 bg-os-divider'
        style={{ left, width }}
      >
        <span className='animate-pulse text-caption text-text-secondary'>Preparing…</span>
      </div>
    );
  } else {
    content = (
      <div
        onPointerDown={startMove}
        className={cn(
          'absolute inset-y-0 cursor-grab overflow-hidden rounded-2 bg-gradient-to-r touch-none active:cursor-grabbing',
          clip.tone,
          selectedRing
        )}
        style={{ left, width }}
      >
        {/* filmstrip frame separators */}
        <div className='absolute inset-0 [background-image:repeating-linear-gradient(90deg,transparent_0,transparent_46px,rgba(255,255,255,0.5)_46px,rgba(255,255,255,0.5)_48px)]' />
        {handles}
      </div>
    );
  }

  return (
    <>
      {content}
      {tooltip}
    </>
  );
};

interface TimelineTracksProps {
  tracks: TimelineTrack[];
  pxPerSec: number;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onBeginChange: () => void;
  onUpdateClip: (trackId: string, clipId: string, startSec: number, endSec: number) => void;
  onMoveClipToTrack: (clipId: string, targetTrackId: string) => void;
  preparing?: boolean;
}

/** Default layout: 4 rows (two 44px, two 32px) shown even when mostly empty. */
const MIN_ROWS = 4;
const DEFAULT_ROW_HEIGHTS = [VIDEO_ROW_HEIGHT_PX, VIDEO_ROW_HEIGHT_PX, OVERLAY_ROW_HEIGHT_PX, OVERLAY_ROW_HEIGHT_PX];

export const TimelineTracks: FC<TimelineTracksProps> = ({
  tracks,
  pxPerSec,
  selectedClipId,
  onSelectClip,
  onBeginChange,
  onUpdateClip,
  onMoveClipToTrack,
  preparing
}) => {
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // FLIP animation: when a row changes vertical position (e.g. Bring forward /
  // Send backward reorders the rows), slide it from its old spot to the new one
  // via a CSS transform transition, so the move is visible instead of a jump.
  const listRef = useRef<HTMLDivElement>(null);
  const rowTops = useRef<Map<string, number>>(new Map());
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-track-id]'));
    const seen = new Set<string>();
    rows.forEach((row) => {
      const id = row.dataset.trackId ?? '';
      seen.add(id);
      const top = row.offsetTop;
      const prev = rowTops.current.get(id);
      rowTops.current.set(id, top);
      if (prev === undefined || prev === top) return;
      row.style.transition = 'none';
      row.style.transform = `translateY(${prev - top}px)`;
      requestAnimationFrame(() => {
        row.style.transition = 'transform 220ms ease';
        row.style.transform = '';
      });
    });
    for (const id of rowTops.current.keys()) if (!seen.has(id)) rowTops.current.delete(id);
  });

  // A track's row position follows its front-most canvas clip's stacking rank, so
  // Bring forward / Send backward move the selected element's row up / down here
  // in step with the canvas. TTS then audio stay pinned at the bottom.
  const trackRank = (track: TimelineTrack) => {
    const canvasClips = track.clips.filter((clip) => isCanvasClip(clip.kind));
    return canvasClips.length ? Math.max(...canvasClips.map(layerRank)) : 0;
  };
  const canvasTracks = tracks
    .filter((track) => isCanvasClip(track.kind))
    .sort((a, b) => trackRank(b) - trackRank(a));
  const ttsTracks = tracks.filter((track) => track.kind === 'tts');
  const nonAudio = [...canvasTracks, ...ttsTracks];
  const audio = tracks.filter((track) => track.kind === 'audio');
  // Pad with empty placeholder rows (above the audio row) up to the default count.
  const placeholders = Array.from({ length: Math.max(0, MIN_ROWS - tracks.length) }, (_, index) => ({
    id: `placeholder-${index}`,
    height: DEFAULT_ROW_HEIGHTS[nonAudio.length + index] ?? OVERLAY_ROW_HEIGHT_PX
  }));

  const renderTrackRow = (track: TimelineTrack) => {
    // A row is 44px whenever it holds a video (even one dragged in from another
    // row); otherwise 32px. Clips use `inset-y-0`, so they stretch to fill it.
    const hasVideo = track.clips.some((clip) => clip.kind === 'video');
    return (
      <div
        key={track.id}
        data-track-id={track.id}
        data-track-kind={track.kind}
        className={cn('relative rounded-2', track.id === dropTargetId && 'bg-primary-opacity-8')}
        style={{ height: hasVideo ? VIDEO_ROW_HEIGHT_PX : OVERLAY_ROW_HEIGHT_PX }}
      >
        {track.clips.map((clip) => (
          <Clip
            key={clip.id}
            clip={clip}
            trackId={track.id}
            pxPerSec={pxPerSec}
            isSelected={clip.id === selectedClipId}
            onSelect={onSelectClip}
            onBeginChange={onBeginChange}
            onUpdate={onUpdateClip}
            onMoveToTrack={onMoveClipToTrack}
            onDragOverRow={setDropTargetId}
            preparing={preparing && clip.kind === 'video'}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      ref={listRef}
      className='flex flex-col gap-1 py-3'
    >
      {nonAudio.map(renderTrackRow)}
      {placeholders.map((placeholder) => (
        <div
          key={placeholder.id}
          style={{ height: placeholder.height }}
        />
      ))}
      {audio.map(renderTrackRow)}
    </div>
  );
};
