/** The uploaded track being processed, shown in the file row. */
export type ProcessingFile = {
  /** File format label rendered in the badge chip, e.g. "MP3". */
  format: string;
  /** Original file name, e.g. "users_song.mp3". */
  name: string;
  /** Human-readable size, e.g. "12.87 MB". */
  sizeLabel: string;
  /** Human-readable duration, e.g. "1:25s". */
  durationLabel: string;
};

export type VocalRemoverProcessingProps = {
  /** Modal heading, e.g. "Splitting your track...". */
  title: string;
  /** The track being split. */
  file: ProcessingFile;
  /** Completion percentage 0–100. Drives the progress bar and the % label. */
  progress: number;
  /** Copy under the progress bar, e.g. "Estimated time: 1m". */
  estimatedTimeLabel: string;
  /** Reassurance callout copy shown in the bordered info box. */
  info: string;
};
