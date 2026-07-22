import { Button } from '@universe-forma/ui-pes';
import type { DoneProps } from './types';

export default function Screen({ heading, subheading, ctaLabel, onBack }: DoneProps) {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-6 py-16 text-center">
      <h1 className="text-desktop-title-4 text-text-primary">{heading}</h1>
      <p className="text-body-2 text-text-secondary">{subheading}</p>
      <Button onClick={onBack}>{ctaLabel}</Button>
    </div>
  );
}
