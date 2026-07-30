import { type CSSProperties, type FC, useEffect, useRef, useState } from 'react';

import 'material-symbols/rounded.css';

import { IconButton, cn } from '@universe-forma/ui-pes';

import { layerRank, type TimelineClip } from '../../model/editorData';
import { CanvasElement } from './CanvasElement';
import { Tooltip } from './Tooltip';

type LayoutPatch = Partial<{
  xPct: number;
  yPct: number;
  scale: number;
  rotation: number;
}>;

/** Material Symbols undo/redo glyphs: 24px, weight 300. */
const ICON_STYLE: CSSProperties = { fontSize: 24, fontVariationSettings: "'wght' 300, 'opsz' 24" };

interface EditorCanvasProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** Video layers — fitted to the canvas by default, placed like any other element. */
  videoClips: TimelineClip[];
  /** Text layers rendered as editable overlays on the stage. */
  textClips: TimelineClip[];
  /** Image layers rendered as selectable overlays on the stage. */
  imageClips: TimelineClip[];
  /** Shape / sticker / emoji layers rendered as selectable overlays. */
  shapeClips: TimelineClip[];
  /** Subtitle captions rendered on top of everything, bottom-center of the stage. */
  subtitleClips: TimelineClip[];
  /** Canvas aspect ratio, e.g. '16:9' — applied live to the preview stage. */
  aspectRatio: string;
  selectedClipId: string | null;
  onSelectClip: (clipId: string | null) => void;
  onEditText: (clipId: string, label: string) => void;
  onLayout: (clipId: string, patch: LayoutPatch) => void;
}

/**
 * Canvas / viewer: the video preview on a neutral stage with a floating
 * undo/redo toolbar, plus movable / resizable / rotatable overlay elements.
 */
export const EditorCanvas: FC<EditorCanvasProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  videoClips,
  textClips,
  imageClips,
  shapeClips,
  subtitleClips,
  aspectRatio,
  selectedClipId,
  onSelectClip,
  onEditText,
  onLayout
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  // Video sits at the bottom of the stack; overlays render on top, with
  // subtitles last of all so captions sit above every other layer.
  // Stacking: default kind order (video → image → text → shape → subtitle), then
  // any per-clip `z` overrides from Bring forward / Send backward. Stable sort
  // keeps the kind grouping for ties.
  const elements = [...videoClips, ...imageClips, ...textClips, ...shapeClips, ...subtitleClips].sort(
    (a, b) => layerRank(a) - layerRank(b)
  );

  // Zoom the preview: desktop = trackpad pinch (wheel + ctrlKey), mobile =
  // two-finger pinch. Clamped to 0.5×–3×.
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  zoomRef.current = zoom;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const clampZoom = (value: number) => Math.min(3, Math.max(0.5, value));

    const onWheel = (event: WheelEvent) => {
      // A trackpad pinch (and Ctrl+wheel) arrives as a wheel event with ctrlKey;
      // plain scrolling is left alone.
      if (!event.ctrlKey) return;
      event.preventDefault();
      setZoom((z) => clampZoom(z * Math.exp(-event.deltaY * 0.01)));
    };

    const distance = (touches: TouchList) =>
      Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
    let startDist = 0;
    let startZoom = 1;

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) return;
      startDist = distance(event.touches);
      startZoom = zoomRef.current;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 2 || startDist === 0) return;
      event.preventDefault();
      setZoom(clampZoom((startZoom * distance(event.touches)) / startDist));
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) startDist = 0;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // Largest box with the chosen ratio that fits the (padded) preview area, centered.
  // Uses container-query units so it contains for both landscape and portrait ratios.
  const [w, h] = aspectRatio.split(':').map(Number);
  const stageStyle: CSSProperties = {
    aspectRatio: `${w} / ${h}`,
    width: `min(100cqw, calc(100cqh * ${w / h}), 48rem)`,
    transform: `scale(${zoom})`,
    transformOrigin: 'center'
  };

  return (
    <div
      ref={viewportRef}
      className='relative flex flex-1 touch-none items-center justify-center overflow-hidden bg-bg-light-grey p-4 [container-type:size] md:p-8'
    >
      <div className='absolute top-4 right-4 z-10 hidden items-center gap-1 rounded-3 bg-bg-white-bg p-1 shadow-sm md:flex'>
        <Tooltip label='Undo'>
          <IconButton
            variant='text'
            color='action'
            size='sm'
            aria-label='Undo'
            disabled={!canUndo}
            onClick={onUndo}
            className={cn(canUndo && '!text-text-primary')}
          >
            <span
              aria-hidden='true'
              className='material-symbols-rounded leading-none'
              style={ICON_STYLE}
            >
              undo
            </span>
          </IconButton>
        </Tooltip>
        <Tooltip label='Redo'>
          <IconButton
            variant='text'
            color='action'
            size='sm'
            aria-label='Redo'
            disabled={!canRedo}
            onClick={onRedo}
            className={cn(canRedo && '!text-text-primary')}
          >
            <span
              aria-hidden='true'
              className='material-symbols-rounded leading-none'
              style={ICON_STYLE}
            >
              redo
            </span>
          </IconButton>
        </Tooltip>
      </div>

      {/* Output frame — resizes live to the selected aspect ratio, staying centered. */}
      <div
        ref={stageRef}
        onPointerDown={() => onSelectClip(null)}
        style={stageStyle}
        className='relative overflow-hidden bg-slate-900 shadow-[0_8px_30px_-8px_rgba(33,33,52,0.25)]'
      >
        {elements.map((clip) => (
          <CanvasElement
            key={clip.id}
            clip={clip}
            isSelected={selectedClipId === clip.id}
            stageRef={stageRef}
            onSelect={onSelectClip}
            onLayout={onLayout}
            onEditText={onEditText}
          />
        ))}
      </div>
    </div>
  );
};
