import { type FC } from 'react';

import { MdChevronLeft } from 'react-icons/md';

import { IconButton } from '@universe-forma/ui-pes';

import type { IconType } from 'react-icons';

import { CLIP_KIND_TO_TAB, TOOL_TABS, type AspectRatioOption, type TimelineClip } from '../../model/editorData';
import { AddPanel } from './drawer/AddPanel';
import { CanvasPanel } from './drawer/CanvasPanel';
import { ClipSettingsPanel } from './drawer/ClipSettingsPanel';

interface ContentDrawerProps {
  activeTabId: string;
  selectedClip: TimelineClip | null;
  onExitEdit: () => void;
  onAddText: (label: string, styleClassName?: string) => void;
  onAddAudio: (label: string) => void;
  onAddImage: (gradient: string, src?: string) => void;
  onAddVideo: (gradient: string, src?: string) => void;
  onAddElement: (payload: { label?: string; icon?: IconType; category?: string }) => void;
  onAddSubtitle: (label: string) => void;
  onAddTts: (label: string) => void;
  onDeleteClip: () => void;
  onLayout: (
    clipId: string,
    patch: Partial<{ rotation: number; flipH: boolean; flipV: boolean; color: string }>
  ) => void;
  /** Edit a text clip's content from the Text tab's text box. */
  onEditText: (clipId: string, label: string) => void;
  /** Canvas tab aspect ratio (shared with the preview stage). */
  canvasAspect: AspectRatioOption;
  onSelectAspect: (option: AspectRatioOption) => void;
  /** When provided (mobile sheet), shows a collapse button that dismisses the sheet. */
  onClose?: () => void;
}

/**
 * Titled panel showing the active tool's content. When the active tab matches a
 * selected timeline item, it opens in edit state ("Edit [Type]") with a back
 * arrow that returns to the tab's default Add state; otherwise it shows Add.
 */
export const ContentDrawer: FC<ContentDrawerProps> = ({
  activeTabId,
  selectedClip,
  onExitEdit,
  onAddText,
  onAddAudio,
  onAddImage,
  onAddVideo,
  onAddElement,
  onAddSubtitle,
  onAddTts,
  onDeleteClip,
  onLayout,
  onEditText,
  canvasAspect,
  onSelectAspect,
  onClose
}) => {
  const tab = TOOL_TABS.find((t) => t.id === activeTabId);
  const isEditing = !!selectedClip && CLIP_KIND_TO_TAB[selectedClip.kind] === activeTabId;
  // Singular labels for the "Edit <Type>" title (plural tab names read wrong there).
  const EDIT_LABELS: Record<string, string> = {
    images: 'Image',
    elements: 'Element',
    subtitles: 'subtitle',
    tts: 'text to speech'
  };
  const editLabel = EDIT_LABELS[activeTabId] ?? tab?.label;

  const renderBody = () => {
    if (isEditing && selectedClip)
      return (
        <ClipSettingsPanel
          clip={selectedClip}
          onDelete={onDeleteClip}
          onLayout={onLayout}
          onEditText={onEditText}
        />
      );
    if (activeTabId === 'canvas')
      return (
        <CanvasPanel
          aspect={canvasAspect}
          onSelectAspect={onSelectAspect}
        />
      );
    if (tab?.addable)
      return (
        <AddPanel
          tabId={activeTabId}
          onAddText={onAddText}
          onAddAudio={onAddAudio}
          onAddImage={onAddImage}
          onAddVideo={onAddVideo}
          onAddElement={onAddElement}
          onAddSubtitle={onAddSubtitle}
          onAddTts={onAddTts}
        />
      );
    return <p className='text-body-2 text-text-secondary'>No {tab?.label.toLowerCase()} added yet.</p>;
  };

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col bg-bg-white-bg md:w-[292px]'>
      {/* Pinned header: grab handle + title + divider stay put while the content scrolls. */}
      <div className='flex shrink-0 flex-col gap-4 px-4 pt-4'>
        {onClose && (
          <button
            type='button'
            aria-label='Close'
            onClick={onClose}
            className='mx-auto -mt-1 h-1 w-10 rounded-full bg-os-divider'
          />
        )}
        <div className='flex h-11 items-center gap-1 border-b border-os-divider'>
          {isEditing && (
            <IconButton
              variant='text'
              color='action'
              size='sm'
              aria-label='Back'
              onClick={onExitEdit}
            >
              <MdChevronLeft className='size-5' />
            </IconButton>
          )}
          <h2 className='text-subtitle-emph text-text-primary'>{isEditing ? `Edit ${editLabel}` : tab?.label}</h2>
        </div>
      </div>
      {/* Scrollable content */}
      <div className='min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-4'>{renderBody()}</div>
    </div>
  );
};
