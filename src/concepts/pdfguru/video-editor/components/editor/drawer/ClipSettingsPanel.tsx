import { Fragment, type FC, type ReactNode } from 'react';

import { ConfigProvider } from 'antd';
import { MdDeleteOutline } from 'react-icons/md';

import { Button, Input, cn } from '@universe-forma/ui-pes';

import type { TimelineClip } from '../../../model/editorData';
import { formatTimecode } from '../../../model/formatTimecode';
import { ColorRow } from './ColorRow';
import { RotationControl } from './RotationControl';
import { COLORS, FadeAudioControl, Field, OpacityControl, SpeedControl, VolumeControl } from './settingsControls';
import { TextSettings } from './TextSettings';
import { TtsSettings } from './TtsSettings';

type LayoutPatch = Partial<{ rotation: number; flipH: boolean; flipV: boolean; color: string }>;

interface ClipSettingsPanelProps {
  clip: TimelineClip;
  onDelete: () => void;
  onLayout: (clipId: string, patch: LayoutPatch) => void;
  onEditText: (clipId: string, label: string) => void;
}

/** Edit-mode settings for the selected clip; controls vary by clip type. */
export const ClipSettingsPanel: FC<ClipSettingsPanelProps> = ({ clip, onDelete, onLayout, onEditText }) => {
  const hasAudio = clip.kind === 'video' || clip.kind === 'audio' || clip.kind === 'tts';
  const color = clip.color ?? COLORS[0];

  // Color applies to shapes only.
  const colorField = (
    <Field label='Color'>
      <ColorRow
        value={color}
        palette={COLORS}
        onChange={(c) => onLayout(clip.id, { color: c })}
      />
    </Field>
  );

  const durationField = (
    <Field label='Duration'>
      <div className='flex items-center gap-2'>
        {[
          { label: 'Start', value: clip.startSec },
          { label: 'End', value: clip.endSec }
        ].map(({ label, value }) => (
          <div
            key={label}
            className='flex-1'
          >
            <Input
              size='dense'
              bg='filled'
              leftText={label}
              value={formatTimecode(value)}
              readOnly
              className='!text-caption'
            />
          </div>
        ))}
      </div>
    </Field>
  );

  const deleteButton = (
    <Button
      variant='text'
      color='error'
      size='sm'
      leftIcon={<MdDeleteOutline className='size-5' />}
      onClick={onDelete}
      className='w-full !text-caption'
    >
      Delete
    </Button>
  );

  // Sections shown for this clip type, in order. Dividers sit between them:
  // the first and last dividers are 1px tall, the inner ones are 5px.
  const sections: ReactNode[] = [
    clip.kind === 'tts' && (
      <TtsSettings
        value={clip.label ?? ''}
        onChange={(text) => onEditText(clip.id, text)}
      />
    ),
    hasAudio && <SpeedControl />,
    hasAudio && <VolumeControl />,
    hasAudio && <FadeAudioControl />,
    (clip.kind === 'text' || clip.kind === 'subtitle') && (
      <TextSettings
        value={clip.label ?? ''}
        onChange={(text) => onEditText(clip.id, text)}
        textLabel={clip.kind === 'subtitle' ? 'Subtitle text' : 'Text'}
      />
    ),
    clip.kind === 'shape' && !!clip.icon && colorField,
    clip.kind !== 'audio' && clip.kind !== 'tts' && <OpacityControl />,
    clip.kind !== 'audio' && clip.kind !== 'tts' && (
      <RotationControl
        rotation={clip.rotation ?? 0}
        flipH={!!clip.flipH}
        flipV={!!clip.flipV}
        onChange={(patch) => onLayout(clip.id, patch)}
      />
    ),
    durationField,
    deleteButton
  ].filter(Boolean) as ReactNode[];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#5f30e2' } }}>
      <div className='flex flex-col'>
        {sections.map((section, index) => (
          <Fragment key={index}>
            {index > 0 && <div className='h-px w-full bg-os-divider' />}
            <div className={cn('py-4', index === 0 && 'pt-0', index === sections.length - 1 && 'pb-0')}>{section}</div>
          </Fragment>
        ))}
      </div>
    </ConfigProvider>
  );
};
