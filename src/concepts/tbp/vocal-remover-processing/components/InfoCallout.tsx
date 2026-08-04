import { BulbIcon } from './icons';

type InfoCalloutProps = { children: string; className?: string };

/** DS gap: no ui-pes Alert/Callout. Composed as a primary-bordered box with a
 * tonal icon chip + reassurance copy. */
export default function InfoCallout({ children, className }: InfoCalloutProps) {
  return (
    <div
      data-ff="callout"
      className={`flex items-center gap-3 rounded-3 border border-primary bg-bg-white-bg px-4 py-3 ${className ?? ''}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2 bg-primary-opacity-8 text-primary">
        <BulbIcon className="h-5 w-5" />
      </span>
      <p data-ff="callout-text" className="text-body-2 text-text-primary">
        {children}
      </p>
    </div>
  );
}
