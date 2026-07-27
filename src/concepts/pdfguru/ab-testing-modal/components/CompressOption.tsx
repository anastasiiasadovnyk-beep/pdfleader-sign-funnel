import { cn } from '@universe-forma/ui-pes';
import type { CompressOption as CompressOptionData } from '../types';
import { QualityIcon } from './icons';
import QualitySlider from './QualitySlider';

export type CompressOptionProps = {
  option: CompressOptionData;
  projectedSize: string;
  selected: boolean;
  onSelect: (id: string) => void;
  customValue: number;
  onCustomChange: (value: number) => void;
  customSliderLabel: string;
  sliderLeftLabel: string;
  sliderRightLabel: string;
};

export default function CompressOption({
  option,
  projectedSize,
  selected,
  onSelect,
  customValue,
  onCustomChange,
  customSliderLabel,
  sliderLeftLabel,
  sliderRightLabel,
}: CompressOptionProps) {
  const showSlider = option.kind === 'custom';
  return (
    <div
      className={cn(
        'rounded-4 border bg-bg-white-bg px-4 py-4 transition-colors',
        selected ? 'border-primary bg-primary-opacity-4' : 'border-os-outline-border',
      )}
    >
      <button
        type="button"
        disabled={option.disabled}
        onClick={() => onSelect(option.id)}
        className="flex w-full items-center gap-4 text-left disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
            selected ? 'border-primary' : 'border-action-stroke',
          )}
        >
          {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
        </span>

        <QualityIcon icon={option.icon} className="h-8 w-8 shrink-0 text-text-primary" />

        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-body-emph text-text-primary">{option.title}</span>
          <span className="text-body-2 text-text-secondary">{option.description}</span>
        </span>

        <span data-ff="savings" className="flex shrink-0 flex-col items-end md:flex-row md:items-center md:justify-end md:gap-6">
          <span className="text-body-emph text-text-primary">{projectedSize}</span>
          <span
            className={cn('text-right text-body-2 md:w-24', selected ? 'text-primary' : 'text-text-secondary')}
          >
            {option.savingsLabel}
          </span>
        </span>
      </button>

      {showSlider && (
        <div className="mt-5 flex flex-col gap-1" onPointerDown={() => onSelect(option.id)}>
          <QualitySlider value={customValue} onChange={onCustomChange} ariaLabel={customSliderLabel} />
          <div className="flex items-center justify-between">
            <span className="text-caption text-text-secondary">{sliderLeftLabel}</span>
            <span className="text-caption text-text-secondary">{sliderRightLabel}</span>
          </div>
        </div>
      )}
    </div>
  );
}
