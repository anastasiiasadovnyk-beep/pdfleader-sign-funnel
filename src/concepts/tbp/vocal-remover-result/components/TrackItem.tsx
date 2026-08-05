import { Badge, IconButton } from '@universe-forma/ui-pes';
import type { SeparatedTrack, TrackKind } from '../types';
import Waveform from './Waveform';
import {
  DownloadIcon,
  FileEditIcon,
  MicIcon,
  MusicNoteIcon,
  PauseIcon,
  PlayIcon,
} from './icons';

type TrackItemProps = {
  track: SeparatedTrack;
  playing: boolean;
  onTogglePlay?: (id: string) => void;
  onDownload?: (id: string) => void;
};

/** Per-kind visual config: badge tonal bg + text token, leading icon + its color.
 * Badge uses ui-pes `color="custom"`; the bg goes on the Badge and the text color
 * on an inner span (instrumental → success-dark, vocals → base-palette blue) so
 * the color utility doesn't collide with the `text-caption-xs` size utility under
 * the Badge's tailwind-merge. */
const KIND: Record<
  TrackKind,
  { badgeBg: string; badgeText: string; iconColor: string; Icon: typeof MusicNoteIcon; seed: number }
> = {
  instrumental: { badgeBg: 'bg-success-20', badgeText: 'text-success-dark', iconColor: 'text-secondary', Icon: MusicNoteIcon, seed: 1 },
  vocals: { badgeBg: 'bg-material-blue-50', badgeText: 'text-material-bp-blue', iconColor: 'text-primary', Icon: MicIcon, seed: 4 },
  original: { badgeBg: 'bg-material-grey-200', badgeText: 'text-material-grey-700', iconColor: 'text-text-secondary', Icon: FileEditIcon, seed: 7 },
};

/** One "Separated tracks" row: overline badge, stem name + format, and a bordered
 * waveform player (play/pause · time · waveform · time · download). */
export default function TrackItem({ track, playing, onTogglePlay, onDownload }: TrackItemProps) {
  const cfg = KIND[track.kind];
  const Icon = cfg.Icon;

  return (
    <div data-ff="track-item" className="flex flex-col gap-3 rounded-3 border border-os-divider bg-bg-white-bg p-3">
      {/* Overline badge (DS gap: dense Badge sets no font-size — forced via token). */}
      <Badge
        data-ff="track-badge"
        type="badge"
        style="filled-tonal"
        color="custom"
        size="dense"
        className={`w-fit text-caption-xs font-bold uppercase ${cfg.badgeBg}`}
      >
        <span className={cfg.badgeText}>{track.badgeLabel}</span>
      </Badge>

      {/* Stem name + format */}
      <div className="flex items-center gap-2">
        <Icon className={`h-6 w-6 shrink-0 ${cfg.iconColor}`} />
        <span data-ff="track-name" className="text-body-emph text-text-primary">
          {track.name}
        </span>
        <span data-ff="track-format" className="text-caption text-text-disabled">
          {track.format}
        </span>
      </div>

      {/* Waveform player */}
      <div className="flex items-center gap-3 rounded-2 border border-os-outline-border p-2">
        <IconButton
          data-ff="play-btn"
          variant="outlined"
          color="primary"
          size="ms"
          onClick={() => onTogglePlay?.(track.id)}
          aria-label={playing ? `Pause ${track.name}` : `Play ${track.name}`}
          aria-pressed={playing}
          className="h-8 w-8 shrink-0 md:h-10 md:w-10"
        >
          {playing ? (
            <PauseIcon className="h-4 w-4 md:h-5 md:w-5" />
          ) : (
            <PlayIcon className="h-4 w-4 md:h-5 md:w-5" />
          )}
        </IconButton>

        <span data-ff="time-current" className="shrink-0 text-caption tabular-nums text-text-secondary">
          {track.currentTimeLabel}
        </span>

        <Waveform
          previewRatio={track.previewRatio}
          playedRatio={track.playedRatio}
          seed={cfg.seed}
          className="flex-1"
        />

        <span data-ff="time-total" className="shrink-0 text-caption tabular-nums text-text-secondary">
          {track.durationLabel}
        </span>

        <IconButton
          data-ff="download-btn"
          variant="filled-tonal"
          color="primary"
          size="ms"
          onClick={() => onDownload?.(track.id)}
          aria-label={`Download ${track.name}`}
          className="h-8 w-8 shrink-0 md:h-10 md:w-10"
        >
          <DownloadIcon className="h-4 w-4 md:h-5 md:w-5" />
        </IconButton>
      </div>
    </div>
  );
}
