import { type FC, useState } from 'react';

import { FaApplePay, FaCcAmex, FaCcJcb, FaCcMastercard, FaCcVisa, FaGooglePay, FaPaypal } from 'react-icons/fa';
import { MdCheck, MdLock } from 'react-icons/md';

import { Button, Input, cn } from '@universe-forma/ui-pes';

import { FunnelHeader } from '../../components/funnel/FunnelHeader';
import { ProdNoteBadge } from '../../components/funnel/ProdNoteBadge';

interface PaymentScreenProps {
  /** Advances to the Thank-you step (mock — no real charge). */
  onNext?: () => void;
  /** Returns to the plan step. */
  onBack?: () => void;
}

const TOTAL_TODAY = '$0.99';

/** Payment-page summary of what the selected (Full) plan unlocks. */
const PLAN_FEATURES = [
  'Unlimited downloads',
  'Unlimited edits',
  'Convert to any format',
  'Share with 5 family members or friends',
  'Password-protect your documents'
];

/** Accepted card brands shown next to the card form. */
const CARD_BRANDS = [
  { Icon: FaCcMastercard, color: '#EB001B', label: 'Mastercard' },
  { Icon: FaCcVisa, color: '#1A1F71', label: 'Visa' },
  { Icon: FaCcAmex, color: '#2E77BB', label: 'American Express' },
  { Icon: FaCcJcb, color: '#0B4EA2', label: 'JCB' }
];

/**
 * Screen 6 — Payment (checkout). Recreates PDF Guru's default (control) checkout:
 * the funnel stepper, a "Total due today" header, express-checkout buttons
 * (PayPal / Google Pay / Apple Pay), the card form, an agreement checkbox, the
 * "Pay and download my document" button, the plan summary and a purple Total box.
 * The form is a visual mock — no card data is submitted; Pay advances the flow.
 */
