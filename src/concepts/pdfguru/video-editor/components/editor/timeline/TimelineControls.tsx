import { type FC } from 'react';

import { ConfigProvider, Slider } from 'antd';
import {
  MdAdd,
  MdContentCut,
  MdDeleteOutline,
  MdOutlineEdit,
  MdPause,
  MdPlayArrow,
  MdRemove,
  MdSkipNext,
  MdSkipPrevious
} from 'react-icons/md';

import { IconButton, cn } from '@universe-forma/ui-pes';

import { TOTAL_DURATION_SEC } from '../../../model/editorData';
import { formatTimecode } from '../../../model/formatTimecode';
import { Tooltip } from '../Tooltip';

/** Bring forward — a chevron pointing up under a top bar. */
const BringForwardIcon: FC = () => (
  <svg
    viewBox='0 0 24 24'
    className='size-5'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
  >
    <path d='M5 5h14' />
    <path d='M7 15l5-5 5 5' />
  </svg>
);

/** Send backward — a chevron pointing down above a bottom bar. */
const SendBackwardIcon: FC = () => (
  <svg
    viewBox='0 0 24 24'
    className='size-5'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
  >
    <path d='M7 9l5 5 5-5' />
    <path d='M5 19h14' />
  </svg>
);

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;
const clampZoom = (value: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));

interface TimelineControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  playheadSec: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  canSplit: boolean;
  onSplit: () => void;
  canDelete: boolean;
  onDelete: () => void;
  /** Enabled when a clip is selected — layer the selected element up / down. */
  canReorder: boolean;
  onBringForward: () => void;
  onSendBackward: () => void;
  /** Mobile: edit the selected clip (opens its tab in edit state). */
  onEdit: () => void;
}

export const TimelineControls: FC<TimelineControlsProps> = ({
  isPlaying,
  onTogglePlay,
  playheadSec,
  zoom,
  onZoomChange,
  canSplit,
  onSplit,
  canDelete,
  onDelete,
  canReorder,
  onBringForward,
  onSendBackward,
  onEdit
}) => (
  <div className='flex items-start justify-between gap-2 px-2 py-2 md:items-center md:gap-4 md:px-4'>
    <div className='flex items-center gap-1'>
      <Tooltip label='Delete'>
        <IconButton
          variant='text'
          color='action'
          size='sm'
          aria-label='Delete'
          disabled={!canDelete}
          onClick={onDelete}
          className={cn('max-md:size-8', canDelete && '!text-text-primary')}
        >
          <MdDeleteOutline className='size-5' />
        </IconButton>
      </Tooltip>
      <Tooltip label='Split'>
        <IconButton
          variant='text'
          color='action'
          size='sm'
          aria-label='Split'
          disabled={!canSplit}
          onClick={onSplit}
          className={cn('max-md:size-8', canSplit && '!text-text-primary')}
        >
          <MdContentCut className='size-5' />
        </IconButton>
      </Tooltip>
      {/* Layer ordering — desktop only. */}
      <div className='hidden items-center gap-1 md:flex'>
        <Tooltip label='Bring forward'>
          <IconButton
            variant='text'
            color='action'
            size='sm'
            aria-label='Bring forward'
            disabled={!canReorder}
            onClick={onBringForward}
            className={cn(canReorder && '!text-text-primary')}
          >
            <BringForwardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip label='Send backward'>
          <IconButton
            variant='text'
            color='action'
            size='sm'
            aria-label='Send backward'
            disabled={!canReorder}
            onClick={onSendBackward}
            className={cn(canReorder && '!text-text-primary')}
          >
            <SendBackwardIcon />
          </IconButton>
        </Tooltip>
      </div>
      {/* Mobile only: appears when a clip is selected — opens its tab in edit state. */}
      {canDelete && (
        <Tooltip label='Edit'>
          <IconButton
            variant='text'
            color='action'
            size='sm'
            aria-label='Edit'
            onClick={onEdit}
            className='size-8 md:hidden !text-text-primary'
          >
            <MdOutlineEdit className='size-5' />
          </IconButton>
        </Tooltip>
      )}
    </div>

    {/* Desktop center: skip · play (outlined) · skip · inline time */}
    <div className='hidden items-center gap-3 md:flex'>
      <Tooltip label='Previous'>
        <IconButton
          variant='text'
          color='action'
          size='sm'
          aria-label='Previous'
        >
          <MdSkipPrevious className='size-5' />
        </IconButton>
      </Tooltip>
      <Tooltip label={isPlaying ? 'Pause' : 'Play'}>
        <IconButton
          variant='outlined'
          color='action'
          size='sm'
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className='rounded-full'
        >
          {isPlaying ? <MdPause className='size-5' /> : <MdPlayArrow className='size-5' />}
        </IconButton>
      </Tooltip>
      <Tooltip label='Next'>
        <IconButton
          variant='text'
          color='action'
          size='sm'
          aria-label='Next'
        >
          <MdSkipNext className='size-5' />
        </IconButton>
      </Tooltip>
      <span className='ml-1 text-body-2 tabular-nums text-text-primary'>
        {formatTimecode(playheadSec)}{' '}
        <span className='text-text-secondary'>/ {formatTimecode(TOTAL_DURATION_SEC)}</span>
      </span>
    </div>

    {/* Mobile center: grey play chip with the time stacked below it */}
    <div className='flex flex-col items-center gap-1.5 md:hidden'>
      <button
        type='button'
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className='flex size-8 items-center justify-center rounded-3 bg-os-filled-input-bg text-text-primary transition-colors hover:bg-action-hover'
      >
        {isPlaying ? <MdPause className='size-5' /> : <MdPlayArrow className='size-5' />}
      </button>
      <span className='text-caption tabular-nums whitespace-nowrap text-text-secondary'>
        {formatTimecode(playheadSec)} / {formatTimecode(TOTAL_DURATION_SEC)}
      </span>
    </div>

    {/* Zoom: slider + −/+ on desktop; just −/+ on mobile */}
    <div className='flex items-center gap-1 text-text-secondary md:w-52'>
      <Tooltip label='Zoom out'>
        <IconButton
          variant='text'
          color='action'
          size='sm'
          aria-label='Zoom out'
          disabled={zoom <= ZOOM_MIN}
          onClick={() => onZoomChange(clampZoom(zoom - ZOOM_STEP))}
          className={cn('max-md:size-8', zoom > ZOOM_MIN && '!text-text-primary')}
        >
          <MdRemove className='size-5' />
        </IconButton>
      </Tooltip>
      <ConfigProvider theme={{ token: { colorPrimary: '#5f30e2' } }}>
        <Slider
          className='hidden flex-1 md:block'
          min={ZOOM_MIN}
          max={ZOOM_MAX}
          step={0.1}
          value={zoom}
          onChange={onZoomChange}
          tooltip={{ open: false }}
        />
      </ConfigProvider>
      <Tooltip label='Zoom in'>
        <IconButton
          variant='text'
          color='action'
          size='sm'
          aria-label='Zoom in'
          disabled={zoom >= ZOOM_MAX}
          onClick={() => onZoomChange(clampZoom(zoom + ZOOM_STEP))}
          className={cn('max-md:size-8', zoom < ZOOM_MAX && '!text-text-primary')}
        >
          <MdAdd className='size-5' />
        </IconButton>
      </Tooltip>
    </div>
  </div>
);
