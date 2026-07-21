import { Button } from '@universe-forma/ui-pes';
import type { DocumentsEmptyProps } from './types';

export default function Screen({ heading, subheading, ctaLabel, onUpload }: DocumentsEmptyProps) {
  return (
    <section className="mx-auto flex max-w-[720px] flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-desktop-title-4">{heading}</h1>
      <p className="text-body text-text-secondary">{subheading}</p>
      <Button onClick={onUpload}>{ctaLabel}</Button>
    </section>
  );
}
