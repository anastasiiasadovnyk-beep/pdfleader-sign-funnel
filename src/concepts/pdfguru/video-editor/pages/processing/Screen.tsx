import { type FC } from 'react';

import { RenderingCard } from '../../components/editor/RenderingCard';

/**
 * Screen 3 — Processing. Shown after choosing an export format in the editor:
 * the "Rendering your video" modal over a dimmed stage while the timeline is
 * turned into a finished file.
 */
const ProcessingScreen: FC = () => (
  <div className='flex h-screen w-full items-center justify-center bg-text-primary/50 p-4'>
    <RenderingCard />
  </div>
);

export default ProcessingScreen;
