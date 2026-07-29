import { type FC, useEffect, useState } from 'react';

import { MdOutlineLightbulb } from 'react-icons/md';

import editVideoIllustration from '../../assets/edit-video-illustration.svg';

interface CompressionModalProps {
  /** Output filename (already includes the chosen format extension). */
  fileName: string;
  /** Human-readable source size, e.g. "980.1 MB". */
  fileSize: string;
  /** Dismiss the modal (backdrop click or Esc). */
  onClose: () => void;
}

const truncateFileName = (name: string, max: number) => (name.length > max ? `${name.slice(0, max - 1)}…` : name);

/**
 * "Compression in progress…" modal, shown over the editor after choosing an
 * export format from the Download menu. Recreated from pdfguru's
 * `progressFileModal` MediaLoader (COMPRESS_VIDEO funnel) — same layout
 * (illustration · title · file · progress · tip) but self-contained: the
 * progress is animated locally instead of driven by the upload pipeline.
 */
export const CompressionModal: FC<CompressionModalProps> = ({ fileName, fileSize, onClose }) => {
  const [progress, setProgress] = useState(0);

  // Ease the bar toward ~92% (the real modal holds there until the job finishes).
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((value) => (value >= 92 ? value : Math.min(92, value + Math.max(1, Math.round((92 - value) * 0.12)))));
    }, 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const estimatedTime = progress < 40 ? '~5min' : progress < 75 ? '~3min' : '~1min';

  return (
    <div
      className='absolute inset-0 z-50 flex items-center justify-center bg-text-primary/50 p-4'
      onPointerDown={onClose}
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-label='Compression in progress'
        onPointerDown={(event) => event.stopPropagation()}
        className='flex w-full max-w-[816px] flex-col overflow-hidden rounded-6 bg-bg-white-bg shadow-[0_20px_60px_-15px_rgba(33,33,52,0.4)] md:flex-row'
      >
        {/* Illustration */}
        <div className='flex h-[180px] shrink-0 items-center justify-center bg-bg-light-grey md:h-auto md:w-[398px]'>
          <img
            src={editVideoIllustration}
            alt=''
            aria-hidden='true'
            className='h-auto w-[200px] max-w-[70%]'
          />
        </div>

        {/* Progress */}
        <div className='flex flex-1 flex-col justify-between gap-6 px-6 py-6 md:px-10 md:py-10'>
          <div className='flex flex-col gap-5'>
            <h2 className='text-desktop-title-4 text-text-primary'>Compression in progress...</h2>

            <div className='flex flex-col'>
              <p className='text-body-emph text-text-primary'>{truncateFileName(fileName, 35)}</p>
              <p className='text-caption-overline font-normal uppercase text-text-secondary'>{fileSize}</p>
            </div>

            <div className='flex flex-col gap-2'>
              <div className='relative h-1 w-full overflow-hidden rounded'>
                <div className='absolute inset-0 rounded bg-primary/20' />
                <div
                  className='absolute inset-y-0 left-0 rounded bg-primary transition-[width] duration-500 ease-out'
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-body-2-emph text-text-primary'>{progress}%</span>
                <span className='text-caption text-text-secondary'>Estimated time: {estimatedTime}</span>
              </div>
            </div>
          </div>

          <div className='mt-6 flex items-start gap-1.5 rounded-3 bg-bg-light-grey px-2.5 py-3'>
            <MdOutlineLightbulb className='size-5 shrink-0 text-text-secondary' />
            <p className='flex-1 text-caption text-text-primary'>
              You can share your file directly from your Dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
