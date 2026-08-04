import { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@universe-forma/ui-pes';
import type { AspectRatio, VideoMeta } from '../types';
import { PlayIcon, RefreshIcon } from './icons';

type VideoPreviewProps = {
  video: VideoMeta;
  ratio: AspectRatio;
  changeLabel: string;
  onChangeFile?: () => void;
};

/** Top of the builder: the file-name row + the video stage. On desktop the stage
 * flexes to fill the space left above the pinned timeline; the video frame is
 * sized to the selected ratio and fitted inside the stage via a ResizeObserver —
 * so shrinking the window shrinks the preview, never the timeline. The video
 * itself is cropped to the ratio (object-cover), not letterboxed. A locally-picked
 * clip renders as a real <video>; else a placeholder. */
export default function VideoPreview({ video, ratio, changeLabel, onChangeFile }: VideoPreviewProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => {
      const cs = getComputedStyle(el);
      const cw = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const ch = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (cw <= 0 || ch <= 0) return;
      const r = ratio.w / ratio.h;
      let w = cw;
      let h = cw / r;
      if (h > ch) {
        h = ch;
        w = ch * r;
      }
      setBox({ w: Math.round(w), h: Math.round(h) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ratio.w, ratio.h]);

  return (
    <div className="flex flex-col md:min-h-0 md:flex-1">
      {/* file name + change */}
      <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-3">
        <div data-ff="file-name" className="flex min-w-0 items-baseline gap-2 text-body-2">
          <span className="truncate text-text-primary">{video.fileName}</span>
          <span className="shrink-0 text-text-secondary">{video.fileSize}</span>
        </div>
        <Button
          variant="text"
          color="primary"
          size="sm"
          className="shrink-0"
          leftIcon={<RefreshIcon className="h-4 w-4" />}
          onClick={onChangeFile}
        >
          {changeLabel}
        </Button>
      </div>

      {/* video stage — fixed height on mobile, flexes on desktop */}
      <div
        ref={stageRef}
        data-ff="video-stage"
        className="flex h-[208px] items-center justify-center bg-bg-white-bg p-2 md:h-auto md:min-h-0 md:flex-1"
      >
        <div
          data-ff="video-frame"
          className="relative flex items-center justify-center overflow-hidden rounded-2 bg-bg-dark-blue-grey"
          style={box ? { width: box.w, height: box.h } : { aspectRatio: `${ratio.w} / ${ratio.h}`, maxWidth: '100%' }}
        >
          {video.src ? (
            <video
              key={video.src}
              src={video.src}
              controls
              playsInline
              poster={video.posterSrc}
              className="h-full w-full object-cover"
            />
          ) : (
            <>
              {video.posterSrc ? <img src={video.posterSrc} alt="" className="h-full w-full object-cover" /> : null}
              <span className="absolute flex h-11 w-11 items-center justify-center rounded-full bg-common-black/40 text-common-white backdrop-blur-sm">
                <PlayIcon className="ml-0.5 h-5 w-5" />
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
