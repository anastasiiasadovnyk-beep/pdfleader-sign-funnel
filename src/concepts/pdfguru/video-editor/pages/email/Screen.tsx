import { type FC } from 'react';

import { EmailModal } from '../../components/editor/EmailModal';
import { ProdNoteBadge } from '../../components/funnel/ProdNoteBadge';

interface EmailScreenProps {
  /** Closes the modal (X) — returns to the previous step. */
  onBack?: () => void;
  /** Submitting a valid email advances to the plan step. */
  onNext?: () => void;
}

/**
 * Screen 4 — Email. Opens once rendering finishes (all steps green): the
 * "Your file is ready" account/email capture over a dimmed stage. Mobile fills
 * the screen; desktop is a centered card. Submitting advances to the paywall.
 */
const EmailScreen: FC<EmailScreenProps> = ({ onBack, onNext }) => (
  <div className='flex h-screen w-full items-stretch justify-center bg-black/60 sm:items-center sm:p-6'>
    <ProdNoteBadge />
    <EmailModal
      onClose={onBack}
      onSubmit={onNext}
    />
  </div>
);

export default EmailScreen;
