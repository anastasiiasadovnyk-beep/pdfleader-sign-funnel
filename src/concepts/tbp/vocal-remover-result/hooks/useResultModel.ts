import { useState } from 'react';
import type { TrackRating, VocalRemoverResultProps } from '../types';

/**
 * View-model for the result screen. Owns only presentational interaction —
 * which stem is shown as playing, and the thumbs rating — seeded from the
 * `initial*` props. Shaped as { state, actions } so integration is a wiring:
 * `state` → slice state, `actions` → dispatched thunks. No data-fetch, no store.
 */
export function useResultModel(props: VocalRemoverResultProps) {
  const [playingId, setPlayingId] = useState<string | null>(props.initialPlayingId ?? null);
  const [rating, setRating] = useState<TrackRating | null>(props.initialRating ?? null);

  const actions = {
    togglePlay(id: string) {
      setPlayingId((cur) => (cur === id ? null : id));
      props.onTogglePlay?.(id);
    },
    downloadTrack(id: string) {
      props.onDownloadTrack?.(id);
    },
    downloadAll() {
      props.onDownloadAll?.();
    },
    changeFile() {
      props.onChangeFile?.();
    },
    rate(next: TrackRating) {
      setRating((cur) => (cur === next ? null : next));
      props.onRate?.(next);
    },
  };

  return { state: { playingId, rating }, actions };
}
