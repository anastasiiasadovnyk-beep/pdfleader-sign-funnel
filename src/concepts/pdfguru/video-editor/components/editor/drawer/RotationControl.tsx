import { type FC } from 'react';

import { MdAdd, MdFlip, MdRemove, MdRotateRight } from 'react-icons/md';

import { cn } from '@universe-forma/ui-pes';

import { Field } from './settingsControls';

type LayoutPatch = Partial<{ rotation: number; flipH: boolean; flipV: boolean }>;

interface RotationControlProps {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  onChange: (patch: LayoutPatch) => void;
}

const iconButtonClass = (active?: boolean) =>
  cn(
    'flex size-9 shrink-0 items-center justify-center rounded-2 border transition-colors',
    active
      ? 'border-primary bg-primary-opacity-8 text-primary'
      : 'border-os-divider text-text-secondary hover:text-text-primary'
  );

/** Rotation: flip horizontal / vertical, rotate 90°, and a degree stepper. */
export const RotationControl: FC<RotationControlProps> = ({ rotation, flipH, flipV, onChange }) => {
  const deg = ((Math.round(rotation) % 360) + 360) % 360;
  return (
    <Field label='Flip & Rotation'>
      <div className='flex items-center gap-2'>
        <button
          type='button'
          aria-label='Flip horizontal'
          aria-pressed={flipH}
          onClick={() => onChange({ flipH: !flipH })}
          className={iconButtonClass(flipH)}
        >
          <MdFlip className='size-5' />
        </button>
        <button
          type='button'
          aria-label='Flip vertical'
          aria-pressed={flipV}
          onClick={() => onChange({ flipV: !flipV })}
          className={iconButtonClass(flipV)}
        >
          <MdFlip className='size-5 rotate-90' />
        </button>
        <button
          type='button'
          aria-label='Rotate 90°'
          onClick={() => onChange({ rotation: deg + 90 })}
          className={iconButtonClass()}
        >
          <MdRotateRight className='size-5' />
        </button>

        <div className='flex flex-1 items-center rounded-2 bg-os-filled-input-bg'>
          <button
            type='button'
            aria-label='Rotate left'
            onClick={() => onChange({ rotation: deg - 1 })}
            className='flex size-9 items-center justify-center text-text-secondary transition-colors hover:text-text-primary'
          >
            <MdRemove className='size-4' />
          </button>
          <span className='flex-1 text-center text-caption text-text-primary'>{deg}°</span>
          <button
            type='button'
            aria-label='Rotate right'
            onClick={() => onChange({ rotation: deg + 1 })}
            className='flex size-9 items-center justify-center text-text-secondary transition-colors hover:text-text-primary'
          >
            <MdAdd className='size-4' />
          </button>
        </div>
      </div>
    </Field>
  );
};
