import { type FC } from 'react';

import { EmailModal } from '../../components/editor/EmailModal';

interface EmailScreenProps {
  /** Closes the modal (X) — returns to the previous step. */
  onBack?: () => void;
}

/**
 * Screen 4 — Email. Opens once rendering finishes (all steps green): the
 * "Your file is ready" account/email capture over a dimmed stage. Mobile fills
 * the screen; desktop is a centered card.
 */
const EmailScreen: FC<EmailScreenProps> = ({ onBack }) => (
  <div className='flex h-screen w-full items-stretch justify-center bg-black/60 sm:items-center sm:p-6'>
    <EmailModal onClose={onBack} />
  </div>
);

export default EmailScreen;
