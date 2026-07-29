import { type FC, useState } from 'react';

import { MdAdd, MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdKeyboardArrowDown, MdRemove } from 'react-icons/md';

import { BaseDropdown, BaseDropdownItem, Switch, cn } from '@universe-forma/ui-pes';

import { ColorRow } from './ColorRow';
import { Field } from './settingsControls';

const TEXT_COLORS = ['#1a1a1a', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
const FONTS = ['Roboto', 'Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier New'];

const STYLE_TOGGLES = [
  { key: 'bold', label: 'Bold', Icon: MdFormatBold },
  { key: 'italic', label: 'Italic', Icon: MdFormatItalic },
  { key: 'underline', label: 'Underline', Icon: MdFormatUnderlined }
] as const;

const clampSize = (value: number) => Math.min(200, Math.max(8, value));

/** A boxed dropdown select for font / style. */
const SelectDropdown: FC<{ value: string; options: string[]; onChange: (value: string) => void }> = ({
  value,
  options,
  onChange
}) => {
  const [open, setOpen] = useState(false);
  return (
    <BaseDropdown
      open={open}
      onOpenChange={setOpen}
      sideOffset={6}
      className='z-[10006] max-h-[240px] w-(--radix-dropdown-menu-trigger-width) space-y-0.5 overflow-y-auto rounded-3 bg-bg-white-bg p-1 shadow-[0_6px_24px_-6px_rgba(33,33,52,0.2)]'
      trigger={
        <button
          type='button'
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-2 border bg-os-filled-input-bg px-3 py-2.5 text-caption text-text-primary transition-colors',
            open ? 'border-primary' : 'border-transparent'
          )}
        >
          <span className='truncate'>{value}</span>
          <MdKeyboardArrowDown className='size-5 shrink-0 text-text-secondary' />
        </button>
      }
    >
      {options.map((option) => (
        <BaseDropdownItem
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            'cursor-pointer rounded-2 px-3 py-2 text-caption transition-colors',
            option === value ? 'bg-primary-opacity-8 text-primary' : 'text-text-primary hover:bg-action-hover'
          )}
        >
          {option}
        </BaseDropdownItem>
      ))}
    </BaseDropdown>
  );
};

interface TextSettingsProps {
  /** The selected text layer's content (controlled). */
  value?: string;
  onChange?: (text: string) => void;
}

/** Text-layer settings: content, color, font, style and size. */
export const TextSettings: FC<TextSettingsProps> = ({ value, onChange }) => {
  const [localText, setLocalText] = useState('Regular text');
  const text = value ?? localText;
  const setText = (next: string) => (onChange ? onChange(next) : setLocalText(next));
  const [color, setColor] = useState(TEXT_COLORS[0]);
  const [fillEnabled, setFillEnabled] = useState(false);
  const [fillColor, setFillColor] = useState(TEXT_COLORS[0]);
  const [font, setFont] = useState(FONTS[0]);
  const [styles, setStyles] = useState({ bold: false, italic: false, underline: false });
  const [size, setSize] = useState(60);

  return (
    <div className='flex flex-col gap-4'>
      <Field label='Text'>
        <textarea
          value={text}
          rows={3}
          onChange={(event) => setText(event.target.value)}
          className='w-full resize-none rounded-2 border border-action-stroke bg-bg-white-bg px-3 py-2 text-body-2 text-text-primary outline-none transition-colors focus:border-primary'
        />
      </Field>

      <Field label='Text color'>
        <ColorRow
          value={color}
          palette={TEXT_COLORS}
          onChange={setColor}
        />
      </Field>

      {/* Fill toggle — when on, reveals a color picker for the text background fill. */}
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-body-2 text-text-secondary'>Fill</span>
          <Switch
            color='primary'
            size='sm'
            checked={fillEnabled}
            onCheckedChange={setFillEnabled}
          />
        </div>
        {fillEnabled && (
          <ColorRow
            value={fillColor}
            palette={TEXT_COLORS}
            onChange={setFillColor}
          />
        )}
      </div>

      <Field label='Font'>
        <SelectDropdown
          value={font}
          options={FONTS}
          onChange={setFont}
        />
      </Field>

      <div className='flex items-start gap-2'>
        <div className='flex-1'>
          <Field label='Style'>
            <div className='flex gap-1.5'>
              {STYLE_TOGGLES.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type='button'
                  aria-label={label}
                  aria-pressed={styles[key]}
                  onClick={() => setStyles((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className={cn(
                    'flex h-10 flex-1 items-center justify-center rounded-2 border transition-colors',
                    styles[key]
                      ? 'border-primary bg-primary-opacity-8 text-primary'
                      : 'border-transparent bg-os-filled-input-bg text-text-secondary hover:text-text-primary'
                  )}
                >
                  <Icon className='size-5' />
                </button>
              ))}
            </div>
          </Field>
        </div>
        <div className='w-[124px]'>
          <Field label='Size'>
            <div className='flex items-center rounded-2 bg-os-filled-input-bg'>
              <button
                type='button'
                aria-label='Decrease size'
                onClick={() => setSize((value) => clampSize(value - 1))}
                className='flex size-10 items-center justify-center text-text-secondary transition-colors hover:text-text-primary'
              >
                <MdRemove className='size-4' />
              </button>
              <input
                type='number'
                value={String(size)}
                onChange={(event) => setSize(clampSize(Number(event.target.value)))}
                className='w-full min-w-0 flex-1 bg-transparent text-center text-caption text-text-primary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none'
              />
              <button
                type='button'
                aria-label='Increase size'
                onClick={() => setSize((value) => clampSize(value + 1))}
                className='flex size-10 items-center justify-center text-text-secondary transition-colors hover:text-text-primary'
              >
                <MdAdd className='size-4' />
              </button>
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
};
