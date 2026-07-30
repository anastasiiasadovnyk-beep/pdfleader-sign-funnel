import { type FC, type ReactNode, useState } from 'react';

import type { IconType } from 'react-icons';
import {
  MdChangeHistory,
  MdCircle,
  MdFavorite,
  MdHexagon,
  MdKeyboardArrowDown,
  MdPentagon,
  MdSearch,
  MdSquare,
  MdStar,
  MdStarBorder
} from 'react-icons/md';

import { Button, Search, cn } from '@universe-forma/ui-pes';

const SHAPES: IconType[] = [
  MdSquare,
  MdCircle,
  MdChangeHistory,
  MdStar,
  MdFavorite,
  MdHexagon,
  MdPentagon,
  MdStarBorder
];
const STICKERS = ['🎉', '✨', '🔥', '💯', '⭐', '🌈', '🎈', '👍'];
const EMOJIS = ['😀', '😍', '😎', '🥳', '😂', '😭', '🤔', '👏', '🙌', '❤️'];

/** A titled section: a 3-per-row grid (two rows) + a "Show more" button. */
const Section: FC<{ title: string; divided?: boolean; children: ReactNode }> = ({ title, divided, children }) => (
  <div className={cn('flex flex-col gap-3', divided && 'border-t border-os-divider pt-4')}>
    <span className='text-body-emph text-text-primary'>{title}</span>
    <div className='grid grid-cols-3 gap-4'>{children}</div>
    <Button
      variant='text'
      color='action'
      size='sm'
      className='self-center'
      rightIcon={<MdKeyboardArrowDown className='size-5' />}
    >
      Show more
    </Button>
  </div>
);

const cellClass =
  'flex aspect-square items-center justify-center rounded-3 bg-bg-light-grey transition-colors hover:bg-action-hover';

interface ElementsPanelProps {
  onSelect: (payload: { label?: string; icon?: IconType; category?: string }) => void;
}

/** Elements tab: a search field, then Shapes, Stickers and Emoji sections. */
export const ElementsPanel: FC<ElementsPanelProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  return (
    <div className='flex flex-col gap-4'>
      <Search
        size='dense'
        bg='default'
        leftIcon={<MdSearch className='size-5' />}
        placeholder='Search elements…'
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery('')}
      />

      <Section title='Shapes'>
        {SHAPES.slice(0, 6).map((Icon, index) => (
          <button
            key={index}
            type='button'
            aria-label={`Shape ${index + 1}`}
            onClick={() => onSelect({ icon: Icon, category: 'Shape' })}
            className={cn(cellClass, 'text-text-primary')}
          >
            <Icon className='size-7' />
          </button>
        ))}
      </Section>

      <Section
        title='Stickers'
        divided
      >
        {STICKERS.slice(0, 6).map((sticker, index) => (
          <button
            key={index}
            type='button'
            aria-label={`Sticker ${index + 1}`}
            onClick={() => onSelect({ label: sticker, category: 'Sticker' })}
            className={cn(cellClass, 'text-2xl')}
          >
            {sticker}
          </button>
        ))}
      </Section>

      <Section
        title='Emoji'
        divided
      >
        {EMOJIS.slice(0, 6).map((emoji, index) => (
          <button
            key={index}
            type='button'
            aria-label={`Emoji ${index + 1}`}
            onClick={() => onSelect({ label: emoji, category: 'Emoji' })}
            className={cn(cellClass, 'text-xl')}
          >
            {emoji}
          </button>
        ))}
      </Section>
    </div>
  );
};
