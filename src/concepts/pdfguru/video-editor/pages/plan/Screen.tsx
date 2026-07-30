import { type FC, useState } from 'react';

import { MdArrowForward, MdCheck, MdClose, MdRocketLaunch } from 'react-icons/md';

import { Button, cn } from '@universe-forma/ui-pes';

import { FunnelHeader } from '../../components/funnel/FunnelHeader';
import { ProdNoteBadge } from '../../components/funnel/ProdNoteBadge';

interface PlanScreenProps {
  /** Advances to the Payment step. */
  onNext?: () => void;
  /** Returns to the previous step. */
  onBack?: () => void;
}

/** Feature list shared by every plan; a plan marks which of these it unlocks. */
const FEATURES = [
  'Unlimited edits',
  'Unlimited downloads',
  'Multi-format conversion',
  'No installation required',
  'Edit text and images in PDF files',
  'Organize and reorder PDF pages',
  'Protect PDF with password',
  'Use PDF Guru on mobile'
];

interface Plan {
  id: string;
  title: string;
  price: string;
  period: string;
  note?: string;
  popular?: boolean;
  /** Which FEATURES this plan unlocks (rest render as unavailable). */
  unlocked: boolean[];
}

const T = true;
const F = false;

/** The three default production plans (Limited · Full · Annual). */
const PLANS: Plan[] = [
  {
    id: 'limited',
    title: '7-Day Limited Access',
    price: '$34.96',
    period: '/month',
    unlocked: [T, T, T, T, T, F, F, F]
  },
  {
    id: 'full',
    title: '7-Day Full Access',
    price: '$39.96',
    period: '/month',
    popular: true,
    unlocked: [T, T, T, T, T, T, T, T]
  },
  {
    id: 'annual',
    title: 'Annual Plan',
    price: '$5.83',
    period: '/month',
    note: 'Billed $69.96 per year',
    unlocked: [T, T, T, T, T, T, T, T]
  }
];

/**
 * Screen 5 — Select plan (paywall). Recreates PDF Guru's default (control)
 * pricing screen: funnel stepper, headline, three stacked plan cards with the
 * middle "7-Day Full Access" plan pre-selected and badged "Most popular", the
 * expanded plan's feature list, a Continue button and the trial/legal note.
 */
const PlanScreen: FC<PlanScreenProps> = ({ onNext }) => {
  const [selected, setSelected] = useState('full');
  const active = PLANS.find((plan) => plan.id === selected) ?? PLANS[1];

  return (
    <div className='flex min-h-screen w-full flex-col bg-bg-light-grey'>
      <ProdNoteBadge />
      <FunnelHeader active={2} />

      <main className='mx-auto flex w-full max-w-[1140px] flex-1 flex-col gap-8 px-4 py-8 md:flex-row md:items-start md:px-8 md:py-12'>
        {/* Left: file preview (sticky on desktop) */}
        <aside className='md:sticky md:top-8 md:w-[360px] md:shrink-0'>
          <div className='flex flex-col gap-3 rounded-6 bg-bg-white-bg p-4 shadow-[0_8px_30px_-12px_rgba(33,33,52,0.18)]'>
            <div className='aspect-video w-full rounded-3 bg-gradient-to-br from-sky-200 to-indigo-200' />
            <div className='flex items-center gap-2'>
              <span className='flex size-6 items-center justify-center rounded-full bg-[#009B63]'>
                <MdCheck className='size-4 text-common-white' />
              </span>
              <span className='truncate text-body-2 font-medium text-text-primary'>my_video.mp4 is ready</span>
            </div>
          </div>
        </aside>

        {/* Right: headline + plans + descriptor */}
        <section className='flex min-w-0 flex-1 flex-col gap-6'>
          <h1 className='text-desktop-title-3 font-[900] text-text-primary md:text-desktop-title-2'>
            Choose a plan to download your file
          </h1>

          <div className='flex flex-col gap-3'>
            {PLANS.map((plan) => {
              const isSelected = plan.id === selected;
              return (
                <button
                  key={plan.id}
                  type='button'
                  onClick={() => setSelected(plan.id)}
                  className={cn(
                    'relative flex flex-col rounded-4 border-2 bg-bg-white-bg p-4 text-left transition-colors md:p-5',
                    isSelected ? 'border-primary' : 'border-[#C7C7C7] hover:border-text-secondary'
                  )}
                >
                  {plan.popular && (
                    <span className='absolute -top-3 left-4 flex items-center gap-1 rounded-full bg-[#FDD7A3] px-3 py-1 text-caption font-bold text-text-primary'>
                      <MdRocketLaunch className='size-3.5' />
                      Most popular
                    </span>
                  )}

                  <div className='flex items-center gap-3'>
                    {/* Radio */}
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-full border-2',
                        isSelected ? 'border-primary' : 'border-[#0000007a]'
                      )}
                    >
                      {isSelected && <span className='size-3.5 rounded-full bg-primary' />}
                    </span>

                    <span
                      className={cn(
                        'flex-1 text-desktop-title-6',
                        isSelected ? 'font-[800] text-text-primary' : 'font-medium text-text-primary'
                      )}
                    >
                      {plan.title}
                    </span>

                    <span className='flex items-baseline gap-0.5 text-right'>
                      <span className='text-[26px] font-[800] leading-none text-text-primary'>{plan.price}</span>
                      <span className='text-body-2 text-text-secondary'>{plan.period}</span>
                    </span>
                  </div>

                  {plan.note && <p className='mt-1 pl-10 text-caption text-text-secondary'>{plan.note}</p>}

                  {/* Feature list — only for the selected (expanded) plan */}
                  {isSelected && (
                    <ul className='mt-4 flex flex-col gap-2 border-t border-os-divider pt-4'>
                      {FEATURES.map((feature, index) => {
                        const ok = plan.unlocked[index];
                        return (
                          <li
                            key={feature}
                            className='flex items-center gap-2'
                          >
                            {ok ? (
                              <MdCheck className='size-5 shrink-0 text-[#009B63]' />
                            ) : (
                              <MdClose className='size-5 shrink-0 text-[#878787]' />
                            )}
                            <span className={cn('text-body-2', ok ? 'text-text-primary' : 'text-[#878787]')}>
                              {feature}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </button>
              );
            })}
          </div>

          <Button
            variant='filled'
            color='primary'
            size='lg'
            className='w-full md:w-auto md:self-end md:px-10'
            rightIcon={<MdArrowForward className='size-5' />}
            onClick={onNext}
          >
            Continue
          </Button>

          <div className='flex flex-col gap-2 text-caption text-text-secondary'>
            <p>
              After 7 days, you will be charged {active.id === 'annual' ? '$69.96/year' : `${active.price}/month`} unless
              you cancel 24 hours before the trial ends.
            </p>
            <p>
              See our{' '}
              <a
                href='#'
                className='text-primary no-underline'
              >
                Subscription terms
              </a>{' '}
              for details on cancellation and refunds. We provide refunds in accordance with our{' '}
              <a
                href='#'
                className='text-primary no-underline'
              >
                Refund Policy
              </a>
              .
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PlanScreen;
