import { type FC } from 'react';

import { MdCheck, MdOutlineEdit, MdOutlineShare, MdReply } from 'react-icons/md';

import { Button, IconButton, Input } from '@universe-forma/ui-pes';

import logoUrl from '../../assets/pdf-guru.svg';
import logoMark from '../../assets/pdf-guru-mark.svg';

import type { ExportFormat } from '../../model/constants';
import { DownloadMenu } from './DownloadMenu';

interface EditorHeaderProps {
  projectName: string;
  onProjectNameChange: (value: string) => void;
  onBack: () => void;
  onSelectFormat: (format: ExportFormat) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Editor top bar (Screen 3). Desktop: back button, editable project name and the
 * Download menu. Mobile: logo, undo/redo, an overflow menu and a "Done" button —
 * undo/redo live here on mobile instead of floating on the canvas.
 */
export const EditorHeader: FC<EditorHeaderProps> = ({
  projectName,
  onProjectNameChange,
  onBack,
  onSelectFormat,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => (
  <header className='flex w-full items-center justify-between gap-4 px-4 py-3 md:h-[72px] md:py-0'>
    {/* Left — desktop: logo + project name */}
    <div className='hidden min-w-0 flex-1 items-center gap-3 md:flex'>
      <img
        src={logoMark}
        alt='PDF Guru'
        className='size-[55px] shrink-0'
      />

      <Input
        size='dense'
        bg='filled'
        value={projectName}
        placeholder='Project name...'
        onChange={(event) => onProjectNameChange(event.target.value)}
        rightIcon={<MdOutlineEdit className='size-5 text-text-secondary' />}
        containerClassName='max-w-80 !border-0'
        aria-label='Project name'
      />
    </div>

    {/* Left — mobile: logo + undo / redo + overflow */}
    <div className='flex items-center gap-1 md:hidden'>
      <img
        src={logoUrl}
        alt='PDF Guru'
        className='mr-1 size-8'
      />
      <IconButton
        variant='text'
        color='action'
        size='md'
        aria-label='Undo'
        disabled={!canUndo}
        onClick={onUndo}
      >
        <MdReply className='size-6' />
      </IconButton>
      <IconButton
        variant='text'
        color='action'
        size='md'
        aria-label='Redo'
        disabled={!canRedo}
        onClick={onRedo}
      >
        <MdReply
          className='size-6'
          style={{ transform: 'scaleX(-1)' }}
        />
      </IconButton>
    </div>

    {/* Right — desktop: Share + Download */}
    <div className='hidden items-center gap-3 md:flex'>
      <Button
        variant='text'
        color='action'
        size='md'
        leftIcon={<MdOutlineShare className='size-5' />}
      >
        Share
      </Button>
      <DownloadMenu onSelectFormat={onSelectFormat} />
    </div>

    {/* Right — mobile: Done */}
    <Button
      variant='filled'
      color='secondary'
      size='md'
      leftIcon={<MdCheck className='size-5' />}
      onClick={onBack}
      className='md:hidden'
    >
      Done
    </Button>
  </header>
);
