import { type FC, useState } from 'react';

import { MdClose, MdOutlineMail } from 'react-icons/md';

import { Button, Input } from '@universe-forma/ui-pes';

interface EmailModalProps {
  /** Close control (top-right X). */
  onClose?: () => void;
  /** Valid email submitted — advances the funnel to the plan step. */
  onSubmit?: () => void;
}

const EMAIL_RE = /\S+@\S+\.\S+/;

/**
 * Step 4 — "Your file is ready" account/email modal. Ported from pdfguru-fe's
 * new-login-flow (AuthModalShell + EnterEmailModal): mobile fills the screen,
 * desktop is a centered ≤592px card. Self-contained — no i18n, A/B copy,
 * email suggestions or real submission (concept).
 */
export const EmailModal: FC<EmailModalProps> = ({ onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!EMAIL_RE.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError(null);
    // Concept: no real account/download — advance to the plan step.
    onSubmit?.();
  };

  return (
    <div className='relative flex h-full w-full flex-col overflow-y-auto bg-bg-white-bg sm:h-auto sm:max-h-[calc(100vh-48px)] sm:max-w-[592px] sm:rounded-[20px] sm:shadow-[0px_0px_12px_-8px_rgba(0,0,0,0.08),0px_20px_32px_0px_rgba(0,0,0,0.16)]'>
      {/* Header: centered title + subtitle, close (X) top-right */}
      <div className='relative bg-bg-white-bg p-4 sm:px-5 sm:pt-5 sm:pb-3'>
        <div className='flex min-h-[40px] flex-col justify-center px-14 text-center sm:min-h-[52px]'>
          <h2 className='m-0 text-[22px] font-bold leading-[28px] text-text-primary sm:text-[24px] sm:leading-[30px]'>
            Your file is ready
          </h2>
          <p className='mt-0.5 text-[14px] font-normal leading-[18px] text-text-secondary sm:mt-1'>
            Create an account to download it
          </p>
        </div>

        <button
          type='button'
          aria-label='Close'
          onClick={onClose}
          className='absolute right-4 top-4 flex size-10 items-center justify-center rounded-2 text-text-secondary transition-colors hover:bg-action-hover hover:text-text-primary sm:right-5 sm:top-5'
        >
          <MdClose className='size-5' />
        </button>
      </div>

      {/* Content: email field + Download File + terms */}
      <div className='flex flex-1 flex-col items-center gap-6 bg-bg-white-bg px-4 pt-4 pb-8 sm:flex-initial sm:px-8 sm:pt-6'>
        <div className='flex w-full flex-col gap-2'>
          <label
            htmlFor='email-download'
            className='text-body-2 text-text-secondary'
          >
            Email
          </label>
          <Input
            id='email-download'
            type='email'
            size='lg'
            bg='default'
            value={email}
            placeholder='Enter your email'
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError(null);
            }}
            leftIcon={<MdOutlineMail className='size-6 text-text-secondary' />}
            containerClassName='min-h-14'
          />
          {error && <p className='text-caption text-error-main'>{error}</p>}
        </div>

        <div className='flex w-full flex-col items-center gap-2'>
          <Button
            variant='filled'
            color='primary'
            size='lg'
            className='w-full'
            onClick={handleSubmit}
          >
            Download File
          </Button>
          <p className='text-center text-caption-xs font-normal text-text-secondary'>
            By creating an account, you agree to our{' '}
            <a
              href='#'
              className='text-primary no-underline'
            >
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a
              href='#'
              className='text-primary no-underline'
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
