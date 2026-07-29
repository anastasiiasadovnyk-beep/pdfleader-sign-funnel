import { type FC } from 'react';

interface DashedGradientBorderProps {
  /** Rendered in the error state as a solid red border instead of the gradient. */
  isError?: boolean;
}

/**
 * The dropzone's signature multi-color dashed outline. An absolutely-positioned
 * SVG that fills its relative parent; `vector-effect` keeps the stroke crisp as
 * the card scales responsively.
 */
export const DashedGradientBorder: FC<DashedGradientBorderProps> = ({ isError }) => (
  <svg
    className='pointer-events-none absolute inset-0 h-full w-full'
    fill='none'
    preserveAspectRatio='none'
    aria-hidden='true'
  >
    <defs>
      <linearGradient
        id='dropzone-border-gradient'
        x1='0'
        y1='0'
        x2='1'
        y2='1'
      >
        {/* Full rainbow sweep across the dashed outline */}
        <stop
          offset='0'
          stopColor='#FF3B30'
        />
        <stop
          offset='0.16'
          stopColor='#FF9500'
        />
        <stop
          offset='0.33'
          stopColor='#FFCC00'
        />
        <stop
          offset='0.5'
          stopColor='#34C759'
        />
        <stop
          offset='0.66'
          stopColor='#00C7BE'
        />
        <stop
          offset='0.83'
          stopColor='#0A84FF'
        />
        <stop
          offset='1'
          stopColor='#AF52DE'
        />
      </linearGradient>
    </defs>
    <rect
      x='1'
      y='1'
      width='calc(100% - 2px)'
      height='calc(100% - 2px)'
      rx='19'
      ry='19'
      stroke={isError ? '#d2294b' : 'url(#dropzone-border-gradient)'}
      strokeWidth='2'
      strokeDasharray='7 7'
      vectorEffect='non-scaling-stroke'
    />
  </svg>
);
