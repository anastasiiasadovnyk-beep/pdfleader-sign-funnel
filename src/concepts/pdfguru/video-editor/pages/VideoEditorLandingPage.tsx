import { type FC, useCallback } from 'react';

import { useLocaleNavigate } from 'hooks/useLocaleNavigate';

import { LandingHeader } from '../components/landing/LandingHeader';
import { TrustpilotBadge } from '../components/landing/TrustpilotBadge';
import { UploadDropzone } from '../components/landing/UploadDropzone';
import { VIDEO_EDITOR_ROUTES } from '../model/constants';

/**
 * Screen 1 — Landing (Hero).
 * Marketing header, a centered headline + subtext, the drag-and-drop upload
 * card and a Trustpilot rating. A valid file advances into the editor.
 */
export const VideoEditorLandingPage: FC = () => {
  const navigate = useLocaleNavigate();

  const handleFileAccepted = useCallback(
    (_file: File) => {
      // Screen 2 (processing) sits between here and the editor; for this pass
      // we go straight into the editor route, which owns its own loading state.
      navigate(VIDEO_EDITOR_ROUTES.editor);
    },
    [navigate]
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
                Reduce video file size while maintaining quality. Download as MP4 or WebM.
              </p>
            </header>

            <div className='mt-10 w-full max-w-[848px]'>
              <UploadDropzone onFileAccepted={handleFileAccepted} />
            </div>

            <div className='mt-10'>
              <TrustpilotBadge />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
