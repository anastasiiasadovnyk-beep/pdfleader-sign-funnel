import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_ASPECT_RATIO, TOOL_TABS, TOTAL_DURATION_SEC, type AspectRatioOption } from '../model/editorData';

/**
 * UI state for the editor screen. Presentational only — no real media pipeline;
 * enough to drive tab switching, sidebar collapse, playback affordances and
 * timeline zoom for the design.
 */
export const useEditorState = () => {
  const [activeTabId, setActiveTabId] = useState(TOOL_TABS[0].id);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Mobile-only: whether the bottom tool sheet is open (desktop keeps it inline),
  // and whether an outside tap dismisses it (true when opened from the tab bar;
  // false when opened by selecting a canvas element — that one closes manually).
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isSheetDismissable, setSheetDismissable] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [zoom, setZoom] = useState(1);
  // Canvas aspect ratio (Canvas tab dropdown ↔ preview stage), applied live.
  const [canvasAspect, setCanvasAspect] = useState<AspectRatioOption>(DEFAULT_ASPECT_RATIO);

  const toggleSidebar = useCallback(() => setSidebarCollapsed((v) => !v), []);
  const openSheet = useCallback((dismissable = false) => {
    setSheetOpen(true);
    setSheetDismissable(dismissable);
  }, []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  // Start/stop playback. Pressing play at the very end rewinds to the start.
  const togglePlay = useCallback(() => {
    if (!isPlaying && playheadSec >= TOTAL_DURATION_SEC) setPlayheadSec(0);
    setIsPlaying((v) => !v);
  }, [isPlaying, playheadSec]);

  // While playing, advance the playhead in real time and stop at the end.
  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const deltaSec = (now - last) / 1000;
      last = now;
      setPlayheadSec((prev) => {
        const next = prev + deltaSec;
        if (next >= TOTAL_DURATION_SEC) {
          setIsPlaying(false);
          return TOTAL_DURATION_SEC;
        }
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  return {
    activeTabId,
    setActiveTabId,
    isSidebarCollapsed,
    toggleSidebar,
    isSheetOpen,
    isSheetDismissable,
    openSheet,
    closeSheet,
    projectName,
    setProjectName,
    isPlaying,
    togglePlay,
    playheadSec,
    setPlayheadSec,
    zoom,
    setZoom,
    canvasAspect,
    setCanvasAspect
  };
};
