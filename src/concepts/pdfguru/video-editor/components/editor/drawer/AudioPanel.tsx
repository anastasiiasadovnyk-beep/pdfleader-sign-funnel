import { type FC, useState } from 'react';

import { MdOutlineAudiotrack, MdSearch } from 'react-icons/md';

import { Search } from '@universe-forma/ui-pes';

import { CategoryChips } from './CategoryChips';
import { UploadButton } from './UploadButton';

/** Filter chips shown above the stock-audio library. */
const AUDIO_CATEGORIES = ['chill', 'upbeat', 'cinematic', 'lofi', 'ambient', 'piano'];

/** Mock stock-audio library (fictional artist – track names). */
const STOCK_AUDIO = [
  'Nova — Sunset Drive',
  'Kairo — Lofi Dreams',
  'Ember — Cinematic Rise',
  'Wren — Acoustic Morning',
  'Zephyr — Deep House',
  'Solace — Piano Reflections'
];

interface AudioPanelProps {
  onAddAudio: (label: string) => void;
}

/** Audio tab: upload + a stock library; clicking a track adds it to the timeline. */
export const AudioPanel: FC<AudioPanelProps> = ({ onAddAudio }) => {
  const [query, setQuery] = useState('');
  const tracks = STOCK_AUDIO.filter((track) => track.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className='flex flex-col gap-4'>
      <UploadButton
        label='Upload audio'
        accept='audio/*'
        onFile={(file) => onAddAudio(file.name)}
      />

      <div className='flex flex-col gap-4 border-t border-os-divider pt-4'>
        <span className='text-body-emph text-text-primary'>Stock audio</span>
        <CategoryChips categories={AUDIO_CATEGORIES} />
        <Search
          size='dense'
          bg='default'
          leftIcon={<MdSearch className='size-5' />}
          placeholder='Search stock audio…'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery('')}
        />
        {tracks.map((track) => (
          <button
            key={track}
            type='button'
            onClick={() => onAddAudio(track)}
            className='flex items-center gap-2 rounded-2 bg-bg-light-grey px-3 py-2 text-left transition-colors hover:bg-action-hover'
          >
            <MdOutlineAudiotrack className='size-5 shrink-0 text-text-secondary' />
            <span className='truncate text-body-2 text-text-primary'>{track}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
