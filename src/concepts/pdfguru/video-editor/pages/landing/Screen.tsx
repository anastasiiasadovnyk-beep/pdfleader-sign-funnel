import { type FC, useCallback } from 'react';

import { LandingHeader } from '../../components/landing/LandingHeader';
import { TrustpilotBadge } from '../../components/landing/TrustpilotBadge';
import { UploadDropzone } from '../../components/landing/UploadDropzone';

interface LandingScreenProps {
  /** Advances to the editor page (provided by the flow host). */
  onNext?: () => void;
}

/**
 * Screen 1 — Landing (Hero).
 * Marketing header, a centered headline + subtext, the drag-and-drop upload
 * card and a Trustpilot rating. A valid file advances into the editor.
 */
const LandingScreen: FC<LandingScreenProps> = ({ onNext }) => {
  const handleFileAccepted = useCallback(
    (_file: File) => {
      // A processing screen sits between here and the editor; for this concept
      // we go straight into the editor, which owns its own loading state.
      onNext?.();
    },
    [onNext]
  );

  return (
    <div className='min-h-screen w-full bg-bg-light-grey'>
      <div className='mx-auto flex min-h-screen w-full max-w-[1440px] flex-col p-6'>
        <div className='flex flex-1 flex-col rounded-6 bg-bg-light-grey'>
          <LandingHeader />

          <main className='flex flex-1 flex-col items-center px-4 pt-10 pb-16'>
            <header className='flex flex-col items-center gap-4 text-center'>
              <h1 className='text-desktop-title-2 text-text-primary sm:text-desktop-title-1'>Edit Video Online</h1>
              <p className='max-w-2xl text-desktop-title-6 font-normal text-text-secondary'>
                Create and fine-tune your videos effortlessly. Export in MP4, WebM, or any format you need.
              </p>
            </header>

            <div className='mt-10 w-full max-w-[848px]'>
              <UploadDropzone onFileAccepted={handleFileAccepted} />
            </div>

            <div className='mt-10'>
              <TrustpilotBadge />
            </div>

            {/* Legal footer */}
            <p className='mt-auto max-w-md pt-10 text-center text-caption text-text-secondary'>
              By uploading a file, you agree to our{' '}
              <a
                href='#'
                className='text-primary underline'
              >
                Terms of Use
              </a>{' '}
              and acknowledge our{' '}
              <a
                href='#'
                className='text-primary underline'
              >
                Privacy Policy
              </a>
              .
            </p>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LandingScreen;
