import { type FC, type ReactNode, useState } from 'react';

import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md';

import { BaseDropdown, BaseDropdownItem, Button, cn } from '@universe-forma/ui-pes';

import { Field } from './settingsControls';

const LANGUAGES = [
  { name: 'English', flag: '🇬🇧' },
  { name: 'Spanish', flag: '🇪🇸' },
  { name: 'French', flag: '🇫🇷' },
  { name: 'German', flag: '🇩🇪' },
  { name: 'Ukrainian', flag: '🇺🇦' }
];

const VOICES = ['Chris', 'Emma', 'Liam', 'Sophia', 'Noah'];

const MAX_CHARS = 5000;

/** Boxed dropdown select (trigger button + menu), matching the drawer's field look. */
const Select: FC<{ value: string; options: string[]; onChange: (value: string) => void; renderOption: (option: string) => ReactNode }> = ({
  value,
  options,
  onChange,
  renderOption
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
            'flex w-full items-center justify-between gap-2 rounded-2 border bg-os-filled-input-bg px-3 py-3 text-body-2 text-text-primary transition-colors',
            open ? 'border-primary' : 'border-transparent'
          )}
        >
          <span className='flex min-w-0 items-center gap-2 truncate'>{renderOption(value)}</span>
          <MdKeyboardArrowDown className='size-5 shrink-0 text-text-secondary' />
        </button>
      }
    >
      {options.map((option) => (
        <BaseDropdownItem
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            'flex cursor-pointer items-center gap-2 rounded-2 px-3 py-2 text-body-2 transition-colors',
            option === value ? 'bg-primary-opacity-8 text-primary' : 'text-text-primary hover:bg-action-hover'
          )}
        >
          {renderOption(option)}
        </BaseDropdownItem>
      ))}
    </BaseDropdown>
  );
};

/** Small round voice avatar (initial), standing in for the voice's photo. */
const VoiceAvatar: FC<{ name: string }> = ({ name }) => (
  <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-opacity-8 text-caption-xs font-[700] text-primary'>
    {name.charAt(0)}
  </span>
);

interface TtsSettingsProps {
  /** The TTS clip's source text (controlled). */
  value?: string;
  onChange?: (text: string) => void;
}

/**
 * Text-to-speech settings: language + voice, the source text with a character
 * counter, and a Generate action. Editing the text marks the audio stale — the
 * user presses Generate to (conceptually) re-synthesize it.
 */
export const TtsSettings: FC<TtsSettingsProps> = ({ value, onChange }) => {
  const [localText, setLocalText] = useState('Simplify document reviews with intuitive markup tools.');
  const text = value ?? localText;
  const setText = (next: string) => (onChange ? onChange(next) : setLocalText(next));
  const [language, setLanguage] = useState(LANGUAGES[0].name);
  const [voice, setVoice] = useState(VOICES[0]);
  // The last text that was "generated"; when it differs, the audio is stale.
  const [generated, setGenerated] = useState(text);
  const isStale = text.trim() !== generated.trim();

  const flagOf = (name: string) => LANGUAGES.find((l) => l.name === name)?.flag ?? '🏳️';

  return (
    <div className='flex flex-col gap-4'>
      <Select
        value={language}
        options={LANGUAGES.map((l) => l.name)}
        onChange={setLanguage}
        renderOption={(name) => (
          <>
            <span className='text-lg leading-none'>{flagOf(name)}</span>
            <span className='truncate'>{name}</span>
          </>
        )}
      />
      <Select
        value={voice}
        options={VOICES}
        onChange={setVoice}
        renderOption={(name) => (
          <>
            <VoiceAvatar name={name} />
            <span className='truncate'>{name}</span>
          </>
        )}
      />

      <div className='flex flex-col gap-1'>
        <textarea
          value={text}
          rows={4}
          maxLength={MAX_CHARS}
          onChange={(event) => setText(event.target.value)}
          className='w-full resize-none rounded-2 border border-action-stroke bg-bg-white-bg px-3 py-2 text-body-2 text-text-primary outline-none transition-colors focus:border-primary'
        />
        <span className='text-caption text-text-secondary'>
          {text.length} / {MAX_CHARS}
        </span>
      </div>

      <Button
        variant='filled-tonal'
        color='primary'
        size='md'
        className='w-full'
        rightIcon={<MdKeyboardArrowRight className='size-5' />}
        onClick={() => setGenerated(text)}
      >
        Generate
      </Button>
      {isStale && (
        <span className='-mt-2 text-caption text-text-secondary'>Text changed — Generate to update the audio.</span>
      )}
    </div>
  );
};
