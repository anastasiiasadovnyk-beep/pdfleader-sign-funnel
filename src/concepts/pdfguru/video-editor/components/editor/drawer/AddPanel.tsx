import { type FC, useState } from 'react';

import type { IconType } from 'react-icons';
import {
  MdChevronRight,
  MdOutlineAudiotrack,
  MdOutlineCategory,
  MdOutlineFileUpload,
  MdOutlineImage,
  MdOutlineDesktopWindows,
  MdOutlineKeyboard,
  MdOutlineMic,
  MdOutlinePictureInPictureAlt,
  MdOutlineVideoCameraFront,
  MdOutlineVideocam,
  MdSearch
} from 'react-icons/md';

import { Button, Search, cn } from '@universe-forma/ui-pes';

import { AudioPanel } from './AudioPanel';
import { CategoryChips } from './CategoryChips';
import { ElementsPanel } from './ElementsPanel';
import { TextStylePresets } from './TextStylePresets';
import { UploadButton } from './UploadButton';

/** Per-tab stock section metadata (title + thumbnail icon). */
const STOCK_META: Record<string, { title: string; Icon: IconType }> = {
  video: { title: 'Stock videos', Icon: MdOutlineVideocam },
  audio: { title: 'Stock audio', Icon: MdOutlineAudiotrack },
  images: { title: 'Stock images', Icon: MdOutlineImage },
  elements: { title: 'Stock elements', Icon: MdOutlineCategory }
};

/** Upload button label per addable media tab. */
const UPLOAD_LABELS: Record<string, string> = {
  video: 'Upload video',
  audio: 'Upload audio',
  images: 'Upload image'
};

/** Record tab — the recording sources offered, in the order shown. */
const RECORD_OPTIONS: { title: string; description: string; Icon: IconType }[] = [
  {
    title: 'Record screen and camera',
    description: 'Record your screen and computer camera at the same time, with or without microphone.',
    Icon: MdOutlinePictureInPictureAlt
  },
  {
    title: 'Record screen',
    description: 'Record with or without camera, microphone, and screen cast.',
    Icon: MdOutlineDesktopWindows
  },
  {
    title: 'Record camera',
    description: 'Record video and audio from your computer camera and microphone.',
    Icon: MdOutlineVideoCameraFront
  },
  {
    title: 'Record audio',
    description: 'Record audio from your computer microphone.',
    Icon: MdOutlineMic
  }
];

const STOCK_GRADIENTS = [
  'from-slate-300 to-slate-400',
  'from-indigo-200 to-indigo-400',
  'from-amber-200 to-orange-300',
  'from-emerald-200 to-teal-400',
  'from-rose-200 to-rose-400',
  'from-sky-300 to-blue-400'
];

/** Filter chips shown above the stock library, per tab. */
const STOCK_CATEGORIES: Record<string, string[]> = {
  video: ['nature', 'animals', 'flowers', 'people', 'travel', 'food'],
  images: ['nature', 'animals', 'flowers', 'people', 'travel', 'food']
};

/** Mock durations shown as a badge on stock-video thumbnails. */
const STOCK_VIDEO_DURATIONS = ['22s', '32s', '1m12s', '32s', '22s', '1m12s'];

