import type { FC, ReactNode } from 'react';
import { Switch } from '@universe-forma/ui-pes';
import type { GifSettings, Mp4ToGifProps } from '../types';
import type { useMp4ToGifModel } from '../hooks/useMp4ToGifModel';
import SelectField from './SelectField';
import SpeedTabs from './SpeedTabs';
import { RatioGlyph } from './icons';

/** A labelled settings row: title + helper + control. */
const Field: FC<{ label: string; hint: string; control: ReactNode; ff?: string }> = ({
  label,
  hint,
  control,
  ff,
}) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-1">
      <span data-ff={ff} className="text-body-emph text-text-primary">
        {label}
      </span>
      <span className="text-caption text-text-secondary">{hint}</span>
    </div>
    {control}
  </div>
);

type PanelProps = {
  copy: Pick<
    Mp4ToGifProps,
    | 'ratioLabel' | 'ratioHint' | 'speedLabel' | 'speedHint' | 'fpsLabel' | 'fpsHint'
    | 'qualityLabel' | 'qualityHint' | 'loopLabel' | 'loopHint'
  >;
  options: Pick<Mp4ToGifProps, 'ratios' | 'speeds' | 'fpsOptions' | 'qualities'>;
  settings: GifSettings;
  derived: ReturnType<typeof useMp4ToGifModel>['derived'];
  actions: ReturnType<typeof useMp4ToGifModel>['actions'];
};

/** The GIF settings form — Ratio, Speed, Frame rate, Quality, Loop.
 * Presentational: values + handlers come from the model. */
export default function GifSettingsPanel({ copy, options, derived, settings, actions }: PanelProps) {
  const ratio = derived.ratio;
  return (
    <div className="flex flex-col gap-6">
      <Field
        ff="setting-label"
        label={copy.ratioLabel}
        hint={copy.ratioHint}
        control={
          <SelectField
            ff="ratio-field"
            value={settings.ratioId}
            triggerLabel={derived.ratioLabel}
            leftIcon={<RatioGlyph w={ratio.w} h={ratio.h} />}
            onSelect={actions.selectRatio}
            options={options.ratios.map((r) => ({
              id: r.id,
              label: r.name,
              caption: `${r.w}:${r.h}`,
              icon: <RatioGlyph w={r.w} h={r.h} />,
            }))}
          />
        }
      />
      <Field
        label={copy.speedLabel}
        hint={copy.speedHint}
        control={<SpeedTabs options={options.speeds} value={settings.speedId} onValueChange={actions.selectSpeed} />}
      />
      <Field
        label={copy.fpsLabel}
        hint={copy.fpsHint}
        control={
          <SelectField
            ff="fps-field"
            value={settings.fpsId}
            triggerLabel={derived.fpsLabel}
            onSelect={actions.selectFps}
            options={options.fpsOptions.map((o) => ({ id: o.id, label: o.label }))}
          />
        }
      />
      <Field
        label={copy.qualityLabel}
        hint={copy.qualityHint}
        control={
          <SelectField
            ff="quality-field"
            value={settings.qualityId}
            triggerLabel={derived.qualityLabel}
            onSelect={actions.selectQuality}
            options={options.qualities.map((o) => ({ id: o.id, label: o.label, caption: o.caption }))}
          />
        }
      />

      {/* Loop: inline label + switch, helper below */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-body-emph text-text-primary">{copy.loopLabel}</span>
          <Switch
            color="primary"
            size="md"
            checked={settings.loop}
            onCheckedChange={actions.toggleLoop}
          />
        </div>
        <span className="text-caption text-text-secondary">{copy.loopHint}</span>
      </div>
    </div>
  );
}
