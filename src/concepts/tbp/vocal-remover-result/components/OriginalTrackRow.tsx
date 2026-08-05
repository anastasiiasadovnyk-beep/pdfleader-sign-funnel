import { useRef, type ChangeEvent } from 'react';
import { Button } from '@universe-forma/ui-pes';
import type { OriginalFile } from '../types';
import { FileIcon, RefreshIcon } from './icons';

type OriginalTrackRowProps = {
  file: OriginalFile;
  changeLabel: string;
  onChange?: () => void;
};

/** Grey pill row: document icon + file name / size · duration, with a "Change"
 * (replace file) text button on the trailing edge. "Change" opens the OS audio
 * file picker; selecting a file fires `onChange` — the seam the app uses to
 * re-upload and re-open the processing modal. */
export default function OriginalTrackRow({ file, changeLabel, onChange }: OriginalTrackRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => inputRef.current?.click();
  const handlePicked = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) onChange?.();
    e.target.value = ''; // allow re-picking the same file
  };

  return (
    <div className="flex items-center gap-3 rounded-2 bg-bg-light-grey px-4 py-3">
      <FileIcon className="h-6 w-6 shrink-0 text-text-secondary" />
      <div className="min-w-0 flex-1">
        <p data-ff="file-name" className="truncate text-body-emph text-text-primary">
          {file.name}
        </p>
        <p data-ff="file-meta" className="text-caption text-text-secondary">
          {file.sizeLabel} · {file.durationLabel}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handlePicked}
        aria-hidden="true"
        tabIndex={-1}
      />
      <Button
        data-ff="change-btn"
        variant="text"
        color="action"
        size="sm"
        onClick={openPicker}
        leftIcon={<RefreshIcon className="h-4 w-4" />}
        className="shrink-0"
      >
        {changeLabel}
      </Button>
    </div>
  );
}