const PaymentScreen: FC<PaymentScreenProps> = ({ onNext }) => {
  const [agreed, setAgreed] = useState(true);

  return (
    <div className='flex min-h-screen w-full flex-col bg-bg-light-grey'>
      <ProdNoteBadge />
      <FunnelHeader active={3} />

      <main className='mx-auto flex w-full max-w-[1140px] flex-1 flex-col gap-6 px-4 py-8 md:flex-row md:items-start md:px-8 md:py-12'>
        {/* Left: total + express checkout + card form */}
        <section className='flex min-w-0 flex-1 flex-col gap-6 rounded-6 bg-bg-white-bg p-4 shadow-[0_8px_30px_-12px_rgba(33,33,52,0.15)] md:p-6'>
          <div className='flex items-center justify-between'>
            <span className='text-desktop-title-6 font-bold text-text-primary'>Total due today:</span>
            <span className='text-[25px] font-[800] leading-none text-text-primary'>{TOTAL_TODAY}</span>
          </div>

          {/* Express checkout */}
          <div className='flex flex-col gap-3'>
            <span className='text-desktop-title-6 font-bold text-text-primary'>Express checkout</span>
            <button
              type='button'
              className='flex h-12 w-full items-center justify-center rounded-3 bg-[#FFC439] font-bold text-[#003087] transition-opacity hover:opacity-90'
            >
              <FaPaypal className='mr-1 size-5' />
              PayPal
            </button>
            <div className='grid grid-cols-2 gap-3'>
              <button
                type='button'
                className='flex h-12 items-center justify-center rounded-3 bg-black text-common-white transition-opacity hover:opacity-90'
              >
                <FaGooglePay className='size-9' />
              </button>
              <button
                type='button'
                className='flex h-12 items-center justify-center rounded-3 bg-black text-common-white transition-opacity hover:opacity-90'
              >
                <FaApplePay className='size-10' />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className='flex items-center gap-3 text-caption text-text-secondary'>
            <span className='h-px flex-1 bg-os-divider' />
            or pay with card
            <span className='h-px flex-1 bg-os-divider' />
          </div>

          {/* Card form */}
          <div className='flex flex-col gap-4 rounded-4 border border-os-divider p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-body-2 font-semibold text-text-primary'>Pay with card</span>
              <span className='flex items-center gap-1.5'>
                {CARD_BRANDS.map(({ Icon, color, label }) => (
                  <Icon
                    key={label}
                    aria-label={label}
                    className='size-7'
                    style={{ color }}
                  />
                ))}
              </span>
            </div>

            <label className='flex flex-col gap-1.5'>
              <span className='text-caption text-text-secondary'>Card number</span>
              <Input
                size='lg'
                bg='default'
                placeholder='1234 1234 1234 1234'
                rightIcon={<MdLock className='size-5 text-text-secondary' />}
              />
            </label>
            <div className='grid grid-cols-2 gap-3'>
              <label className='flex flex-col gap-1.5'>
                <span className='text-caption text-text-secondary'>Expiry date</span>
                <Input
                  size='lg'
                  bg='default'
                  placeholder='MM / YY'
                />
              </label>
              <label className='flex flex-col gap-1.5'>
                <span className='text-caption text-text-secondary'>CVC</span>
                <Input
                  size='lg'
                  bg='default'
                  placeholder='CVC'
                />
              </label>
            </div>
            <label className='flex flex-col gap-1.5'>
              <span className='text-caption text-text-secondary'>Cardholder's name</span>
              <Input
                size='lg'
                bg='default'
                placeholder='Full name'
              />
            </label>
          </div>

          {/* Agreement */}
          <label className='flex cursor-pointer items-start gap-2'>
            <button
              type='button'
              role='checkbox'
              aria-checked={agreed}
              onClick={() => setAgreed((value) => !value)}
              className={cn(
                'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-1 border-2 transition-colors',
                agreed ? 'border-primary bg-primary' : 'border-action-stroke bg-bg-white-bg'
              )}
            >
              {agreed && <MdCheck className='size-3.5 text-common-white' />}
            </button>
            <span className='text-caption text-text-secondary'>
              I agree to the automatically renewing subscription and the charge shown above. I can cancel anytime.
            </span>
          </label>

          <Button
            variant='filled'
            color='primary'
            size='lg'
            className='w-full'
            leftIcon={<MdLock className='size-5' />}
            onClick={onNext}
          >
            Pay and download my document
          </Button>

          {/* Plan summary */}
          <div className='flex flex-col gap-2 rounded-4 bg-bg-light-grey p-4'>
            <span className='text-body-2 font-bold uppercase text-text-primary'>1-Week Unlimited Access</span>
            <ul className='flex flex-col gap-1.5'>
              {PLAN_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className='flex items-center gap-2'
                >
                  <MdCheck className='size-4 shrink-0 text-[#009B63]' />
                  <span className='text-caption text-text-primary'>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className='text-caption-xs text-[#929292]'>
            GURUDOCS LIMITED, 9205 West Russell Road, Las Vegas, Nevada, 89148, USA. Your subscription renews
            automatically until cancelled. See our{' '}
            <a
              href='#'
              className='text-primary no-underline'
            >
              Subscription terms
            </a>{' '}
            and{' '}
            <a
              href='#'
              className='text-primary no-underline'
            >
              Refund Policy
            </a>
            .
          </p>
        </section>

        {/* Right: preview + total */}
        <aside className='flex flex-col gap-4 md:sticky md:top-8 md:w-[320px] md:shrink-0'>
          <div className='rounded-6 bg-bg-white-bg p-4 shadow-[0_8px_30px_-12px_rgba(33,33,52,0.15)]'>
            <div className='aspect-video w-full rounded-3 bg-gradient-to-br from-sky-200 to-indigo-200' />
          </div>
          <div className='flex items-center justify-between rounded-4 bg-[#EBE7F5] px-5 py-4'>
            <span className='text-desktop-title-6 font-bold text-[#1D1D1D]'>Total</span>
            <span className='text-[25px] font-[800] leading-none text-[#1D1D1D]'>{TOTAL_TODAY}</span>
          </div>
          <p className='flex items-center justify-center gap-1.5 text-caption text-text-secondary'>
            <MdLock className='size-4' />
            Secure and encrypted payment
          </p>
        </aside>
      </main>
    </div>
  );
};

export default PaymentScreen;
