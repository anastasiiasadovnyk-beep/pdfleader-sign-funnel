import { type FC } from 'react';

import { MdErrorOutline, MdOutlineFileUpload } from 'react-icons/md';

import { Button, cn } from '@universe-forma/ui-pes';

import editVideoIllustration from '../../assets/edit-video-illustration.svg';
import { MAX_UPLOAD_SIZE_MB, SUPPORTED_VIDEO_FORMATS, VIDEO_FILE_INPUT_ACCEPT } from '../../model/constants';
import { useVideoUpload } from '../../hooks/useVideoUpload';
import { DashedGradientBorder } from './DashedGradientBorder';

interface UploadDropzoneProps {
  onFileAccepted: (file: File) => void;
}

/**
 * Screen 1 upload card: white panel with the multi-color dashed border, the
 * video-frames illustration, format hint and a primary "Upload file" CTA.
 * `useVideoUpload` owns the default / drag-over / invalid states.
 */
export const UploadDropzone: FC<UploadDropzoneProps> = ({ onFileAccepted }) => {
  const { inputRef, isDragOver, error, openFilePicker, onInputChange, dropzoneHandlers } = useVideoUpload({
    onFileAccepted
  });

  return (
    <div className='flex w-full flex-col items-center gap-3'>
      <div className='w-full rounded-6 bg-bg-white-bg p-3 shadow-[0_12px_40px_-12px_rgba(33,33,52,0.18)]'>
        <div
          {...dropzoneHandlers}
          onClick={openFilePicker}
          role='button'
          tabIndex={0}
          onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && openFilePicker()}
          aria-label='Upload a video by dropping a file here or choosing one from your computer'
          className={cn(
            'relative flex cursor-pointer flex-col items-center gap-4 rounded-5 px-6 py-16 text-center transition-colors',
            isDragOver && !error && 'bg-primary-opacity-8',
            error && 'bg-error-state-main-50'
          )}
        >
          <DashedGradientBorder isError={!!error} />

          <img
            src={editVideoIllustration}
            alt=''
            aria-hidden='true'
            className='size-[88px]'
          />

          <div className='flex flex-col gap-1'>
            <p className='text-desktop-title-6 text-text-primary'>Drop file here to start</p>
            <p className='text-caption text-text-secondary'>
              Size up {MAX_UPLOAD_SIZE_MB} MB&nbsp;&nbsp;·&nbsp;&nbsp;{SUPPORTED_VIDEO_FORMATS.join(', ')}
            </p>
          </div>

          <Button
            variant='filled'
            color='primary'
            size='lg'
            leftIcon={<MdOutlineFileUpload className='size-5' />}
            onClick={(event) => {
              // The zone itself opens the picker; stop the outer handler firing twice.
              event.stopPropagation();
              openFilePicker();
            }}
          >
            Upload file
          </Button>

          <input
            ref={inputRef}
            type='file'
            accept={VIDEO_FILE_INPUT_ACCEPT}
            className='hidden'
            onChange={onInputChange}
          />
        </div>
      </div>

      {error && (
        <p
          role='alert'
          className='flex items-center gap-1.5 text-body-2 text-error-main'
        >
          <MdErrorOutline className='size-4 shrink-0' />
          {error}
        </p>
      )}
    </div>
  );
};
