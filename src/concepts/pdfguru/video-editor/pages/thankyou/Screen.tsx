import { type FC } from 'react';

import { MdCheckCircle, MdFileDownload, MdFolderOpen, MdOutlineBookmarkBorder, MdOutlineEdit } from 'react-icons/md';

import { Button } from '@universe-forma/ui-pes';

import { ProdNoteBadge } from '../../components/funnel/ProdNoteBadge';

import logo from '../../assets/new-logo-pdf-guru.svg';

interface ThankYouScreenProps {
  /** Returns to the previous step. */
  onBack?: () => void;
  /** "Go to All Documents" — opens the dashboard. */
  onNext?: () => void;
}

/**
 * Screen 7 — Thank you (payment success). Recreates PDF Guru's default (control)
 * success page: a centered logo bar, a green check, the "Thank you for joining
 * us!" confirmation with the subscription note, the Download / Edit / All
 * Documents actions, a cross-sell card and the bookmark / support banner.
 */
const ThankYouScreen: FC<ThankYouScreenProps> = ({ onNext }) => (
  <div className='flex min-h-screen w-full flex-col bg-bg-light-grey'>
    <ProdNoteBadge />
    {/* Centered logo bar */}
    <header className='flex h-20 w-full shrink-0 items-center justify-center border-b border-os-divider bg-bg-white-bg'>
      <img
        src={logo}
        alt='PDF Guru'
        className='h-8'
      />
    </header>

    <main className='mx-auto flex w-full max-w-[720px] flex-1 flex-col items-center gap-8 px-4 py-10 md:py-16'>
      {/* Thank-you block */}
      <div className='flex flex-col items-center gap-4 text-center'>
        <MdCheckCircle className='size-12 text-[#009B63]' />
        <h1 className='text-desktop-title-2 font-[800] text-text-primary md:text-desktop-title-1'>
          Thank you for joining us!
        </h1>
        <p className='max-w-[520px] text-desktop-title-6 font-normal text-text-secondary'>
          Your subscription is now active. We're excited to have you on board! Your billing statement will show a charge
          from "Support.PDFGuru.com".
        </p>

        <div className='mt-2 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center'>
          <Button
            variant='filled'
            color='primary'
            size='lg'
            className='w-full sm:w-auto sm:px-8'
            leftIcon={<MdFileDownload className='size-5' />}
          >
            Download My File
          </Button>
          <Button
            variant='outlined'
            color='primary'
            size='lg'
            className='w-full sm:w-auto sm:px-6'
            leftIcon={<MdOutlineEdit className='size-5' />}
          >
            Edit File
          </Button>
          <Button
            variant='outlined'
            color='secondary'
            size='lg'
            className='w-full sm:w-auto sm:px-6'
            leftIcon={<MdFolderOpen className='size-5' />}
            onClick={onNext}
          >
            Go to All Documents
          </Button>
        </div>
      </div>

      {/* Cross-sell */}
      <section className='flex w-full flex-col items-center gap-3 rounded-6 bg-bg-white-bg p-6 text-center shadow-[0_8px_30px_-12px_rgba(33,33,52,0.15)]'>
        <div className='h-32 w-full max-w-[360px] rounded-4 bg-gradient-to-br from-violet-200 to-sky-200' />
        <h2 className='text-desktop-title-5 font-bold text-text-primary'>
          Also Merge, Split, Compress functions are available for you!
        </h2>
        <p className='text-body-2 text-text-secondary'>Unlimited document handling.</p>
      </section>

      {/* Bookmark / support banner */}
      <section className='flex w-full items-center gap-4 rounded-4 bg-[#F6F6F6] p-5'>
        <MdOutlineBookmarkBorder className='size-8 shrink-0 text-primary' />
        <div className='flex flex-col gap-0.5'>
          <span className='text-body-2 font-semibold text-text-primary'>
            Bookmark PDF Guru for quick and easy access
          </span>
          <span className='text-caption text-text-secondary'>
            Got any questions? We're here to help:{' '}
            <a
              href='mailto:support@pdfguru.com'
              className='text-primary no-underline'
            >
              support@pdfguru.com
            </a>
          </span>
        </div>
      </section>
    </main>
  </div>
);

export default ThankYouScreen;
