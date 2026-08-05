import { useEffect, useRef, useState } from 'react';
import { IconButton } from '@universe-forma/ui-pes';
import type { TrackRating } from '../types';
import { CheckIcon, ThumbDownIcon, ThumbUpIcon } from './icons';

type RateResultProps = {
  label: string;
  thanksLabel: string;
  rating: TrackRating | null;
  onRate?: (rating: TrackRating) => void;
};

/** How long the "Thanks for your feedback" confirmation stays up. */
const THANKS_MS = 3000;

/**
 * "Rate the result:" prompt + thumbs up/down. On a rating the row cross-fades to
 * a "Thanks for your feedback" confirmation (green check) for 3s, then fades back
 * to the prompt with the chosen thumb now in its active (filled/primary) state.
 * The two layers are always mounted and toggled via opacity/translate so both the
 * enter and exit transitions animate without a motion library.
 */
export default function RateResult({ label, thanksLabel, rating, onRate }: RateResultProps) {
  const [showThanks, setShowThanks] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleRate = (value: TrackRating) => {
    onRate?.(value);
    setShowThanks(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShowThanks(false), THANKS_MS);
  };

  return (
    <div className="relative flex min-h-8 items-center justify-center">
      {/* Prompt + thumbs */}
      <div
        className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-300 ease-out ${
          showThanks ? 'pointer-events-none -translate-y-1 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <span data-ff="rate-label" className="mr-2 text-body-2 text-text-secondary">
          {label}
        </span>
        <IconButton
          variant="text"
          color={rating === 'up' ? 'primary' : 'action'}
          size="sm"
          onClick={() => handleRate('up')}
          aria-label="Rate the result good"
          aria-pressed={rating === 'up'}
        >
          <ThumbUpIcon className="h-5 w-5" filled={rating === 'up'} />
        </IconButton>
        <IconButton
          variant="text"
          color={rating === 'down' ? 'primary' : 'action'}
          size="sm"
          onClick={() => handleRate('down')}
          aria-label="Rate the result bad"
          aria-pressed={rating === 'down'}
        >
          <ThumbDownIcon className="h-5 w-5" filled={rating === 'down'} />
        </IconButton>
      </div>

      {/* Thanks confirmation — same type as the prompt (text-body-2, secondary),
          plain green check (no background) that pops in. */}
      <div
        aria-live="polite"
        className={`pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 transition-all duration-300 ease-out ${
          showThanks ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
        }`}
      >
        <span className="text-body-2 text-text-secondary">{thanksLabel}</span>
        <span
          className={`transition-transform duration-300 ease-out ${showThanks ? 'scale-100' : 'scale-50'}`}
        >
          <CheckIcon className="h-4 w-4 text-success-main" />
        </span>
      </div>
    </div>
  );
}
