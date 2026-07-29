import { type CSSProperties, type FC, useRef } from 'react';

import 'material-symbols/rounded.css';

import { IconButton } from '@universe-forma/ui-pes';

import type { TimelineClip } from '../../model/editorData';
import { CanvasElement } from './CanvasElement';

type LayoutPatch = Partial<{
  xPct: number;
  yPct: number;
  scale: number;
  rotation: number;
  cropW: number;
  cropH: number;
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
  aspectRatio,
  selectedClipId,
  onSelectClip,
  onEditText,
  onLayout
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  // Video sits at the bottom of the stack; overlays (image/text/shape) render on top.
  const elements = [...videoClips, ...imageClips, ...textClips, ...shapeClips];

  // Largest box with the chosen ratio that fits the (padded) preview area, centered.
  // Uses container-query units so it contains for both landscape and portrait ratios.
  const [w, h] = aspectRatio.split(':').map(Number);
  const stageStyle: CSSProperties = {
    aspectRatio: `${w} / ${h}`,
    width: `min(100cqw, calc(100cqh * ${w / h}), 48rem)`
  };

  return (
    <div className='relative flex flex-1 items-center justify-center overflow-hidden bg-bg-light-grey p-4 [container-type:size] md:p-8'>
      <div className='absolute top-4 right-4 z-10 hidden items-center gap-1 rounded-3 border border-os-divider bg-bg-white-bg p-1 shadow-sm md:flex'>
        <IconButton
          variant='text'
          color='action'
          size='sm'
          aria-label='Undo'
          disabled={!canUndo}
          onClick={onUndo}
        >
          <span
            aria-hidden='true'
            className='material-symbols-rounded leading-none'
            style={ICON_STYLE}
          >
            undo
          </span>
        </IconButton>
        <IconButton
          variant='text'
          color='action'
          size='sm'
          aria-label='Redo'
          disabled={!canRedo}
          onClick={onRedo}
        >
          <span
            aria-hidden='true'
            className='material-symbols-rounded leading-none'
            style={ICON_STYLE}
          >
            redo
          </span>
        </IconButton>
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
