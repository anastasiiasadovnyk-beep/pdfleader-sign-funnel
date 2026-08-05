import type { ResultFeature } from '../types';
import { CheckIcon } from './icons';

type FeatureBadgesProps = { features: ResultFeature[] };

/** Centered row of check-marked reassurance items (blue check + primary label).
 * Wraps on narrow viewports. */
export default function FeatureBadges({ features }: FeatureBadgesProps) {
  return (
    <ul className="flex flex-col items-center justify-center gap-3 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-2">
      {features.map((f) => (
        <li key={f.label} data-ff="feature" className="flex items-center gap-1 text-body-2 text-primary">
          <CheckIcon className="h-4 w-4 shrink-0" />
          <span>{f.label}</span>
        </li>
      ))}
    </ul>
  );
}
