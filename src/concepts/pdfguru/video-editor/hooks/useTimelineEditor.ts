import { useCallback, useMemo, useRef, useState } from 'react';

import type { IconType } from 'react-icons';

import {
  DEFAULT_CANVAS_LAYOUT,
  MEDIA_ITEMS,
  SUBTITLE_DEFAULT_LAYOUT,
  TIMELINE_TRACKS,
  TOTAL_DURATION_SEC,
  type MediaItem,
  type TimelineClip,
  type TimelineTrack
} from '../model/editorData';

/** Shortest a clip can be, in seconds (matches the timeline's trim minimum). */
const MIN_CLIP_SEC = 2;

/** Where a clip appended to a row starts: at the end of the last clip, or 0 if the row is free. */
const appendStart = (clips: TimelineClip[]) => (clips.length ? Math.max(...clips.map((clip) => clip.endSec)) : 0);

/**
 * Bounds for a clip dropped into a row: packed right after the last clip (no
 * gap), or at 0 when the row is empty. Clamped to the timeline length.
 */
const packedBounds = (clips: TimelineClip[], duration: number) => {
  const start = Math.min(appendStart(clips), Math.max(0, TOTAL_DURATION_SEC - MIN_CLIP_SEC));
  return { startSec: start, endSec: Math.min(start + duration, TOTAL_DURATION_SEC) };
};

/** A full snapshot of the editable state, used as one undo/redo step. */
interface EditorSnapshot {
  tracks: TimelineTrack[];
  mediaItems: MediaItem[];
}

const INITIAL: EditorSnapshot = { tracks: TIMELINE_TRACKS, mediaItems: MEDIA_ITEMS };

/**
 * Shared model for the media drawer and the timeline, with undo/redo history.
 * Clips and their source media items stay linked so a clip can be selected and
 * deleted from both places at once, and every edit is reversible.
 */
