import { type FC, useState } from 'react';

import { MdClose, MdOutlineMail } from 'react-icons/md';

import { Button, Input } from '@universe-forma/ui-pes';

interface EmailModalProps {
  /** Close control (top-right X). */
  onClose?: () => void;
}

/**
 * Step 4 — Email modal. Opens once rendering finishes (all steps green): the
 * file is ready and the user enters an email / creates an account to download.
 * Self-contained: submitting is a no-op (concept, no real account/send).
 */
export const EmailModal: FC<EmailModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');

  return (
    <div className='relative flex h-full w-full flex-col gap-8 overflow-y-auto bg-bg-white-bg px-6 py-12 md:h-auto md:max-w-[600px] md:rounded-6 md:px-14 md:shadow-[0_20px_60px_-15px_rgba(33,33,52,0.25)]'>
      <button
        type='button'
        aria-label='Close'
        onClick={onClose}
        className='absolute right-5 top-5 flex size-8 items-center justify-center rounded-2 text-text-secondary transition-colors hover:bg-action-hover hover:text-text-primary'
      >
        <MdClose className='size-6' />
      </button>

      <div className='flex flex-col gap-1 text-center'>
        <h2 className='text-desktop-title-3 text-text-primary'>Your file is ready</h2>
        <p className='text-desktop-title-6 font-normal text-text-secondary'>Create an account to download it</p>
      </div>

      <div className='flex flex-col gap-2'>
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
          onChange={(event) => setEmail(event.target.value)}
          leftIcon={<MdOutlineMail className='size-6 text-text-secondary' />}
        />
      </div>

      <div className='flex flex-col gap-4'>
        <Button
          variant='filled'
          color='primary'
          size='lg'
          className='w-full'
        >
          Download File
        </Button>
        <p className='text-center text-caption text-text-secondary'>
          By creating an account, you agree to our{' '}
          <a
            href='#'
            className='text-primary hover:underline'
          >
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a
            href='#'
            className='text-primary hover:underline'
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};
