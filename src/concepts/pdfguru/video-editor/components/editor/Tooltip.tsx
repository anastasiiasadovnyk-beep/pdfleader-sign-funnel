import { type FC, type ReactNode } from 'react';

import { cn } from '@universe-forma/ui-pes';

interface TooltipProps {
  /** Text shown on hover. */
  label: string;
  /** Which side of the trigger the bubble appears on. Default: bottom. */
  side?: 'top' | 'bottom';
  children: ReactNode;
  className?: string;
}

/**
 * Lightweight hover tooltip: wraps an icon button and reveals a small dark label
 * on hover (CSS only, no portal). Bottom by default so it isn't clipped by a
 * panel's top edge; top where there's no room below.
 */
export const Tooltip: FC<TooltipProps> = ({ label, side = 'bottom', children, className }) => (
  <span className={cn('group/tooltip relative inline-flex', className)}>
    {children}
    <span
      role='tooltip'
      className={cn(
        'pointer-events-none absolute left-1/2 z-[60] -translate-x-1/2 whitespace-nowrap rounded-2 bg-text-primary px-2 py-1 text-caption leading-none text-common-white opacity-0 shadow-[0_4px_16px_-4px_rgba(33,33,52,0.35)] transition-opacity duration-150 group-hover/tooltip:opacity-100',
        side === 'bottom' ? 'top-full mt-1.5' : 'bottom-full mb-1.5'
      )}
    >
      {label}
    </span>
  </span>
);
