import type { AspectRatio, Mp4ToGifProps, Option } from './types';

const ratios: AspectRatio[] = [
  { id: 'wide', name: 'Widescreen', label: 'Widescreen 16:9', w: 16, h: 9 },
  { id: 'portrait', name: 'Portrait', label: 'Portrait 9:16', w: 9, h: 16 },
  { id: 'square', name: 'Square', label: 'Square 1:1', w: 1, h: 1 },
  { id: 'landscape', name: 'Landscape', label: 'Landscape 4:3', w: 4, h: 3 },
  { id: 'landscape-post', name: 'Landscape Post', label: 'Landscape Post 5:4', w: 5, h: 4 },
  { id: 'vertical', name: 'Vertical', label: 'Vertical 2:3', w: 2, h: 3 },
];

const speeds: Option[] = [
  { id: '0.5x', label: '0.5x' },
  { id: '1x', label: '1x' },
  { id: '1.5x', label: '1.5x' },
  { id: '2x', label: '2x' },
  { id: '3x', label: '3x' },
];

const fpsOptions: Option[] = [
  { id: '10', label: '10 FPS' },
  { id: '15', label: '15 FPS' },
  { id: '24', label: '24 FPS' },
  { id: '30', label: '30 FPS' },
];

const qualities: Option[] = [
  { id: 'small', label: 'Small', caption: '~ 26KB' },
  { id: 'balanced', label: 'Balanced', caption: '~ 50KB' },
  { id: 'maximum', label: 'Maximum', caption: '~ 109KB' },
];

const mock: Mp4ToGifProps = {
  video: { fileName: 'screen_recording_userfile.mp4', fileSize: '2.1MB', durationSec: 26 },
  ratios,
  speeds,
  fpsOptions,
  qualities,
  maxClipSec: 6,
  minClipSec: 2,

  hint: 'Choose 2 to 6 seconds of your video to turn into a GIF.',
  panelTitle: 'GIF settings',
  changeLabel: 'Change file',
  ctaLabel: 'Convert & download',
  ratioLabel: 'Ratio',
  ratioHint: 'Choose the ratio that suits you best.',
  speedLabel: 'Speed',
  speedHint: 'Choose the speed of your GIF.',
  fpsLabel: 'Frame rate (FPS)',
  fpsHint: 'More frames look smoother but add to file size.',
  qualityLabel: 'GIF’s quality',
  qualityHint: 'Higher quality keeps colors sharp, but weighs more.',
  loopLabel: 'Loop',
  loopHint: 'Your GIF replays automatically instead of stopping.',

  initialTrim: { startSec: 0, endSec: 6 },
  initialSettings: { ratioId: 'wide', speedId: '1x', fpsId: '10', qualityId: 'balanced', loop: true },

  onChangeFile: () => console.log('change file'),
  onConvert: (settings, trim) => console.log('convert', settings, trim),
};
export default mock;

/** State 2 — a portrait 9:16 clip; the preview frame is pillarboxed. */
export const portrait: Mp4ToGifProps = {
  ...mock,
  initialSettings: { ...mock.initialSettings, ratioId: 'portrait' },
};
