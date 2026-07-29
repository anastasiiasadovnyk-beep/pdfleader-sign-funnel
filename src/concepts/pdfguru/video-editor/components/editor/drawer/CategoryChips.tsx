import { type FC, useState } from 'react';

import { MdClose } from 'react-icons/md';

import { cn } from '@universe-forma/ui-pes';

interface CategoryChipsProps {
  categories: string[];
}

/**
 * Horizontal, single-select filter chips (presentational). The selected chip is
 * dark with a clear (✕); tapping it — or the ✕ — clears it, and tapping another
 * chip switches the selection.
 */
export const CategoryChips: FC<CategoryChipsProps> = ({ categories }) => {
  const [selected, setSelected] = useState<string | null>(null);

  // Mobile: single-row horizontal scroll. Desktop: wrap onto new rows.
  return (
    <div className='flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-x-visible md:pb-0'>
      {categories.map((category) => {
        const active = category === selected;
        return (
          <button
            key={category}
            type='button'
            onClick={() => setSelected(active ? null : category)}
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-full px-4 py-1.5 text-body-2 transition-colors',
              active ? 'bg-text-primary text-common-white' : 'bg-bg-light-grey text-text-primary hover:bg-action-hover'
            )}
          >
            {category}
            {active && <MdClose className='size-4' />}
          </button>
        );
      })}
    </div>
  );
};
