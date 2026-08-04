import type { FC, SVGProps } from 'react';

/** Inline icon set — ui-pes ships no icon set (see DS-GAPS.md). Each icon draws
 * with `currentColor` so callers control color via a `text-*` token utility, and
 * sizing via height/width utility classes. No fixed colors baked in. */

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

export const RefreshIcon: FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export const ChevronDownIcon: FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const DownloadIcon: FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M12 3v12" />
    <path d="m7 11 5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
);

export const PlayIcon: FC<IconProps> = (props) => (
  <svg {...base({ fill: 'currentColor', stroke: 'none', ...props })}>
    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
  </svg>
);

/** A small aspect-ratio glyph — a rounded rectangle whose proportions hint the
 * ratio (fit inside a 16-unit box, centred in the 24 viewBox). */
export const RatioGlyph: FC<IconProps & { w: number; h: number }> = ({ w, h, ...props }) => {
  const box = 16;
  const gw = w >= h ? box : (box * w) / h;
  const gh = w >= h ? (box * h) / w : box;
  const x = (24 - gw) / 2;
  const y = (24 - gh) / 2;
  return (
    <svg {...base({ className: 'h-4 w-4', ...props })}>
      <rect x={x} y={y} width={gw} height={gh} rx="2" />
    </svg>
  );
};
