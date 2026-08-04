/** Pure timeline math — no DOM, no side effects. Positions are expressed as
 * percentages of the clip duration so the track stays fluid across breakpoints. */

/** Seconds → "M:SS" clock (e.g. 6 → "0:06", 26 → "0:26"). */
export const formatClock = (totalSeconds: number): string => {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(clamped / 60);
  const ss = clamped % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
};

/** Labelled ruler markers: every `stepSec` from 0, always including the final
 * duration. A regular tick within `stepSec/2` of the end is dropped so its label
 * never collides with the right-aligned final one. */
export const rulerMarkers = (durationSec: number, stepSec = 5): number[] => {
  const marks: number[] = [];
  for (let sec = 0; sec < durationSec; sec += stepSec) marks.push(sec);
  const last = marks[marks.length - 1];
  if (durationSec - last < stepSec / 2) marks.pop();
  marks.push(durationSec);
  return marks;
};

/** A value in seconds → its left offset on the track, as a 0–100 percentage. */
export const pct = (sec: number, durationSec: number): number =>
  durationSec <= 0 ? 0 : Math.min(100, Math.max(0, (sec / durationSec) * 100));

/** Clamp an [start, end] trim window to the clip and to the max GIF length. */
export const clampTrim = (
  startSec: number,
  endSec: number,
  durationSec: number,
  maxClipSec: number,
): { startSec: number; endSec: number } => {
  const start = Math.min(Math.max(0, startSec), durationSec);
  const end = Math.min(Math.max(start, endSec), Math.min(durationSec, start + maxClipSec));
  return { startSec: start, endSec: end };
};
