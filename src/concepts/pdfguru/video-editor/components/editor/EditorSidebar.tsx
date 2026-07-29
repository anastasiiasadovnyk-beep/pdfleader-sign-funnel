import { type FC } from 'react';

import type { IconType } from 'react-icons';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

import { cn } from '@universe-forma/ui-pes';

import type { AspectRatioOption, TimelineClip } from '../../model/editorData';
import { ContentDrawer } from './ContentDrawer';
import { ToolRail } from './ToolRail';

interface EditorSidebarProps {
  activeTabId: string;
  onSelectTab: (id: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  selectedClip: TimelineClip | null;
  onExitEdit: () => void;
  onAddText: (label: string, styleClassName?: string) => void;
  onAddAudio: (label: string) => void;
  onAddImage: (gradient: string, src?: string) => void;
  onAddVideo: (gradient: string, src?: string) => void;
  onAddElement: (payload: { label?: string; icon?: IconType; category?: string }) => void;
  onDeleteClip: () => void;
  onLayout: (
    clipId: string,
    patch: Partial<{ rotation: number; flipH: boolean; flipV: boolean; color: string }>
  ) => void;
  onEditText: (clipId: string, label: string) => void;
  canvasAspect: AspectRatioOption;
  onSelectAspect: (option: AspectRatioOption) => void;
}

/**
 * The whole left sidebar: attached tool rail + content drawer, plus a chevron
 * handle on the outer edge that collapses / expands both parts together.
 */
export const EditorSidebar: FC<EditorSidebarProps> = ({
  activeTabId,
  onSelectTab,
  isCollapsed,
  onToggle,
  selectedClip,
  onExitEdit,
  onAddText,
  onAddAudio,
  onAddImage,
  onAddVideo,
  onAddElement,
  onDeleteClip,
  onLayout,
  onEditText,
  canvasAspect,
  onSelectAspect
}) => (
  <div className='relative hidden h-full shrink-0 py-3 pl-3 md:flex'>
    <div className='flex h-full overflow-hidden rounded-6 bg-bg-white-bg shadow-[0_8px_30px_-10px_rgba(33,33,52,0.18)]'>
      {/* Tool rail stays visible; only the content drawer collapses. */}
      <ToolRail
        activeTabId={activeTabId}
        onSelect={onSelectTab}
      />
      <div
        className={cn(
          'flex h-full flex-col overflow-hidden transition-[width] duration-300',
          isCollapsed ? 'w-0' : 'w-[292px]'
        )}
      >
        <ContentDrawer
          activeTabId={activeTabId}
          selectedClip={selectedClip}
          onExitEdit={onExitEdit}
          onAddText={onAddText}
          onAddAudio={onAddAudio}
          onAddImage={onAddImage}
          onAddVideo={onAddVideo}
          onAddElement={onAddElement}
          onDeleteClip={onDeleteClip}
          onLayout={onLayout}
          onEditText={onEditText}
          canvasAspect={canvasAspect}
          onSelectAspect={onSelectAspect}
        />
      </div>
    </div>

    <button
      type='button'
      onClick={onToggle}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className='absolute top-1/2 -right-3 z-[2] flex h-12 w-6 -translate-y-1/2 items-center justify-center rounded-2 border border-os-divider bg-bg-white-bg text-text-secondary shadow-[0_4px_16px_-4px_rgba(33,33,52,0.2)] transition-colors hover:text-text-primary'
    >
      {isCollapsed ? <MdChevronRight className='size-4' /> : <MdChevronLeft className='size-4' />}
    </button>
  </div>
);
