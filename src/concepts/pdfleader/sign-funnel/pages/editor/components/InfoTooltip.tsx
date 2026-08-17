import { useState } from 'react';

import { IconButton, cn } from '@universe-forma/ui-pes';

import { Icon } from './Icon';

/**
 * Info icon that reveals a tooltip. Composed: ui-pes ships no Tooltip (DS gap,
 * flagged in DS-GAPS.md), but it does define `--color-bg-tooltip`, so this uses
 * that surface. The whole block — label and icon — is the hover target; the
 * icon also opens it on focus and toggles on click, so it stays reachable by
 * keyboard and on touch.
 */
export function InfoTooltip({
  text,
  ff,
  label,
  className,
}: {
  text: string;
  ff?: string;
  /** Rendered before the icon; hovering it opens the tooltip too. */
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    // Hover lives on the wrapper, so the label and the icon are one target.
    <span
      className={cn('relative inline-flex items-center gap-1', label && 'cursor-help', className)}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
    >
      {label}
      <IconButton
        variant="text"
        color="action"
        size="xs"
        aria-label={text}
        aria-expanded={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <Icon name="info" size={18} className="text-action-active" />
      </IconButton>
      {open && (
        <span
          data-ff={ff}
          role="tooltip"
          className={cn(
            'bg-bg-tooltip text-common-white text-caption absolute bottom-full left-1/2 z-40',
            'mb-2 w-60 -translate-x-1/2 rounded-3 px-3 py-2 text-center',
            'shadow-[0_8px_24px_rgba(0,0,0,0.24)]',
          )}
        >
          {text}
        </span>
      )}
    </span>
  );
}
