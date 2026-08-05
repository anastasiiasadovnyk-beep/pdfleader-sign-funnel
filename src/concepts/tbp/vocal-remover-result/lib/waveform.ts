/** Pure helpers for the stem waveform. No side effects, no `Math.random` — bar
 * heights are a deterministic function of the index + a per-track seed so the
 * same track always renders the same silhouette (and the fidelity gate is
 * stable across runs). */

/** Deterministic 0..1 pseudo-noise from an integer (hash-like, no globals). */
function noise(n: number): number {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Build `count` bar heights in the 0.16–1 range, shaped like an audio envelope
 * (a few loud peaks over a quieter bed) so it reads as a real waveform. `seed`
 * varies BOTH the envelope frequency and the grain, so different stems get
 * visibly distinct silhouettes (e.g. instrumental vs vocals).
 */
export function makeBars(count: number, seed: number): number[] {
  const freq = 2 + (seed % 5); // 2–6 envelope cycles → distinct overall shape
  const bars: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const env = 0.5 + 0.5 * Math.sin((i / count) * Math.PI * freq + seed * 1.7);
    const grain = noise(i + seed * 131);
    const h = Math.abs(env) * (0.3 + 0.7 * grain);
    bars.push(Math.max(0.16, Math.min(1, h)));
  }
  return bars;
}

/** Index (exclusive) up to which bars are playable given a 0–1 preview ratio. */
export function playableCount(count: number, previewRatio: number): number {
  return Math.round(count * Math.max(0, Math.min(1, previewRatio)));
}
