import { type FC, useRef } from 'react';

import { MdOutlineFileUpload } from 'react-icons/md';

import { Button } from '@universe-forma/ui-pes';

interface UploadButtonProps {
  label: string;
  /** `accept` attribute for the file input, e.g. 'video/*', 'image/*', 'audio/*'. */
  accept: string;
  onFile: (file: File) => void;
}

/** "Upload" button that opens the device file picker and reports the chosen file. */
export const UploadButton: FC<UploadButtonProps> = ({ label, accept, onFile }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant='filled-tonal'
        color='primary'
        size='md'
        leftIcon={<MdOutlineFileUpload className='size-5' />}
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </Button>
      <input
        ref={inputRef}
        type='file'
        accept={accept}
        className='hidden'
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          // Reset so picking the same file again still fires change.
          event.target.value = '';
        }}
      />
    </>
  );
};
