import { type FC } from 'react';

import starsUrl from 'components/Trustpilot/assets/stars.svg';

/** Compact Trustpilot rating shown under the hero card ("Great · 4½ stars · N reviews"). */
export const TrustpilotBadge: FC = () => (
  <div className='flex items-center gap-2 text-body-2 text-text-primary'>
    <span className='font-[800]'>Great</span>
    <img
      src={starsUrl}
      alt='4.5 out of 5 stars'
      width={110}
    />
    <span className='text-text-secondary'>
      <span className='font-[700] text-text-primary'>7,449</span> reviews on{' '}
      <span className='font-[700]'>Trustpilot</span>
    </span>
  </div>
);
