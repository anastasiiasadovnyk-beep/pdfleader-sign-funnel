import type { CompressOption } from '../types';

export function formatMb(mb: number): string {
  return `${Math.round(mb)} MB`;
}

export function customSizeMb(value: number, range: { minMb: number; maxMb: number }): number {
  const clamped = Math.min(100, Math.max(0, value));
  return range.maxMb - (clamped / 100) * (range.maxMb - range.minMb);
}

export function buildCtaLabel(template: string, size: string): string {
  return template.replace('{size}', size);
}

export function projectedSizeFor(
  option: CompressOption,
  customValue: number,
  range: { minMb: number; maxMb: number },
): string {
  return option.kind === 'custom' ? formatMb(customSizeMb(customValue, range)) : option.projectedSize;
}
