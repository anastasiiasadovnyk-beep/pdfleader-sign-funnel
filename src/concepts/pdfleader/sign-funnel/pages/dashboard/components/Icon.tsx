import 'material-symbols/rounded.css';

import type { CSSProperties } from 'react';

import { cn } from '@universe-forma/ui-pes';

type IconProps = {
  /** Material Symbols Rounded glyph name, e.g. "download". */
  name: string;
  size?: number;
  filled?: boolean;
  weight?: number;
  className?: string;
};

/** Material Symbols Rounded glyph (page-local copy — each funnel page stays standalone). */
export function Icon({ name, size = 24, filled = false, weight = 400, className }: IconProps) {
  const style: CSSProperties = {
    fontSize: size,
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
  };
  return (
    <span
      aria-hidden
      className={cn('material-symbols-rounded shrink-0 select-none leading-none', className)}
      style={style}
    >
      {name}
    </span>
  );
}
