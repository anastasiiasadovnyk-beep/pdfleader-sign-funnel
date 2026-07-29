import type { IconType } from 'react-icons';
import { MdCrop54, MdCrop169, MdCropLandscape, MdCropPortrait, MdCropSquare } from 'react-icons/md';
import { SiFacebook, SiInstagram, SiTiktok, SiYoutube, SiYoutubeshorts } from 'react-icons/si';

export interface ToolTab {
  id: string;
  label: string;
  /** Material Symbols glyph name. Rendered outlined (FILL 0) when inactive and
   *  filled (FILL 1) when active — same glyph, weight 300. */
  iconName: string;
  /** Whether this tab can add new items (Canvas is settings-only). */
  addable: boolean;
}

/** Left tool rail tabs, in the fixed top-to-bottom order defined by the spec. */
export const TOOL_TABS: ToolTab[] = [
  { id: 'video', label: 'Video', iconName: 'movie', addable: true },
  { id: 'canvas', label: 'Canva', iconName: 'aspect_ratio', addable: false },
  { id: 'text', label: 'Text', iconName: 'text_fields', addable: true },
  { id: 'audio', label: 'Audio', iconName: 'music_note', addable: true },
  { id: 'images', label: 'Images', iconName: 'image', addable: true },
  { id: 'elements', label: 'Elements', iconName: 'category', addable: true },
  { id: 'subtitles', label: 'Subtitles', iconName: 'subtitles', addable: true },
  { id: 'tts', label: 'TTS', iconName: 'record_voice_over', addable: true },
  { id: 'record', label: 'Record', iconName: 'fiber_manual_record', addable: true }
];

/** Maps a selected timeline clip's kind to the tool tab that edits it. */
export const CLIP_KIND_TO_TAB: Record<string, string> = {
  video: 'video',
  text: 'text',
  audio: 'audio',
  image: 'images',
  shape: 'elements',
  subtitle: 'subtitles'
};

/** Canvas tab — aspect-ratio presets and background swatches. */
export interface AspectRatioOption {
  name: string;
  ratio: string;
  icon: IconType;
}

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { name: 'Youtube', ratio: '16:9', icon: SiYoutube },
  { name: 'YouTube Shorts', ratio: '9:16', icon: SiYoutubeshorts },
  { name: 'TikTok', ratio: '9:16', icon: SiTiktok },
  { name: 'Instagram Story/Reel', ratio: '9:16', icon: SiInstagram },
  { name: 'Instagram Post Square', ratio: '1:1', icon: SiInstagram },
  { name: 'Instagram Post', ratio: '9:16', icon: SiInstagram },
  { name: 'Facebook Story', ratio: '9:16', icon: SiFacebook },
  { name: 'Widescreen', ratio: '16:9', icon: MdCrop169 },
  { name: 'Portrait', ratio: '9:16', icon: MdCropPortrait },
  { name: 'Square', ratio: '1:1', icon: MdCropSquare },
  { name: 'Landscape', ratio: '4:3', icon: MdCropLandscape },
  { name: 'Landscape Post', ratio: '5:4', icon: MdCrop54 },
  { name: 'Vertical', ratio: '2:3', icon: MdCropPortrait }
];

/** Default aspect ratio shown on the Canvas tab. */
export const DEFAULT_ASPECT_RATIO = ASPECT_RATIO_OPTIONS[7]; // Widescreen 16:9

export const BACKGROUND_COLORS = ['#5f30e2', '#f59e0b', '#6b7280', '#065f46', '#d2294b'] as const;

export interface MediaItem {
  id: string;
  type: 'video' | 'text';
  /** For video items — the filename shown under the thumbnail. */
  name?: string;
  /** For text items — the text content shown in the card. */
  text?: string;
}

/** Mock contents of the Media drawer ("Your media:"). */
export const MEDIA_ITEMS: MediaItem[] = [
  { id: 'm1', type: 'video', name: 'user_video_kcdn…' },
  { id: 'm2', type: 'video', name: 'user_video_kcdn…' },
  { id: 't1', type: 'text', text: 'Hello world!' }
];

/** Total project duration in seconds (03:24 in the reference). */
export const TOTAL_DURATION_SEC = 204;

/** Horizontal timeline scale at zoom = 1. */
export const BASE_PX_PER_SECOND = 11;

export type ClipKind = 'video' | 'text' | 'audio' | 'image' | 'shape' | 'subtitle';

export interface TimelineClip {
  id: string;
  kind: ClipKind;
  startSec: number;
  endSec: number;
  label?: string;
  /** Tailwind gradient classes for the video filmstrip look. */
  tone?: string;
  /** Text styling classes for a text layer's on-canvas rendering. */
  styleClassName?: string;
  /** For shape elements: a Material icon to render (stickers/emoji use `label`). */
  icon?: IconType;
  /** Element category label shown on the timeline ('Shape' | 'Sticker' | 'Emoji'). */
  category?: string;
  /** Fill color for a shape element. */
  color?: string;
  /** Links the clip to its source item in the Media drawer (deleted together). */
  mediaId?: string;
  /** Canvas layout: center position (percent of stage), scale, rotation, flips. */
  xPct?: number;
  yPct?: number;
  scale?: number;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
  /** Video crop: fraction (0–1) of the fitted frame kept along each axis. */
  cropW?: number;
  cropH?: number;
  /** Object URL of an uploaded image/video, rendered on the canvas when set. */
  src?: string;
}

/** New canvas elements start centered, unscaled and unrotated. */
export const DEFAULT_CANVAS_LAYOUT = { xPct: 50, yPct: 50, scale: 1, rotation: 0 };

export type TrackKind = 'audio' | 'video' | 'text' | 'image' | 'shape' | 'subtitle';

export interface TimelineTrack {
  id: string;
  kind: TrackKind;
  clips: TimelineClip[];
}

/**
 * Fixed vertical stacking order, top → bottom on the timeline:
 * shape (top) · image · text · subtitle · video · audio (bottom). Rows are
 * rendered by this order regardless of insertion order; video is always a
 * single row.
 */
export const TRACK_ZONE_ORDER: Record<TrackKind, number> = {
  shape: 0,
  image: 1,
  text: 2,
  subtitle: 3,
  video: 4,
  audio: 5
};

/** Row heights: the video row is the tallest (44px); every other row is 32px. */
export const VIDEO_ROW_HEIGHT_PX = 44;
export const OVERLAY_ROW_HEIGHT_PX = 32;

/** Max rows on the timeline: 1 audio + 1 video + up to 4 overlay (text/image/shape/subtitle). */
export const MAX_TIMELINE_ROWS = 6;

/**
 * Mock timeline. Video clips share a single video row (multiple clips per row);
 * text / image / shape elements each get their own overlay row above the video.
 */
export const TIMELINE_TRACKS: TimelineTrack[] = [
  {
    id: 'video',
    kind: 'video',
    clips: [
      {
        id: 'c1',
        kind: 'video',
        startSec: 0,
        endSec: 15,
        tone: 'from-sky-200 to-indigo-200',
        mediaId: 'm1',
        ...DEFAULT_CANVAS_LAYOUT
      },
      {
        id: 'c3',
        kind: 'video',
        startSec: 16,
        endSec: 31,
        tone: 'from-amber-200 to-orange-300',
        mediaId: 'm2',
        ...DEFAULT_CANVAS_LAYOUT
      }
    ]
  },
  {
    id: 'text',
    kind: 'text',
    clips: [{ id: 'c2', kind: 'text', startSec: 18, endSec: 40, label: 'Hello world!', mediaId: 't1' }]
  }
];
