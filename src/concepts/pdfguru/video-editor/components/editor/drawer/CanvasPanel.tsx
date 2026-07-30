import { type FC, useState } from 'react';

import { MdKeyboardArrowDown } from 'react-icons/md';

import { BaseDropdown, BaseDropdownItem, cn } from '@universe-forma/ui-pes';

import { ASPECT_RATIO_OPTIONS, BACKGROUND_COLORS, type AspectRatioOption } from '../../../model/editorData';
import { ColorPickerSwatch } from './ColorPickerSwatch';

interface CanvasPanelProps {
  /** Selected aspect ratio (shared with the preview stage), applied live. */
  aspect: AspectRatioOption;
  onSelectAspect: (option: AspectRatioOption) => void;
}

/** Canvas tab — project-level settings only (aspect ratio + background color). */
export const CanvasPanel: FC<CanvasPanelProps> = ({ aspect, onSelectAspect }) => {
  const [open, setOpen] = useState(false);
  const [bg, setBg] = useState<string>('#ffffff');
  // Custom colors chosen via the picker; they persist as swatches before it.
  const [picked, setPicked] = useState<string[]>([]);
  const TriggerIcon = aspect.icon;

  const handlePick = (color: string) => {
    const isBaseColor = BACKGROUND_COLORS.slice(0, 4).includes(color as (typeof BACKGROUND_COLORS)[number]);
    setPicked((prev) => (isBaseColor || prev.includes(color) ? prev : [...prev, color]));
    setBg(color);
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-col gap-2'>
        <span className='text-body-2 text-text-secondary'>Aspect ratio</span>
        <BaseDropdown
          open={open}
          onOpenChange={setOpen}
          sideOffset={6}
          className='z-[10006] max-h-[320px] w-(--radix-dropdown-menu-trigger-width) space-y-0.5 overflow-y-auto rounded-3 bg-bg-white-bg p-1 shadow-[0_6px_24px_-6px_rgba(33,33,52,0.2)]'
          trigger={
            <button
              type='button'
              className={cn(
                'flex w-full items-center gap-2 rounded-2 border px-3 py-2.5 text-left transition-colors',
                open ? 'border-primary' : 'border-action-stroke'
              )}
            >
              <TriggerIcon className='size-5 shrink-0 text-text-secondary' />
              <span className='flex-1 truncate text-body-2 text-text-primary'>
                {aspect.name} <span className='text-text-secondary'>{aspect.ratio}</span>
              </span>
              <MdKeyboardArrowDown className='size-5 shrink-0 text-text-secondary' />
            </button>
          }
        >
          {ASPECT_RATIO_OPTIONS.map((option) => {
            const isSelected = option === aspect;
            const OptionIcon = option.icon;
            return (
              <BaseDropdownItem
                key={`${option.name}-${option.ratio}`}
                onClick={() => onSelectAspect(option)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-2 px-3 py-2 transition-colors',
                  isSelected ? 'bg-primary-opacity-8' : 'hover:bg-action-hover'
                )}
              >
                <OptionIcon className={cn('size-5 shrink-0', isSelected ? 'text-primary' : 'text-text-secondary')} />
                <span className='flex flex-col'>
                  <span className={cn('text-body-2 font-medium', isSelected ? 'text-primary' : 'text-text-primary')}>
                    {option.name}
                  </span>
                  <span className={cn('text-caption', isSelected ? 'text-primary' : 'text-text-secondary')}>
                    {option.ratio}
                  </span>
                </span>
              </BaseDropdownItem>
            );
          })}
        </BaseDropdown>
      </div>

      <div className='flex flex-col gap-2'>
        <span className='text-body-2 text-text-secondary'>Background color</span>
        {/* Starts as 6 slots: white + 4 colors + picker. Picked custom colors
            append before the picker, wrapping it onto a new row. */}
        <div className='flex flex-wrap gap-2'>
          {/* Default: white background */}
          <button
            type='button'
            aria-label='White background'
            onClick={() => setBg('#ffffff')}
            className={cn(
              'size-9 rounded-2 border border-os-divider bg-common-white transition-transform hover:scale-105',
              bg === '#ffffff' && 'ring-2 ring-primary ring-offset-2'
            )}
          />
          {[...BACKGROUND_COLORS.slice(0, 4), ...picked].map((color) => (
            <button
              key={color}
              type='button'
              aria-label={`Background ${color}`}
              onClick={() => setBg(color)}
              style={{ backgroundColor: color }}
              className={cn(
                'size-9 rounded-2 transition-transform hover:scale-105',
                bg === color && 'ring-2 ring-primary ring-offset-2'
              )}
            />
          ))}
          <ColorPickerSwatch
            value={bg}
            onChange={handlePick}
          />
        </div>
      </div>
    </div>
  );
};
