import { useMemo, useState } from 'react';
import type { CompressModalProps, CompressOption } from '../types';
import { buildCtaLabel, projectedSizeFor } from '../lib/compress';

export type CompressState = {
  selectedId: string;
  customValue: number;
  select: (id: string) => void;
  setCustomValue: (value: number) => void;
  ctaLabel: string;
  projectedSizeOf: (option: CompressOption) => string;
  onCompress: () => void;
};

export function useCompressState({
  options,
  initialSelectedId,
  initialCustomValue,
  customSizeRange,
  ctaLabelTemplate,
  onCompress,
}: CompressModalProps): CompressState {
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [customValue, setCustomValue] = useState(initialCustomValue);

  const projectedSizeOf = useMemo(
    () => (option: CompressOption) => projectedSizeFor(option, customValue, customSizeRange),
    [customValue, customSizeRange],
  );

  const selected = options.find((o) => o.id === selectedId) ?? options[0];
  const ctaLabel = buildCtaLabel(ctaLabelTemplate, selected ? projectedSizeOf(selected) : '');

  return {
    selectedId,
    customValue,
    select: setSelectedId,
    setCustomValue,
    ctaLabel,
    projectedSizeOf,
    onCompress: () =>
      onCompress({
        optionId: selectedId,
        customValue: selected?.kind === 'custom' ? customValue : undefined,
      }),
  };
}
