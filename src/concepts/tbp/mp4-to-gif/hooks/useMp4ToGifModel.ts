import { useMemo, useRef, useState } from 'react';
import type { AspectRatio, GifSettings, Option, TrimState, VideoMeta } from '../types';
import { clampTrim } from '../lib/timeline';
import { formatBytes } from '../lib/format';

/** View-model for the builder. Shaped as { state, actions, derived } so
 * integration is a wiring, not a rewrite: `state` → slice state, `actions` →
 * dispatched reducers, `derived` → selectors. Local view interaction only
 * (trim math, a locally-picked file → object URL) — no store, no network. */
export function useMp4ToGifModel(args: {
  initialVideo: VideoMeta;
  initialTrim: TrimState;
  initialSettings: GifSettings;
  maxClipSec: number;
  ratios: AspectRatio[];
  speeds: Option[];
  fpsOptions: Option[];
  qualities: Option[];
}) {
  const { maxClipSec, ratios, speeds, fpsOptions, qualities } = args;
  const [video, setVideo] = useState<VideoMeta>(args.initialVideo);
  const [trim, setTrim] = useState<TrimState>(args.initialTrim);
  const [settings, setSettings] = useState<GifSettings>(args.initialSettings);
  // Track the object URL we created so we can revoke the previous one.
  const objectUrl = useRef<string | null>(null);

  const durationSec = video.durationSec;

  const actions = useMemo(
    () => ({
      setTrim: (next: TrimState) => setTrim(clampTrim(next.startSec, next.endSec, durationSec, maxClipSec)),
      selectRatio: (ratioId: string) => setSettings((s) => ({ ...s, ratioId })),
      selectSpeed: (speedId: string) => setSettings((s) => ({ ...s, speedId })),
      selectFps: (fpsId: string) => setSettings((s) => ({ ...s, fpsId })),
      selectQuality: (qualityId: string) => setSettings((s) => ({ ...s, qualityId })),
      toggleLoop: (loop: boolean) => setSettings((s) => ({ ...s, loop })),
      /** Replace the source clip from a locally-picked file: probe its duration,
       * show it in the preview, and reset the trim window to the new bounds. */
      changeVideo: (file: File) => {
        if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        const url = URL.createObjectURL(file);
        objectUrl.current = url;
        const probe = document.createElement('video');
        probe.preload = 'metadata';
        const commit = (dur: number) => {
          setVideo({
            fileName: file.name,
            fileSize: formatBytes(file.size),
            durationSec: dur,
            src: url,
          });
          setTrim(clampTrim(0, Math.min(maxClipSec, dur), dur, maxClipSec));
        };
        probe.onloadedmetadata = () => {
          const dur = Number.isFinite(probe.duration) && probe.duration > 0 ? Math.round(probe.duration) : maxClipSec;
          commit(dur);
        };
        probe.onerror = () => commit(maxClipSec);
        probe.src = url;
      },
    }),
    [durationSec, maxClipSec],
  );

  const derived = useMemo(() => {
    const ratio = ratios.find((r) => r.id === settings.ratioId) ?? ratios[0];
    const quality = qualities.find((o) => o.id === settings.qualityId);
    return {
      ratio,
      ratioLabel: ratio?.label ?? '',
      fpsLabel: fpsOptions.find((o) => o.id === settings.fpsId)?.label ?? '',
      // Quality trigger shows both lines inline, e.g. "Balanced ~ 50KB".
      qualityLabel: quality ? [quality.label, quality.caption].filter(Boolean).join(' ') : '',
      speedLabel: speeds.find((o) => o.id === settings.speedId)?.label ?? '',
      /** Selected clip length in seconds (never longer than maxClipSec). */
      selectionSec: Math.max(0, trim.endSec - trim.startSec),
    };
  }, [settings, trim, ratios, speeds, fpsOptions, qualities]);

  return { state: { video, trim, settings }, actions, derived };
}
