type ProgressBarProps = {
  /** 0–100. */
  progress: number;
  className?: string;
};

/** DS gap: ui-pes ships no Progress/linear-progress component, so the bar is
 * composed from a token-styled track + a primary fill whose width is the
 * completion percentage, with the % label pinned to the right. */
export default function ProgressBar({ progress, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, progress));
  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <div
        data-ff="progress-track"
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary-filled-50"
      >
        <div
          data-ff="progress-fill"
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span data-ff="progress-pct" className="shrink-0 text-caption text-text-secondary">
        {pct}%
      </span>
    </div>
  );
}
