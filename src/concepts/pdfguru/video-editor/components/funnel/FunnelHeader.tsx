import { Fragment, type FC } from 'react';

import { MdCheck } from 'react-icons/md';

import { cn } from '@universe-forma/ui-pes';

import logo from '../../assets/new-logo-pdf-guru.svg';

/** The four funnel steps shown in the header progress stepper. */
const STEPS = ['Document is ready', 'Select plan', 'Payment details', 'Download'];

interface FunnelHeaderProps {
  /** 1-based index of the active step (2 = Select plan, 3 = Payment details). */
  active: number;
}

/**
 * Payment-funnel top bar (Select plan / Payment): PDF Guru logo on the left and
 * a 4-step progress stepper on the right — completed steps show a green check,
 * the active step a filled purple circle, upcoming steps a muted number. Labels
 * are hidden on mobile, leaving just the numbered circles.
 */
export const FunnelHeader: FC<FunnelHeaderProps> = ({ active }) => (
  <header className='flex w-full shrink-0 items-center justify-between gap-4 border-b border-os-divider bg-bg-white-bg px-4 py-3 md:px-8'>
    <img
      src={logo}
      alt='PDF Guru'
      className='h-7 shrink-0 md:h-8'
    />
    <ol className='flex items-center'>
      {STEPS.map((label, index) => {
        const step = index + 1;
        const done = step < active;
        const current = step === active;
        return (
          <Fragment key={label}>
            {index > 0 && <span className='mx-1.5 h-px w-4 bg-os-divider md:mx-3 md:w-8' />}
            <li className='flex items-center gap-2'>
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-caption font-bold',
                  done && 'bg-[#009B63] text-common-white',
                  current && 'bg-primary text-common-white',
                  !done && !current && 'bg-os-divider text-text-secondary'
                )}
              >
                {done ? <MdCheck className='size-4' /> : step}
              </span>
              <span
                className={cn(
                  'hidden whitespace-nowrap text-body-2 md:inline',
                  current ? 'font-semibold text-text-primary' : 'text-text-secondary'
                )}
              >
                {label}
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  </header>
);
