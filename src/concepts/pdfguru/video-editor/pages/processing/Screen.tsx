import { type FC } from 'react';

import { RenderingCard } from '../../components/editor/RenderingCard';

interface ProcessingScreenProps {
  /** Returns to the editor (provided by the flow host). */
  onBack?: () => void;
  /** Advances to the email step once rendering finishes. */
  onNext?: () => void;
}

/**
 * Screen 3 — Processing. Shown after choosing an export format in the editor:
 * the "Rendering your video" modal over a dimmed stage. When every render step
 * is done, it hands off to the email step (Step 4).
 */
const ProcessingScreen: FC<ProcessingScreenProps> = ({ onBack, onNext }) => (
  // Mobile: the modal fills the whole screen. Desktop: a centered card.
  <div className='flex h-screen w-full items-stretch justify-center bg-text-primary/50 md:items-center md:p-4'>
    <RenderingCard
      onBack={onBack}
      onComplete={onNext}
    />
  </div>
);

export default ProcessingScreen;
