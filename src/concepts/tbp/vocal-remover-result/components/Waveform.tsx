import { makeBars, playableCount } from '../lib/waveform';

type WaveformProps = {
  /** 0–1 fraction of the track that is playable (the rest renders locked/greyed). */
  previewRatio: number;
  /** 0–1 playhead position — drives the thumb and the "played" bar shading. */
  playedRatio: number;
  /** Silhouette seed so each stem gets a distinct shape. */
  seed: number;
  className?: string;
};

const BAR_COUNT = 120;

/** DS gap: no ui-pes waveform/scrubber. Composed from token-styled bars — played
 * bars use the standard input line grey, the locked (preview-gated) tail fades
 * to the divider grey, and a round thumb marks the playhead.
 *
 * Density is responsive: all bars render on desktop (dense), while every other
 * bar is hidden on mobile so the thin bars keep visible spacing on a narrow
 * player instead of merging into a block. */
export default function Waveform({ previewRatio, playedRatio, seed, className }: WaveformProps) {
  const bars = makeBars(BAR_COUNT, seed);
  const playable = playableCount(BAR_COUNT, previewRatio);
  const playedIndex = Math.round(BAR_COUNT * Math.max(0, Math.min(1, playedRatio)));

  return (
    <div data-ff="waveform" className={`relative flex h-6 min-w-0 items-center ${className ?? ''}`}>
      {/* Bars are clipped so a narrow player never pushes the download button;
          the thumb lives outside this box so it's never cropped at the edges. */}
      <div className="flex h-full w-full min-w-0 items-center justify-between overflow-hidden">
        {bars.map((h, i) => {
          const locked = i >= playable;
          const played = i < playedIndex;
          const color = locked
            ? 'bg-os-divider'
            : played
              ? 'bg-primary'
              : 'bg-os-standard-input-line';
          const mobileHidden = i % 3 !== 0 ? 'hidden md:block' : '';
          return (
            <span
              key={i}
              className={`w-px shrink-0 rounded-full md:w-[2px] ${mobileHidden} ${color}`}
              style={{ height: `${Math.round(h * 100)}%` }}
            />
          );
        })}
      </div>
      {/* Playhead thumb — in the non-clipped outer wrapper */}
      <span
        aria-hidden="true"
        className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-bg-white-bg shadow-modal-card"
        style={{ left: `${Math.round(Math.max(0, Math.min(1, playedRatio)) * 100)}%` }}
      />
    </div>
  );
}
