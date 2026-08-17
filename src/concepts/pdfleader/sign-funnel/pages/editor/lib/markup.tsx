import type { ReactNode } from 'react';

/**
 * Renders `**bold**` segments of a copy string as semibold spans
 * (used by the upload dropzone size caption).
 */
export function renderEmphasis(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-semibold">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
