import type { VocalRemoverProcessingProps } from './types';

const mock: VocalRemoverProcessingProps = {
  title: 'Splitting your track...',
  file: {
    format: 'MP3',
    name: 'users_song.mp3',
    sizeLabel: '12.87 MB',
    durationLabel: '1:25s',
  },
  progress: 85,
  estimatedTimeLabel: 'Estimated time: 1m',
  info: 'We split your song into clean vocals and an instrumental track – perfect for karaoke, remixes and covers.',
};

export default mock;

/** Just-started state — progress bar near empty, longer estimate. */
export const start: VocalRemoverProcessingProps = {
  ...mock,
  progress: 12,
  estimatedTimeLabel: 'Estimated time: 3m',
};
