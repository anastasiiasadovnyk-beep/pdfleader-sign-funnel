import { useState } from 'react';

import { cn } from '@universe-forma/ui-pes';

import { Icon } from './Icon';

/**
 * Info icon that reveals a tooltip. Composed: ui-pes ships no Tooltip (DS gap,
 * flagged in DS-GAPS.md), but it does define `--color-bg-tooltip`, so this uses
 * that surface. The whole block — label and icon — is the hover target and
 * shows no hover state or pointer cursor, since it reads as text rather than a
 * control. The icon still opens the tooltip on focus and toggles it on click,
 * so it stays reachable by keyboard and on touch.
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
      className={cn('relative inline-flex cursor-default items-center gap-1', className)}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
    >
      {label}
      {/*
       * Deliberately not the DS IconButton: the block reads as part of the
       * sentence, so it carries no hover state and keeps the arrow cursor. It
       * stays a button purely so the tooltip is reachable by keyboard and on
       * touch — hover is handled by the wrapper above.
       */}
      <button
        type="button"
        aria-label={text}
        aria-expanded={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex cursor-default items-center outline-none disabled:cursor-default"
      >
        <Icon name="info" size={18} className="text-action-active" />
      </button>
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
