/** Contract for the Vocal Remover **result** screen (TheBestPDF) — the B variant
 * of the vocal-remover result A/B test. The root props are a composition of
 * region contracts; the interactive bits (which track is playing + the thumbs
 * rating) are seeded from `initial*` props and owned by
 * `hooks/useResultModel` — the integration seam that becomes store state. */

/** Which separated stem a track row represents. Drives the leading icon and the
 * badge color (instrumental → success/green, vocals → primary/blue,
 * original → grey). */
export type TrackKind = 'instrumental' | 'vocals' | 'original';

/** One row in the "Separated tracks" list — a stem with its own waveform player. */
export type SeparatedTrack = {
  id: string;
  kind: TrackKind;
  /** Uppercase overline chip, e.g. "INSTRUMENTAL TRACK" / "ISOLATED VOICE" / "ORIGIN". */
  badgeLabel: string;
  /** Track name, e.g. "Instrumental" / "Vocals" / "users_song". */
  name: string;
  /** File-extension suffix rendered next to the name, e.g. ".mp3". */
  format: string;
  /** Current playhead label, e.g. "0:00". */
  currentTimeLabel: string;
  /** Total-length label, e.g. "2:12". */
  durationLabel: string;
  /** 0–1 fraction of the track that is playable in-page; 1 = the whole track,
   * <1 = a preview-gated stem whose tail is locked behind download. */
  previewRatio: number;
  /** 0–1 playhead position (drives the thumb + played portion of the waveform). */
  playedRatio: number;
  /** True when the stem is preview-limited (needs a download for the full track). */
  locked: boolean;
};

/** The uploaded source file, shown in the "Original track" row. */
export type OriginalFile = {
  /** File name, e.g. "users_song.mp3". */
  name: string;
  /** Human-readable size, e.g. "12.87 MB". */
  sizeLabel: string;
  /** Human-readable duration, e.g. "1:25s". */
  durationLabel: string;
};

/** One check-marked reassurance item in the feature row under the title. */
export type ResultFeature = { label: string };

export type VocalRemoverResultProps = {
  /** Page heading, e.g. "Voice is removed". */
  title: string;
  /** Sub-heading under the title. */
  subtitle: string;
  /** Check-marked feature/reassurance items rendered as a centered row. */
  features: ResultFeature[];

  /** Section label for the uploaded file, e.g. "Original track". */
  originalLabel: string;
  original: OriginalFile;
  /** Label for the "replace uploaded file" control, e.g. "Change". */
  changeLabel: string;

  /** Section label for the AI stems, e.g. "Separated tracks". */
  separatedLabel: string;
  /** Primary CTA label, e.g. "Download both (.zip)". */
  downloadAllLabel: string;
  tracks: SeparatedTrack[];

  /** Prompt for the thumbs rating, e.g. "Rate the result:". */
  rateLabel: string;
  /** Confirmation shown for 3s after a rating, e.g. "Thanks for your feedback". */
  thanksLabel: string;

  /** Seeds `useResultModel`: id of the track shown as playing on mount (or null). */
  initialPlayingId?: string | null;
  /** Seeds `useResultModel`: pre-selected rating on mount (or null). */
  initialRating?: TrackRating | null;

  onChangeFile?: () => void;
  onDownloadAll?: () => void;
  onDownloadTrack?: (id: string) => void;
  onTogglePlay?: (id: string) => void;
  onRate?: (rating: TrackRating) => void;
};

export type TrackRating = 'up' | 'down';
