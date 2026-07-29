import { type FC } from 'react';

/** Ruler label: "10s" up to a minute, then "M:SS" (matches the reference). */
const formatMarker = (sec: number): string => {
  if (sec <= 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
};

interface TimelineRulerProps {
  pxPerSec: number;
  durationSec: number;
  /** Spacing between labelled markers, in seconds. */
  stepSec?: number;
}

export const TimelineRuler: FC<TimelineRulerProps> = ({ pxPerSec, durationSec, stepSec = 10 }) => {
  const markers: number[] = [];
  for (let sec = 0; sec <= durationSec; sec += stepSec) markers.push(sec);

  return (
    <div className='relative h-7 border-t border-os-divider'>
      {markers.map((sec) => (
        <div
          key={sec}
          className='absolute inset-y-0'
          style={{ left: sec * pxPerSec }}
        >
          {/* Tick pinned to the top; the seconds label sits below it. */}
          <span className='absolute top-0 left-0 h-2 w-px bg-os-divider' />
          <span className='absolute top-3 left-0 text-caption-xs leading-none whitespace-nowrap text-text-secondary'>
            {formatMarker(sec)}
          </span>
        </div>
      ))}
    </div>
  );
};
