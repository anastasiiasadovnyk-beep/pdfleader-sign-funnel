import { useEffect, useMemo, useState } from 'react';

/** Breakpoint tokens the editor needs. `md` = 64rem / 1024px, matching the `md:` CSS split. */
const DEVICE_SIZES_MAP = {
  xs: '22.5rem',
  sm: '37.5rem',
  md: '64rem',
  lg: '90rem'
} as const;

type DeviceSizeKey = keyof typeof DEVICE_SIZES_MAP;
type Direction = 'min' | 'max';
export type BreakpointKey = `${Direction}-${DeviceSizeKey}`;

/**
 * Self-contained media-query hook for the video-editor concept. Client-only
 * (modals, responsive splits) — mirrors the host app's `useMediaQuery` so the
 * editor's desktop/mobile layout switch works unchanged.
 */
export function useMediaQuery(key: BreakpointKey): boolean {
  const query = useMemo(() => {
    const [direction, size] = key.split('-') as [Direction, DeviceSizeKey];
    return `(${direction}-width: ${DEVICE_SIZES_MAP[size]})`;
  }, [key]);

  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const matchMedia = window.matchMedia(query);
    const handleChange = () => setMatches(matchMedia.matches);
    handleChange();
    matchMedia.addEventListener('change', handleChange);
    return () => matchMedia.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}
