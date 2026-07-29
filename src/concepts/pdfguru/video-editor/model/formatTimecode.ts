/** Seconds → HH:MM:SS timecode (e.g. 204 → "00:03:24"). */
export const formatTimecode = (totalSeconds: number): string => {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hh = Math.floor(clamped / 3600);
  const mm = Math.floor((clamped % 3600) / 60);
  const ss = clamped % 60;
  return [hh, mm, ss].map((n) => String(n).padStart(2, '0')).join(':');
};
