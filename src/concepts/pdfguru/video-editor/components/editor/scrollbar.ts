/**
 * A thin, rounded, always-on scrollbar for overflowing sidebar areas (tool rail
 * and the expanded tab content): 6px wide, ~80px rounded thumb, shown only when
 * the content is taller than the viewport.
 */
export const THIN_SCROLLBAR =
  '[scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:min-h-20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20';
