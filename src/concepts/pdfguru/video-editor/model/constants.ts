import { APP_PATH_PREFIX } from 'ts/constants/page-links';

/**
 * Static configuration for the Video Editor funnel.
 *
 * Copy lives here (not in i18n) on purpose: this is a self-contained, vibecoded
 * feature meant to be handed off. A developer can lift these strings into the
 * translation namespace in one place when the funnel graduates to production.
 */

/** Route paths for the video-editor funnel (full paths, incl. the `/app` prefix). */
export const VIDEO_EDITOR_ROUTES = {
  landing: `${APP_PATH_PREFIX}/video-editor`,
  editor: `${APP_PATH_PREFIX}/video-editor/edit`
} as const;

/** Paths relative to the `app/:language?` route group, for registration in App.tsx. */
export const VIDEO_EDITOR_ROUTE_PATHS = {
  landing: 'video-editor',
  editor: 'video-editor/edit'
} as const;

/** Maximum accepted upload size, in megabytes (matches the hero helper text). */
export const MAX_UPLOAD_SIZE_MB = 100;

/** Accepted upload container formats, in the order shown to the user. */
export const SUPPORTED_VIDEO_FORMATS = ['MP4', 'MOV', 'AVI', 'MKV', 'WebM', 'WMV'] as const;

/** File extensions matching SUPPORTED_VIDEO_FORMATS, used for validation fallback. */
export const SUPPORTED_VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv'] as const;

/** `accept` attribute for the native file input. */
export const VIDEO_FILE_INPUT_ACCEPT = 'video/*,.mp4,.mov,.avi,.mkv,.webm,.wmv';

/** Export formats offered in the editor's Download dropdown. */
export const EXPORT_FORMATS = ['MP4', 'MOV', 'WebM', 'GIF'] as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[number];
