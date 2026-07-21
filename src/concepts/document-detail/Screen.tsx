import { Button } from '@universe-forma/ui-pes';
import type { DocumentDetailProps } from './types';

export default function Screen({
  status,
  documentTitle,
  metadata,
  onDownload,
  onDelete,
  downloadLabel,
  deleteLabel,
  emptyHeading,
  emptySubheading,
  errorHeading,
  errorSubheading,
  onRetry,
  retryLabel,
}: DocumentDetailProps) {
  if (status === 'empty') {
    return (
      <section className="mx-auto flex max-w-[720px] flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-desktop-title-4">{emptyHeading}</h1>
        <p className="text-body text-text-secondary">{emptySubheading}</p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="mx-auto flex max-w-[720px] flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-desktop-title-4">{errorHeading}</h1>
        <p className="text-body text-text-secondary">{errorSubheading}</p>
        <Button onClick={onRetry}>{retryLabel}</Button>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-[720px] flex-col gap-6 px-4 py-12">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-desktop-title-4">{documentTitle}</h1>
        <Button onClick={onDownload}>{downloadLabel}</Button>
      </header>

      <div className="rounded-3 border border-os-divider bg-bg-white-bg p-6">
        <dl className="flex flex-col gap-4">
          {metadata.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4">
              <dt className="text-body text-text-secondary">{row.label}</dt>
              <dd className="text-body-emph text-text-primary">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Button variant="outlined" color="error" onClick={onDelete} className="self-start">
        {deleteLabel}
      </Button>
    </section>
  );
}
