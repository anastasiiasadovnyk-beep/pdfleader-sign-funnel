import { type FC } from 'react';

import { MdVerified } from 'react-icons/md';

/**
 * Reviewer annotation (not part of the product UI): a small fixed pill marking
 * that this screen is a faithful copy of production — no design changes. Pinned
 * to the bottom-left, above the gallery flow bar, and click-through.
 */
export const ProdNoteBadge: FC = () => (
  <div className='pointer-events-none fixed bottom-[60px] left-3 z-[60] flex items-center gap-1.5 rounded-full bg-text-primary/90 px-3 py-1.5 text-caption font-medium text-common-white shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]'>
    <MdVerified className='size-4 shrink-0 text-[#4ade80]' />
    Без змін відносно проду
  </div>
);
