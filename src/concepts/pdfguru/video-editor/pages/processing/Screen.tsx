import { type FC } from 'react';

import { RenderingCard } from '../../components/editor/RenderingCard';

/**
 * Screen 3 — Processing. Shown after choosing an export format in the editor:
 * the "Rendering your video" modal over a dimmed stage while the timeline is
 * turned into a finished file.
 */
const ProcessingScreen: FC = () => (
  // Mobile: the modal fills the whole screen. Desktop: a centered card.
  <div className='flex h-screen w-full items-stretch justify-center bg-text-primary/50 md:items-center md:p-4'>
    <RenderingCard />
  </div>
);

export default ProcessingScreen;
