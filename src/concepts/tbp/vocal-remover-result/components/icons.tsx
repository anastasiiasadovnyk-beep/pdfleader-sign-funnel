/** DS gap: ui-pes ships no icon set, so this concept draws inline SVGs. Each
 * inherits `currentColor` and is sized via token width/height utilities by the
 * caller, so color comes from a `text-*` token on the wrapper. */

type IconProps = { className?: string };

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Small check — the reassurance feature row. */
export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** Circular arrow — the "Change" (replace file) action. */
export function RefreshIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

/** Tray-with-arrow — download actions. */
export function DownloadIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

/** Filled play triangle — the per-track play control. */
export function PlayIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

/** Two bars — the playing/pause control. */
export function PauseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

/** Document — the uploaded original file. */
export function FileIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

/** Music note — the instrumental stem. */
export function MusicNoteIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  );
}

/** Microphone — the isolated-voice stem. */
export function MicIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v4" />
    </svg>
  );
}

/** File with a pencil — the original full-length track. */
export function FileEditIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
      <path d="M14 3v5h5" />
      <path d="M18.5 13.5 21 16l-4 4h-2.5V17.5Z" />
    </svg>
  );
}

type ThumbProps = IconProps & { filled?: boolean };

/** Thumbs up — positive rating. `filled` fully fills the glyph (selected state). */
export function ThumbUpIcon({ className, filled }: ThumbProps) {
  const paint = filled
    ? { fill: 'currentColor', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' as const }
    : stroke;
  return (
    <svg className={className} viewBox="0 0 24 24" {...paint} aria-hidden="true">
      <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" />
      <path d="M7 11l4-8a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 2.3l-1.2 6a2 2 0 0 1-2 1.7H7" />
    </svg>
  );
}

/** Thumbs down — negative rating. `filled` fully fills the glyph (selected state). */
export function ThumbDownIcon({ className, filled }: ThumbProps) {
  const paint = filled
    ? { fill: 'currentColor', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' as const }
    : stroke;
  return (
    <svg className={className} viewBox="0 0 24 24" {...paint} aria-hidden="true">
      <path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1Z" />
      <path d="M17 13l-4 8a2 2 0 0 1-2-2v-4H5.5a2 2 0 0 1-2-2.3l1.2-6a2 2 0 0 1 2-1.7H17" />
    </svg>
  );
}
