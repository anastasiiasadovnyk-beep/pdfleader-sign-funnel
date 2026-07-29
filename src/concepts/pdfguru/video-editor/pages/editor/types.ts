/**
 * The editor screen owns its own state (tracks, clips, playhead) via the
 * `useEditorState` / `useTimelineEditor` hooks, seeded from `model/editorData`.
 * It takes no data props, only the flow-host `onBack` callback.
 */
export type EditorMock = Record<string, never>;
