import { type FC, useCallback, useEffect } from 'react';

import type { IconType } from 'react-icons';

import { cn } from '@universe-forma/ui-pes';

import { useLocaleNavigate } from 'hooks/useLocaleNavigate';
import { useMediaQuery } from 'hooks/useMediaQuery';

import { ContentDrawer } from '../components/editor/ContentDrawer';
import { EditorCanvas } from '../components/editor/EditorCanvas';
import { EditorHeader } from '../components/editor/EditorHeader';
import { EditorSidebar } from '../components/editor/EditorSidebar';
import { ToolRail } from '../components/editor/ToolRail';
import { Timeline } from '../components/editor/timeline/Timeline';
import { useEditorState } from '../hooks/useEditorState';
import { useTimelineEditor } from '../hooks/useTimelineEditor';
import { CLIP_KIND_TO_TAB, type TimelineClip } from '../model/editorData';
import type { ExportFormat } from '../model/constants';
import { VIDEO_EDITOR_ROUTES } from '../model/constants';

/**
 * Screen 3 — Editor. Composes the top bar, the collapsible left sidebar
 * (tool rail + content drawer), the canvas/viewer and the multi-track timeline.
 * Choosing an export format will open the result modal (Screen 4).
 */
export const VideoEditorPage: FC = () => {
  const navigate = useLocaleNavigate();
  const editor = useEditorState();
  const timeline = useTimelineEditor();
  // Desktop = the sidebar layout (>= md / 1024px, matching the `md:` CSS split).
  const isDesktop = useMediaQuery('min-md');

  const handleBack = useCallback(() => navigate(VIDEO_EDITOR_ROUTES.landing), [navigate]);

  const handleSelectFormat = useCallback((_format: ExportFormat) => {
    // Screen 4 (result processing modal) hooks in here next.
  }, []);

  // Locate the selected clip so the sidebar can open it in edit state.
  const allClips = timeline.tracks.flatMap((track) => track.clips);
  const selectedClip = allClips.find((clip) => clip.id === timeline.selectedClipId) ?? null;

  // A clip is on the canvas only while the playhead sits within its span — the
  // frame at the current playhead, so scrubbing updates the preview live. The
  // selected clip stays visible regardless, so it can always be edited.
  const onStage = (clip: TimelineClip) =>
    clip.id === timeline.selectedClipId || (editor.playheadSec >= clip.startSec && editor.playheadSec < clip.endSec);

  const textClips = allClips.filter((clip) => clip.kind === 'text' && onStage(clip));
  const imageClips = allClips.filter((clip) => clip.kind === 'image' && onStage(clip));
  const shapeClips = allClips.filter((clip) => clip.kind === 'shape' && onStage(clip));
  const videoClips = allClips.filter((clip) => clip.kind === 'video' && onStage(clip));

  // Shared add/edit handlers, used by both the desktop sidebar and the mobile sheet.
  const drawerHandlers = {
    onAddText: (label: string, styleClassName?: string) =>
      timeline.addTextClip(label, editor.playheadSec, styleClassName),
    onAddAudio: (label: string) => timeline.addAudioClip(label, editor.playheadSec),
    onAddImage: (tone: string, src?: string) => timeline.addImageClip(tone, editor.playheadSec, src),
    onAddVideo: (tone: string, src?: string) => timeline.addVideoClip(tone, editor.playheadSec, src),
    onAddElement: (payload: { label?: string; icon?: IconType; category?: string }) =>
      timeline.addShapeClip(payload, editor.playheadSec),
    onDeleteClip: timeline.deleteSelectedClip,
    onLayout: timeline.updateClipLayout,
    onEditText: timeline.updateClipLabel,
    canvasAspect: editor.canvasAspect,
    onSelectAspect: editor.setCanvasAspect
  };

  // Mobile: a tool tap opens its bottom sheet (dismissable by an outside tap);
  // tapping the open tool closes it.
  const handleMobileToolSelect = (id: string) => {
    if (editor.isSheetOpen && id === editor.activeTabId) {
      editor.closeSheet();
    } else {
      editor.setActiveTabId(id);
      editor.openSheet(true);
    }
  };

  // Selecting an element ON THE CANVAS is an "edit" intent: switch to its tab in
  // chosen-item state and open the settings sheet (mobile: overlaying the
  // timeline until dismissed). Selecting on the TIMELINE is arrange/trim only —
  // it just selects the clip (for duration/split) without opening the sheet.
  const handleCanvasSelect = (clipId: string | null) => {
    timeline.selectClip(clipId);
    if (!clipId) return;
    const clip = allClips.find((c) => c.id === clipId);
    if (clip) editor.setActiveTabId(CLIP_KIND_TO_TAB[clip.kind]);
    editor.openSheet();
  };

  // Selecting on the TIMELINE. Mobile: select only (interact on the timeline; the
  // tab bar stays put). Desktop: also open the element's tab in edit state — while
  // still allowing timeline interaction (crop/cut/move).
  const handleTimelineSelect = (clipId: string | null) => {
    timeline.selectClip(clipId);
    if (!clipId || !isDesktop) return;
    const clip = allClips.find((c) => c.id === clipId);
    if (clip) editor.setActiveTabId(CLIP_KIND_TO_TAB[clip.kind]);
  };

  // Mobile: the timeline header's Edit button opens the selected clip's tab in edit state.
  const handleEditSelected = () => {
    if (!selectedClip) return;
    editor.setActiveTabId(CLIP_KIND_TO_TAB[selectedClip.kind]);
    editor.openSheet();
  };

  // Delete key removes the selected element (unless the user is typing in a field).
  const { selectedClipId, deleteSelectedClip } = timeline;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete') return;
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
      if (selectedClipId) {
        event.preventDefault();
        deleteSelectedClip();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedClipId, deleteSelectedClip]);

  return (
    <div className='flex h-screen w-full flex-col overflow-hidden bg-bg-light-grey'>
      <EditorHeader
        projectName={editor.projectName}
        onProjectNameChange={editor.setProjectName}
        onBack={handleBack}
        onSelectFormat={handleSelectFormat}
        onUndo={timeline.undo}
        onRedo={timeline.redo}
        canUndo={timeline.canUndo}
        canRedo={timeline.canRedo}
      />

      <div className='flex min-h-0 flex-1'>
        <EditorSidebar
          activeTabId={editor.activeTabId}
          onSelectTab={editor.setActiveTabId}
          isCollapsed={editor.isSidebarCollapsed}
          onToggle={editor.toggleSidebar}
          selectedClip={selectedClip}
          onExitEdit={() => timeline.selectClip(null)}
          {...drawerHandlers}
        />

        <div className='relative flex min-w-0 flex-1 flex-col overflow-hidden'>
          <EditorCanvas
            onUndo={timeline.undo}
            onRedo={timeline.redo}
            canUndo={timeline.canUndo}
            canRedo={timeline.canRedo}
            videoClips={videoClips}
            textClips={textClips}
            imageClips={imageClips}
            shapeClips={shapeClips}
            aspectRatio={editor.canvasAspect.ratio}
            selectedClipId={timeline.selectedClipId}
            onSelectClip={handleCanvasSelect}
            onEditText={timeline.updateClipLabel}
            onLayout={timeline.updateClipLayout}
          />
          <Timeline
            isPlaying={editor.isPlaying}
            onTogglePlay={editor.togglePlay}
            playheadSec={editor.playheadSec}
            onScrub={editor.setPlayheadSec}
            zoom={editor.zoom}
            onZoomChange={editor.setZoom}
            tracks={timeline.tracks}
            selectedClipId={timeline.selectedClipId}
            onSelectClip={handleTimelineSelect}
            onBeginChange={timeline.beginChange}
            onUpdateClip={timeline.updateClip}
            onMoveClipToTrack={timeline.moveClipToTrack}
            onDeleteClip={timeline.deleteSelectedClip}
            onSplitClip={timeline.splitSelectedClip}
            onEditSelected={handleEditSelected}
          />

          {/* Mobile: outside-tap catcher that dismisses a tab-bar-opened sheet.
              Not rendered for a canvas-opened sheet (that one closes manually). */}
          {editor.isSheetOpen && editor.isSheetDismissable && (
            <button
              type='button'
              aria-label='Close panel'
              onPointerDown={editor.closeSheet}
              className='absolute inset-0 z-20 cursor-default md:hidden'
            />
          )}

          {/* Mobile: the active tool's controls as a bottom sheet, sliding up
              from above the bottom tool bar. Hidden on desktop (inline sidebar). */}
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 z-30 flex max-h-[60%] flex-col overflow-hidden rounded-t-6 bg-bg-white-bg shadow-[0_-8px_30px_-10px_rgba(33,33,52,0.25)] transition-transform duration-300 md:hidden',
              editor.isSheetOpen ? 'translate-y-0' : 'pointer-events-none translate-y-full'
            )}
          >
            <ContentDrawer
              activeTabId={editor.activeTabId}
              selectedClip={selectedClip}
              onExitEdit={() => timeline.selectClip(null)}
              onClose={editor.closeSheet}
              {...drawerHandlers}
            />
          </div>
        </div>
      </div>

      {/* Mobile: bottom tool bar (the desktop tool rail, laid out horizontally). */}
      <ToolRail
        orientation='horizontal'
        activeTabId={editor.activeTabId}
        onSelect={handleMobileToolSelect}
        className='md:hidden'
      />
    </div>
  );
};