export const useTimelineEditor = () => {
  const [past, setPast] = useState<EditorSnapshot[]>([]);
  const [present, setPresent] = useState<EditorSnapshot>(INITIAL);
  const [future, setFuture] = useState<EditorSnapshot[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const splitSeq = useRef(0);
  const textSeq = useRef(0);
  const audioSeq = useRef(0);
  const imageSeq = useRef(0);
  const videoSeq = useRef(0);
  const shapeSeq = useRef(0);
  const subtitleSeq = useRef(0);
  const ttsSeq = useRef(0);

  /** Record the current state as an undo point. Call once at the start of an edit. */
  const beginChange = useCallback(() => {
    setPast((prev) => [...prev, present]);
    setFuture([]);
  }, [present]);

  const updateClip = useCallback((trackId: string, clipId: string, startSec: number, endSec: number) => {
    setPresent((cur) => ({
      ...cur,
      tracks: cur.tracks.map((track) =>
        track.id === trackId
          ? { ...track, clips: track.clips.map((clip) => (clip.id === clipId ? { ...clip, startSec, endSec } : clip)) }
          : track
      )
    }));
  }, []);

  /** Add a new text layer (from a preset) to the text track and select it. */
  const addTextClip = useCallback(
    (label: string, _startSec: number, styleClassName?: string) => {
      textSeq.current += 1;
      const id = `text-${textSeq.current}`;
      setPast((prev) => [...prev, present]);
      setFuture([]);
      setPresent((cur) => {
        const existing = cur.tracks.find((track) => track.kind === 'text');
        const clip = {
          id,
          kind: 'text' as const,
          ...packedBounds(existing?.clips ?? [], 20),
          label,
          styleClassName,
          ...DEFAULT_CANVAS_LAYOUT
        };
        const tracks = existing
          ? cur.tracks.map((track) => (track.kind === 'text' ? { ...track, clips: [...track.clips, clip] } : track))
          : [...cur.tracks, { id: 'text', kind: 'text' as const, clips: [clip] }];
        return { ...cur, tracks };
      });
      setSelectedClipId(id);
    },
    [present]
  );

  /**
   * Move a clip to a different row. Audio clips are locked to the bottom audio
   * row, and no other clip can be dropped onto the audio row.
   */
  const moveClipToTrack = useCallback((clipId: string, targetTrackId: string) => {
    setPresent((cur) => {
      const source = cur.tracks.find((track) => track.clips.some((clip) => clip.id === clipId));
      const target = cur.tracks.find((track) => track.id === targetTrackId);
      if (!source || !target || source.id === target.id) return cur;
      const clip = source.clips.find((c) => c.id === clipId);
      if (!clip || clip.kind === 'audio' || target.kind === 'audio') return cur;
      // Drop the clip at the end of the target row (packed after the last clip,
      // or at 0 when the row is empty), keeping its own duration.
      const moved = { ...clip, ...packedBounds(target.clips, clip.endSec - clip.startSec) };
      return {
        ...cur,
        tracks: cur.tracks
          .map((track) => {
            if (track.id === source.id) return { ...track, clips: track.clips.filter((c) => c.id !== clipId) };
            if (track.id === targetTrackId) return { ...track, clips: [...track.clips, moved] };
            return track;
          })
          .filter((track) => track.clips.length > 0)
      };
    });
  }, []);

  /** Add an image layer (stock gradient, or an uploaded file via `src`) and select it. */
  const addImageClip = useCallback(
    (tone: string, _startSec: number, src?: string) => {
      imageSeq.current += 1;
      const id = `image-${imageSeq.current}`;
      setPast((prev) => [...prev, present]);
      setFuture([]);
      setPresent((cur) => {
        const existing = cur.tracks.find((track) => track.kind === 'image');
        const clip = {
          id,
          kind: 'image' as const,
          ...packedBounds(existing?.clips ?? [], 20),
          tone,
          src,
          ...DEFAULT_CANVAS_LAYOUT
        };
        const tracks = existing
          ? cur.tracks.map((track) => (track.kind === 'image' ? { ...track, clips: [...track.clips, clip] } : track))
          : [...cur.tracks, { id: 'image', kind: 'image' as const, clips: [clip] }];
        return { ...cur, tracks };
      });
      setSelectedClipId(id);
    },
    [present]
  );

  /** Add a video clip (stock gradient, or an uploaded file via `src`) and select it. */
  const addVideoClip = useCallback(
    (tone: string, _startSec: number, src?: string) => {
      videoSeq.current += 1;
      const id = `video-${videoSeq.current}`;
      setPast((prev) => [...prev, present]);
      setFuture([]);
      setPresent((cur) => {
        const existing = cur.tracks.find((track) => track.kind === 'video');
        const clip = {
          id,
          kind: 'video' as const,
          ...packedBounds(existing?.clips ?? [], 20),
          tone,
          src,
          ...DEFAULT_CANVAS_LAYOUT
        };
        const tracks = existing
          ? cur.tracks.map((track) => (track.kind === 'video' ? { ...track, clips: [...track.clips, clip] } : track))
          : [{ id: 'video', kind: 'video' as const, clips: [clip] }, ...cur.tracks];
        return { ...cur, tracks };
      });
      setSelectedClipId(id);
    },
    [present]
  );

  /** Add a shape / sticker / emoji element to the (top) shape row and select it. */
  const addShapeClip = useCallback(
    (payload: { label?: string; icon?: IconType; category?: string }, _startSec: number) => {
      shapeSeq.current += 1;
      const id = `shape-${shapeSeq.current}`;
      setPast((prev) => [...prev, present]);
      setFuture([]);
      setPresent((cur) => {
        const existing = cur.tracks.find((track) => track.kind === 'shape');
        const clip = {
          id,
          kind: 'shape' as const,
          ...packedBounds(existing?.clips ?? [], 20),
          ...payload,
          ...DEFAULT_CANVAS_LAYOUT
        };
        const tracks = existing
          ? cur.tracks.map((track) => (track.kind === 'shape' ? { ...track, clips: [...track.clips, clip] } : track))
          : [...cur.tracks, { id: 'shape', kind: 'shape' as const, clips: [clip] }];
        return { ...cur, tracks };
      });
      setSelectedClipId(id);
    },
    [present]
  );

  /** Add a stock audio track to the (bottom) audio row and select it. */
  const addAudioClip = useCallback(
    (label: string, _startSec: number) => {
      audioSeq.current += 1;
      const id = `audio-${audioSeq.current}`;
      setPast((prev) => [...prev, present]);
      setFuture([]);
      setPresent((cur) => {
        const existing = cur.tracks.find((track) => track.kind === 'audio');
        const clip = { id, kind: 'audio' as const, ...packedBounds(existing?.clips ?? [], 30), label };
        const tracks = existing
          ? cur.tracks.map((track) => (track.kind === 'audio' ? { ...track, clips: [...track.clips, clip] } : track))
          : [...cur.tracks, { id: 'audio', kind: 'audio' as const, clips: [clip] }];
        return { ...cur, tracks };
      });
      setSelectedClipId(id);
    },
    [present]
  );

  /** Add a subtitle caption to the (own) subtitle row and select it. */
  const addSubtitleClip = useCallback(
    (label: string, _startSec: number) => {
      subtitleSeq.current += 1;
      const id = `subtitle-${subtitleSeq.current}`;
      setPast((prev) => [...prev, present]);
      setFuture([]);
      setPresent((cur) => {
        const existing = cur.tracks.find((track) => track.kind === 'subtitle');
        const clip = {
          id,
          kind: 'subtitle' as const,
          ...packedBounds(existing?.clips ?? [], 10),
          label,
          ...SUBTITLE_DEFAULT_LAYOUT
        };
        const tracks = existing
          ? cur.tracks.map((track) => (track.kind === 'subtitle' ? { ...track, clips: [...track.clips, clip] } : track))
          : [...cur.tracks, { id: 'subtitle', kind: 'subtitle' as const, clips: [clip] }];
        return { ...cur, tracks };
      });
      setSelectedClipId(id);
    },
    [present]
  );

  /** Add a text-to-speech clip to its (own) row and select it. Audio-like. */
  const addTtsClip = useCallback(
    (label: string, _startSec: number) => {
      ttsSeq.current += 1;
      const id = `tts-${ttsSeq.current}`;
      setPast((prev) => [...prev, present]);
      setFuture([]);
      setPresent((cur) => {
        const existing = cur.tracks.find((track) => track.kind === 'tts');
        const clip = { id, kind: 'tts' as const, ...packedBounds(existing?.clips ?? [], 20), label };
        const tracks = existing
          ? cur.tracks.map((track) => (track.kind === 'tts' ? { ...track, clips: [...track.clips, clip] } : track))
          : [...cur.tracks, { id: 'tts', kind: 'tts' as const, clips: [clip] }];
        return { ...cur, tracks };
      });
      setSelectedClipId(id);
    },
    [present]
  );

  /** Update a clip's canvas layout (position / scale / rotation). */
  const updateClipLayout = useCallback(
    (
      clipId: string,
      patch: Partial<{
        xPct: number;
        yPct: number;
        scale: number;
        rotation: number;
        flipH: boolean;
        flipV: boolean;
        color: string;
        cropW: number;
        cropH: number;
      }>
    ) => {
      setPresent((cur) => ({
        ...cur,
        tracks: cur.tracks.map((track) => ({
          ...track,
          clips: track.clips.map((clip) => (clip.id === clipId ? { ...clip, ...patch } : clip))
        }))
      }));
    },
    []
  );

  /** Update a clip's text (used when editing text directly on the canvas). */
  const updateClipLabel = useCallback((clipId: string, label: string) => {
    setPresent((cur) => ({
      ...cur,
      tracks: cur.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) => (clip.id === clipId ? { ...clip, label } : clip))
      }))
    }));
  }, []);

  const deleteSelectedClip = useCallback(() => {
    if (!selectedClipId) return;
    setPast((prev) => [...prev, present]);
    setFuture([]);
    setPresent((cur) => {
      const clip = cur.tracks.flatMap((track) => track.clips).find((c) => c.id === selectedClipId);
      return {
        tracks: cur.tracks.map((track) => ({ ...track, clips: track.clips.filter((c) => c.id !== selectedClipId) })),
        mediaItems: clip?.mediaId ? cur.mediaItems.filter((item) => item.id !== clip.mediaId) : cur.mediaItems
      };
    });
    setSelectedClipId(null);
  }, [selectedClipId, present]);

  /** Split the selected clip in two at `atSec` (the playhead position). */
  const splitSelectedClip = useCallback(
    (atSec: number) => {
      if (!selectedClipId) return;
      const clip = present.tracks.flatMap((track) => track.clips).find((c) => c.id === selectedClipId);
      if (!clip || atSec <= clip.startSec || atSec >= clip.endSec) return;

      splitSeq.current += 1;
      const newId = `${clip.id}-s${splitSeq.current}`;
      setPast((prev) => [...prev, present]);
      setFuture([]);
      setPresent((cur) => ({
        ...cur,
        tracks: cur.tracks.map((track) => ({
          ...track,
          clips: track.clips.flatMap((c) =>
            c.id === selectedClipId
              ? [
                  { ...c, endSec: atSec },
                  { ...c, id: newId, startSec: atSec }
                ]
              : [c]
          )
        }))
      }));
    },
    [selectedClipId, present]
  );

  const undo = useCallback(() => {
    if (!past.length) return;
    setFuture((f) => [present, ...f]);
    setPresent(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
    setSelectedClipId(null);
  }, [past, present]);

  const redo = useCallback(() => {
    if (!future.length) return;
    setPast((p) => [...p, present]);
    setPresent(future[0]);
    setFuture((f) => f.slice(1));
    setSelectedClipId(null);
  }, [future, present]);

  return useMemo(
    () => ({
      mediaItems: present.mediaItems,
      tracks: present.tracks,
      selectedClipId,
      selectClip: setSelectedClipId,
      beginChange,
      updateClip,
      addTextClip,
      addAudioClip,
      addImageClip,
      addVideoClip,
      addShapeClip,
      addSubtitleClip,
      addTtsClip,
      moveClipToTrack,
      updateClipLabel,
      updateClipLayout,
      deleteSelectedClip,
      splitSelectedClip,
      undo,
      redo,
      canUndo: past.length > 0,
      canRedo: future.length > 0
    }),
    [
      present,
      selectedClipId,
      beginChange,
      updateClip,
      addTextClip,
      addAudioClip,
      addImageClip,
      addVideoClip,
      addShapeClip,
      addSubtitleClip,
      addTtsClip,
      moveClipToTrack,
      updateClipLabel,
      updateClipLayout,
      deleteSelectedClip,
      splitSelectedClip,
      undo,
      redo,
      past.length,
      future.length
    ]
  );
};
