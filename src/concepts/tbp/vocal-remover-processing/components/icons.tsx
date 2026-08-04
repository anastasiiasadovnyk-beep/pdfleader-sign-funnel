/** DS gap: ui-pes ships no icon set, so concepts draw inline SVGs that inherit
 * `currentColor` and size via token width/height utilities. */

type IconProps = { className?: string };

/** Lightbulb — used in the reassurance info callout. */
export function BulbIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.2 1 2V16h6v-.5c0-.8.4-1.4 1-2A6 6 0 0 0 12 3Z" />
    </svg>
  );
}
