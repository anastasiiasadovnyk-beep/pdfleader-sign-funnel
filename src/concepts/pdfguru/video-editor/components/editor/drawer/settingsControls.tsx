import { type FC, type ReactNode, useState } from 'react';

import { Slider } from 'antd';
import { MdVolumeOff, MdVolumeUp } from 'react-icons/md';

import { Input, Switch, cn } from '@universe-forma/ui-pes';

export const COLORS = ['#1a1a1a', '#ffffff', '#5f30e2', '#f59e0b', '#d2294b', '#065f46'];
const SPEED_PRESETS = ['0.5x', '1x', '1.5x', '2x'];

export const Field: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className='flex flex-col gap-2'>
    <span className='text-body-2 text-text-secondary'>{label}</span>
    {children}
  </div>
);

/** A slider paired with an editable value input (e.g. volume %, fade seconds). */
const SliderWithReadout: FC<{
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  leading?: ReactNode;
  onChange: (v: number) => void;
}> = ({ value, min, max, step, suffix, leading, onChange }) => {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className='flex flex-1 items-center gap-2'>
      {leading}
      <Slider
        className='min-w-0 flex-1'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        tooltip={{ open: false }}
      />
      <div className='w-[88px] shrink-0'>
        <Input
          size='dense'
          bg='filled'
          type='number'
          rightText={suffix}
          value={String(value)}
          onChange={(event) => onChange(clamp(Number(event.target.value)))}
          className='!text-caption [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
        />
      </div>
    </div>
  );
};

export const SpeedControl: FC = () => {
  const [speed, setSpeed] = useState('1x');
  return (
    <Field label='Speed'>
      <div className='flex flex-wrap gap-1.5'>
        {SPEED_PRESETS.map((preset) => (
          <button
            key={preset}
            type='button'
            onClick={() => setSpeed(preset)}
            className={cn(
              'rounded-2 border px-2.5 py-1 text-caption transition-colors',
              preset === speed
                ? 'border-primary bg-primary-opacity-8 text-primary'
                : 'border-action-stroke text-text-primary hover:bg-action-hover'
            )}
          >
            {preset}
          </button>
        ))}
      </div>
    </Field>
  );
};

export const OpacityControl: FC = () => {
  const [opacity, setOpacity] = useState(100);
  return (
    <Field label='Opacity'>
      <SliderWithReadout
        value={opacity}
        min={0}
        max={100}
        suffix='%'
        onChange={setOpacity}
      />
    </Field>
  );
};

export const VolumeControl: FC = () => {
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const displayValue = muted ? 0 : volume;
  return (
    <Field label='Volume'>
      <SliderWithReadout
        value={displayValue}
        min={0}
        max={100}
        suffix='%'
        onChange={(value) => {
          setVolume(value);
          setMuted(value === 0);
        }}
        leading={
          <button
            type='button'
            aria-label={muted ? 'Unmute' : 'Mute'}
            aria-pressed={muted}
            onClick={() => setMuted((v) => !v)}
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-2 border transition-colors',
              muted ? 'border-primary bg-primary-opacity-8 text-primary' : 'border-os-divider text-text-secondary'
            )}
          >
            {muted ? <MdVolumeOff className='size-5' /> : <MdVolumeUp className='size-5' />}
          </button>
        }
      />
    </Field>
  );
};

/** Fade Audio In/Out — a toggle that reveals Fade In / Fade Out sliders. */
export const FadeAudioControl: FC = () => {
  const [enabled, setEnabled] = useState(true);
  const [fadeIn, setFadeIn] = useState(1.2);
  const [fadeOut, setFadeOut] = useState(1.2);
  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-between gap-2'>
        <span className='text-body-2 text-text-secondary'>Fade Audio In/Out</span>
        <Switch
          color='primary'
          size='sm'
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>
      {enabled && (
        <div className='flex flex-col gap-3'>
          {[
            { label: 'Fade In', value: fadeIn, set: setFadeIn },
            { label: 'Fade Out', value: fadeOut, set: setFadeOut }
          ].map(({ label, value, set }) => (
            <div
              key={label}
              className='flex items-center gap-2'
            >
              <span className='w-16 shrink-0 text-body-2 text-text-primary'>{label}</span>
              <SliderWithReadout
                value={value}
                min={0}
                max={5}
                step={0.1}
                suffix='s'
                onChange={set}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
