/**
 * A thin, rounded, always-on scrollbar for overflowing sidebar areas (tool rail
 * and the expanded tab content): 6px wide, ~80px rounded thumb, shown only when
 * the content is taller than the viewport.
 */
export const THIN_SCROLLBAR =
  '[scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:min-h-20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20';

/** Horizontal counterpart: a 6px-tall rounded track with a ~80px thumb, always
 *  shown when a row scrolls sideways (e.g. the Elements shapes/stickers rows). */
export const THIN_SCROLLBAR_X =
  '[scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:min-w-20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20';
