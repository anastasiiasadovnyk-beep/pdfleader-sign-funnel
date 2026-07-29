import { type FC } from 'react';

import { MdAdd } from 'react-icons/md';

import { cn } from '@universe-forma/ui-pes';

interface ColorPickerSwatchProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const RAINBOW = 'conic-gradient(from 90deg,#ef4444,#f97316,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#ef4444)';

/**
 * "Choose color" button: a 2px rainbow stroke with a + icon inside. Opens the
 * native color picker via an invisible `<input type="color">` on top.
 */
export const ColorPickerSwatch: FC<ColorPickerSwatchProps> = ({ value, onChange, className }) => (
  <label
    aria-label='Choose color'
    className={cn('relative size-9 cursor-pointer rounded-2 p-0.5', className)}
    style={{ backgroundImage: RAINBOW }}
  >
    <span className='flex size-full items-center justify-center rounded-[6px] bg-bg-white-bg text-text-secondary'>
      <MdAdd className='size-4' />
    </span>
    <input
      type='color'
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className='absolute inset-0 size-full cursor-pointer opacity-0'
    />
  </label>
);
