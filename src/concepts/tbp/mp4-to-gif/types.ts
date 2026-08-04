/** Contract for the MP4 → GIF builder screen (TheBestPDF).
 * The root props are a composition of region contracts; the interactive state
 * (trim window + settings) is seeded from `initial*` props and owned by
 * `hooks/useMp4ToGifModel` — the integration seam that becomes store state. */

/** One selectable aspect ratio. `w`/`h` drive the preview frame proportions. */
export type AspectRatio = {
  id: string;
  /** Short descriptor shown as the menu item's first line, e.g. "Widescreen". */
  name: string;
  /** Full control / trigger copy, e.g. "Widescreen 16:9". */
  label: string;
  w: number;
  h: number;
};

/** A generic labelled option used by the Speed / FPS / Quality controls.
 * `caption` is an optional second line (e.g. a quality's estimated size). */
export type Option = { id: string; label: string; caption?: string };

/** The uploaded source clip. */
export type VideoMeta = {
  fileName: string;
  /** Human-readable size, e.g. "2.1MB". */
  fileSize: string;
  /** Total clip length in seconds — drives the ruler and trim bounds. */
  durationSec: number;
  /** Optional poster frame shown in the preview stage. */
  posterSrc?: string;
  /** Playable source (object URL for a locally-picked file, or a real URL). */
  src?: string;
};

/** The [start, end] second window the user turns into a GIF. */
export type TrimState = { startSec: number; endSec: number };

/** The currently-selected GIF settings (all ids reference the option lists). */
export type GifSettings = {
  ratioId: string;
  speedId: string;
  fpsId: string;
  qualityId: string;
  loop: boolean;
};

export type Mp4ToGifProps = {
  video: VideoMeta;
  ratios: AspectRatio[];
  speeds: Option[];
  fpsOptions: Option[];
  qualities: Option[];
  /** Maximum GIF length in seconds (the trim window can't exceed it), e.g. 6. */
  maxClipSec: number;
  /** Minimum GIF length in seconds (the trim window can't shrink below it), e.g. 2. */
  minClipSec: number;

  // Copy (kept as props so integration maps them to i18n keys) ----------------
  hint: string;
  panelTitle: string;
  changeLabel: string;
  ctaLabel: string;
  ratioLabel: string;
  ratioHint: string;
  speedLabel: string;
  speedHint: string;
  fpsLabel: string;
  fpsHint: string;
  qualityLabel: string;
  qualityHint: string;
  loopLabel: string;
  loopHint: string;

  // Interaction seed (→ slice initial state on integration) -------------------
  initialTrim: TrimState;
  initialSettings: GifSettings;

  // Callbacks (→ dispatched thunks / navigation) ------------------------------
  onChangeFile?: () => void;
  onConvert?: (settings: GifSettings, trim: TrimState) => void;
};
