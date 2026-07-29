import { type FC } from 'react';

import { cn } from '@universe-forma/ui-pes';

interface StylePreset {
  label: string;
  /** Text styling classes for the sample. */
  className: string;
  /** Optional pill styling (background + text color) for chip-style presets. */
  pill?: string;
}

const TEXT_STYLE_PRESETS: StylePreset[] = [
  { label: 'Title text', className: 'font-bold' },
  { label: 'Regular text', className: 'font-normal' },
  { label: 'Hand Write', className: 'font-semibold italic [font-family:cursive]' },
  { label: 'Italic Text', className: 'italic' },
  { label: 'Underline', className: 'underline' },
  { label: 'UPPERCASE', className: 'font-semibold uppercase' },
  { label: 'Rounded', className: 'font-medium', pill: 'bg-action-selected text-text-primary' },
  { label: 'BLACK', className: 'font-bold', pill: 'bg-common-black text-common-white' },
  { label: 'WHITE', className: 'font-bold', pill: 'border border-os-divider bg-common-white text-common-black' },
  { label: 'Classic', className: '[font-family:serif]' },
  { label: 'MEME TEXT', className: 'font-black uppercase' },
  { label: 'Spacing', className: 'tracking-[0.25em]' },
  { label: 'Manuscript', className: 'font-semibold italic [font-family:serif]' },
  { label: 'STRICT', className: 'font-bold uppercase' },
  { label: 'Cheerful', className: 'italic [font-family:cursive]' }
];

interface TextStylePresetsProps {
  onSelect: (label: string, styleClassName?: string) => void;
}

/** Grid of selectable text-style presets shown on the Text tab. */
export const TextStylePresets: FC<TextStylePresetsProps> = ({ onSelect }) => (
  <div className='grid grid-cols-2 gap-2'>
    {TEXT_STYLE_PRESETS.map((preset) => (
      <button
        key={preset.label}
        type='button'
        aria-label={preset.label}
        onClick={() => onSelect(preset.label, preset.className)}
        className='flex h-14 items-center justify-center rounded-3 bg-bg-light-grey px-2 transition-colors hover:bg-action-hover'
      >
        <span
          className={cn(
            'truncate text-body-2',
            preset.className,
            preset.pill ? cn('rounded-full px-3 py-1', preset.pill) : 'text-text-primary'
          )}
        >
          {preset.label}
        </span>
      </button>
    ))}
  </div>
);
