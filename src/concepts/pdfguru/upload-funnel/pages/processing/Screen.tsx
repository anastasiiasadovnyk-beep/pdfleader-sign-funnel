import { Button } from '@universe-forma/ui-pes';
import type { ProcessingProps } from './types';

export default function Screen({ heading, note, ctaLabel, onNext, onBack }: ProcessingProps) {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-6 py-16 text-center">
      <h1 className="text-desktop-title-4 text-text-primary">{heading}</h1>
      <p className="text-body-2 text-text-secondary">{note}</p>
      <div className="flex gap-3">
        <Button variant="outlined" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>{ctaLabel}</Button>
      </div>
    </div>
  );
}
