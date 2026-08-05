import type { SeparatedTrack, VocalRemoverResultProps } from './types';

/* eslint-disable no-console */
const log = (msg: string) => () => console.log(msg);

const tracks: SeparatedTrack[] = [
  {
    id: 'instrumental',
    kind: 'instrumental',
    badgeLabel: 'BACKING TRACK',
    name: 'Instrumental',
    format: '.mp3',
    currentTimeLabel: '0:00',
    durationLabel: '2:12',
    previewRatio: 0.36,
    playedRatio: 0,
    locked: true,
  },
  {
    id: 'vocals',
    kind: 'vocals',
    badgeLabel: 'ISOLATED VOICE',
    name: 'Vocals',
    format: '.mp3',
    currentTimeLabel: '0:00',
    durationLabel: '2:12',
    previewRatio: 0.36,
    playedRatio: 0,
    locked: true,
  },
  {
    id: 'original',
    kind: 'original',
    badgeLabel: 'ORIGIN',
    name: 'users_song',
    format: '.mp3',
    currentTimeLabel: '0:00',
    durationLabel: '2:12',
    previewRatio: 1,
    playedRatio: 0,
    locked: false,
  },
];

const mock: VocalRemoverResultProps = {
  title: 'Voice is removed',
  subtitle:
    'Preview the first 30 seconds of each track.\nDownload to get the full-lenght vocals and instrumental.',
  features: [
    { label: 'Full-lenght tracks' },
    { label: 'High-quality MP3' },
    { label: 'Vocals & instrumental' },
  ],
  originalLabel: 'Original track',
  original: { name: 'users_song.mp3', sizeLabel: '12.87 MB', durationLabel: '1:25s' },
  changeLabel: 'Change',
  separatedLabel: 'Separated tracks',
  downloadAllLabel: 'Download both (.zip)',
  tracks,
  rateLabel: 'Rate the result:',
  thanksLabel: 'Thanks for your feedback!',
  initialPlayingId: null,
  initialRating: null,
  onChangeFile: log('change file'),
  onDownloadAll: log('download all'),
  onDownloadTrack: (id) => console.log('download track', id),
  onTogglePlay: (id) => console.log('toggle play', id),
  onRate: (r) => console.log('rate', r),
};

export default mock;

/** A stem mid-playback — the Vocals track is playing with the playhead partway. */
export const playing: VocalRemoverResultProps = {
  ...mock,
  initialPlayingId: 'vocals',
  tracks: mock.tracks.map((t) =>
    t.id === 'vocals' ? { ...t, currentTimeLabel: '0:12', playedRatio: 0.18 } : t,
  ),
};

/** After the user gives a thumbs-up. */
export const rated: VocalRemoverResultProps = {
  ...mock,
  initialRating: 'up',
};