/** Divider + "Stock <type>" subtitle + a grid of stock thumbnails. */
const StockSection: FC<{
  tabId: string;
  divided?: boolean;
  withSearch?: boolean;
  onSelect?: (gradient: string) => void;
}> = ({ tabId, divided = true, withSearch = false, onSelect }) => {
  const [query, setQuery] = useState('');
  const meta = STOCK_META[tabId];
  if (!meta) return null;
  const { title, Icon } = meta;
  return (
    <div className={cn('flex flex-col gap-4', divided && 'border-t border-os-divider pt-4')}>
      <span className='text-body-emph text-text-primary'>{title}</span>
      {STOCK_CATEGORIES[tabId] && <CategoryChips categories={STOCK_CATEGORIES[tabId]} />}
      {withSearch && (
        <Search
          size='dense'
          bg='default'
          leftIcon={<MdSearch className='size-5' />}
          placeholder={`Search ${title.toLowerCase()}…`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery('')}
        />
      )}
      <div className='grid grid-cols-2 gap-4'>
        {STOCK_GRADIENTS.map((gradient, index) => (
          <button
            key={index}
            type='button'
            aria-label={`${title} ${index + 1}`}
            onClick={() => onSelect?.(gradient)}
            className={cn(
              'relative flex h-[92px] items-center justify-center overflow-hidden rounded-3 bg-gradient-to-br transition-transform hover:scale-[1.02]',
              gradient
            )}
          >
            <Icon className='size-7 text-common-white/90' />
            {tabId === 'video' && (
              <span className='absolute bottom-2 left-2 rounded-2 bg-black/50 px-2 py-0.5 text-caption-xs text-common-white'>
                {STOCK_VIDEO_DURATIONS[index % STOCK_VIDEO_DURATIONS.length]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

/** Default ("Add") state for an addable tab: add control(s) + stock library. */
interface AddPanelProps {
  tabId: string;
  onAddText: (label: string, styleClassName?: string) => void;
  onAddAudio: (label: string) => void;
  onAddImage: (gradient: string, src?: string) => void;
  onAddVideo: (gradient: string, src?: string) => void;
  onAddElement: (payload: { label?: string; icon?: IconType; category?: string }) => void;
  onAddSubtitle: (label: string) => void;
  onAddTts: (label: string) => void;
}

export const AddPanel: FC<AddPanelProps> = ({
  tabId,
  onAddText,
  onAddAudio,
  onAddImage,
  onAddVideo,
  onAddElement,
  onAddSubtitle,
  onAddTts
}) => {
  if (tabId === 'record') {
    return (
      <div className='flex flex-col gap-4'>
        {RECORD_OPTIONS.map(({ title, description, Icon }) => (
          <button
            key={title}
            type='button'
            className='flex w-full items-center gap-4 rounded-4 border border-os-divider p-4 text-left transition-colors hover:bg-action-hover'
          >
            <Icon className='size-6 shrink-0 text-text-primary' />
            <span className='flex min-w-0 flex-1 flex-col gap-1'>
              <span className='text-body-emph text-text-primary'>{title}</span>
              <span className='text-body-2 text-text-secondary'>{description}</span>
            </span>
            <MdChevronRight className='size-5 shrink-0 text-text-secondary' />
          </button>
        ))}
      </div>
    );
  }

  if (tabId === 'tts') {
    return (
      <div className='flex flex-col gap-3'>
        <Button
          variant='filled-tonal'
          color='primary'
          size='md'
          className='w-full !justify-between'
          leftIcon={<MdOutlineKeyboard className='size-5' />}
          rightIcon={<MdChevronRight className='size-5' />}
          onClick={() => onAddTts('')}
        >
          Input manually
        </Button>
        <div className='flex flex-col gap-1.5'>
          <Button
            variant='outlined'
            color='primary'
            size='md'
            className='w-full !justify-between'
            leftIcon={<MdOutlineFileUpload className='size-5' />}
            rightIcon={<MdChevronRight className='size-5' />}
            onClick={() => onAddTts('')}
          >
            Upload file
          </Button>
          <span className='text-center text-caption text-text-secondary'>Supports: .pdf, .docx, .txt</span>
        </div>
      </div>
    );
  }

  if (tabId === 'subtitles') {
    return (
      <div className='flex flex-col gap-3'>
        <Button
          variant='filled-tonal'
          color='primary'
          size='md'
          className='w-full !justify-between'
          leftIcon={<MdOutlineKeyboard className='size-5' />}
          rightIcon={<MdChevronRight className='size-5' />}
          onClick={() => onAddSubtitle('')}
        >
          Transcribe manually
        </Button>
        <div className='flex flex-col gap-1.5'>
          <Button
            variant='outlined'
            color='primary'
            size='md'
            className='w-full !justify-between'
            leftIcon={<MdOutlineFileUpload className='size-5' />}
            rightIcon={<MdChevronRight className='size-5' />}
            onClick={() => onAddSubtitle('')}
          >
            Upload subtitles file
          </Button>
          <span className='text-center text-caption text-text-secondary'>Supports: .srt, .ass, .lrc</span>
        </div>
      </div>
    );
  }

  if (tabId === 'text') {
    return (
      <div className='flex flex-col gap-2'>
        <span className='text-body-2 text-text-secondary'>Choose text style</span>
        <TextStylePresets onSelect={onAddText} />
      </div>
    );
  }

  if (tabId === 'elements') {
    return <ElementsPanel onSelect={onAddElement} />;
  }

  if (tabId === 'audio') {
    return <AudioPanel onAddAudio={onAddAudio} />;
  }

  const stockHandlers: Record<string, ((gradient: string) => void) | undefined> = {
    images: onAddImage,
    video: onAddVideo
  };

  // Video/image tabs accept a device upload, rendered on the canvas via an object URL.
  const uploadConfig: Record<string, { accept: string; onFile: (file: File) => void } | undefined> = {
    video: { accept: 'video/*', onFile: (file) => onAddVideo(STOCK_GRADIENTS[0], URL.createObjectURL(file)) },
    images: { accept: 'image/*', onFile: (file) => onAddImage(STOCK_GRADIENTS[0], URL.createObjectURL(file)) }
  };
  const upload = uploadConfig[tabId];

  return (
    <div className='flex flex-col gap-4'>
      {upload ? (
        <UploadButton
          label={UPLOAD_LABELS[tabId] ?? 'Upload'}
          accept={upload.accept}
          onFile={upload.onFile}
        />
      ) : (
        <Button
          variant='filled-tonal'
          color='primary'
          size='md'
          leftIcon={<MdOutlineFileUpload className='size-5' />}
        >
          {UPLOAD_LABELS[tabId] ?? 'Upload'}
        </Button>
      )}
      <StockSection
        tabId={tabId}
        withSearch
        onSelect={stockHandlers[tabId]}
      />
    </div>
  );
};
