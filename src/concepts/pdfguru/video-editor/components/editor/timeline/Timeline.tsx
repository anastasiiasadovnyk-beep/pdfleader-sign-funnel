import { type FC, useCallback, useEffect, useRef } from 'react';

import { BASE_PX_PER_SECOND, TOTAL_DURATION_SEC, type TimelineTrack } from '../../../model/editorData';
import { TimelineControls } from './TimelineControls';
import { TimelineRuler } from './TimelineRuler';
import { TimelineTracks } from './TimelineTracks';

interface TimelineProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  playheadSec: number;
  onScrub: (sec: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  tracks: TimelineTrack[];
  selectedClipId: string | null;
  onSelectClip: (clipId: string | null) => void;
  onBeginChange: () => void;
  onUpdateClip: (trackId: string, clipId: string, startSec: number, endSec: number) => void;
  onMoveClipToTrack: (clipId: string, targetTrackId: string) => void;
  onDeleteClip: () => void;
  onSplitClip: (atSec: number) => void;
  /** Layer the selected element up / down (bring forward / send backward). */
  onBringForward: () => void;
  onSendBackward: () => void;
  /** Mobile: open the selected clip's tab in edit state (from the header Edit button). */
  onEditSelected: () => void;
  /** Boot "preparing" state — the video clip is still processing. */
  preparing?: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Timeline (Screen 3): controls row, a time ruler with a draggable playhead and
 * the stacked track rows, all sharing one seconds→pixels scale driven by zoom.
 */
export const Timeline: FC<TimelineProps> = ({
  isPlaying,
  onTogglePlay,
  playheadSec,
  onScrub,
  zoom,
  onZoomChange,
  tracks,
  selectedClipId,
  onSelectClip,
  onBeginChange,
  onUpdateClip,
  onMoveClipToTrack,
  onDeleteClip,
  onSplitClip,
  onBringForward,
  onSendBackward,
  onEditSelected,
  preparing
}) => {
  const pxPerSec = BASE_PX_PER_SECOND * zoom;
  const totalWidth = TOTAL_DURATION_SEC * pxPerSec;
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mobile default: set the initial zoom so ~60s of ruler fills the visible
  // timeline width (desktop keeps the default zoom). Runs once, on mount.
  const didFitMobile = useRef(false);
  useEffect(() => {
    if (didFitMobile.current) return;
    const el = scrollRef.current;
    if (!el) return;
    didFitMobile.current = true;
    if (!window.matchMedia('(max-width: 1023px)').matches) return;
    const contentWidth = el.clientWidth - 32; // px-4 both sides
    onZoomChange(clamp(contentWidth / (60 * BASE_PX_PER_SECOND), 0.5, 3));
  }, [onZoomChange]);

  const selectedClip = tracks.flatMap((track) => track.clips).find((clip) => clip.id === selectedClipId);
  const canSplit = !!selectedClip && playheadSec > selectedClip.startSec && playheadSec < selectedClip.endSec;

  const scrubToClientX = useCallback(
    (clientX: number) => {
      const el = contentRef.current;
      if (!el) return;
      const x = clientX - el.getBoundingClientRect().left;
      onScrub(clamp(x / pxPerSec, 0, TOTAL_DURATION_SEC));
    },
    [onScrub, pxPerSec]
  );

  const startScrub = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      onSelectClip(null);
      scrubToClientX(event.clientX);
      const onMove = (e: PointerEvent) => scrubToClientX(e.clientX);
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [scrubToClientX, onSelectClip]
  );

  return (
    <div className='flex flex-col overflow-hidden rounded-t-5 bg-bg-white-bg md:mx-3 md:mb-3 md:rounded-6'>
      <TimelineControls
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        playheadSec={playheadSec}
        zoom={zoom}
        onZoomChange={onZoomChange}
        canSplit={canSplit}
        onSplit={() => onSplitClip(playheadSec)}
        canDelete={selectedClipId !== null}
        onDelete={onDeleteClip}
        canReorder={selectedClipId !== null}
        onBringForward={onBringForward}
        onSendBackward={onSendBackward}
        onEdit={onEditSelected}
      />

      {/* One scroll container (both axes). The ruler is sticky so it stays
          pinned to the top while the layer rows scroll vertically (capped so the
          layers area never exceeds 280px), and the vertical scrollbar sits at the
          visible right edge. */}
      <div
        ref={scrollRef}
        className='max-h-[308px] overflow-auto px-4 pb-4'
      >
        <div
          ref={contentRef}
          className='relative'
          style={{ width: totalWidth }}
        >
          <div
            className='sticky top-0 z-[4] cursor-pointer bg-bg-white-bg'
            onPointerDown={startScrub}
          >
            <TimelineRuler
              pxPerSec={pxPerSec}
              durationSec={TOTAL_DURATION_SEC}
            />
          </div>

          <TimelineTracks
            tracks={tracks}
            pxPerSec={pxPerSec}
            selectedClipId={selectedClipId}
            onSelectClip={onSelectClip}
            onBeginChange={onBeginChange}
            onUpdateClip={onUpdateClip}
            onMoveClipToTrack={onMoveClipToTrack}
            preparing={preparing}
          />

          {/* Draggable playhead spanning the ruler + visible layers area */}
          <div
            className='pointer-events-none absolute top-0 bottom-0 z-[5] w-px bg-material-red-400'
            style={{ left: playheadSec * pxPerSec }}
          >
            <span
              className='pointer-events-auto sticky top-0 -ml-[7px] block size-3.5 -translate-y-0.5 cursor-ew-resize rounded-t-sm rounded-b-2 bg-material-red-400'
              onPointerDown={startScrub}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
