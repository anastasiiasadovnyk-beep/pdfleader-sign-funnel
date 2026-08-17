import { IconButton, cn } from '@universe-forma/ui-pes';

import type { StepperCopy } from '../types';
import { Icon } from './Icon';
import { Logo } from './Logo';

/**
 * Thank-you page header: logo + 3-step checkout stepper (stepper is a DS gap —
 * composed from tokens; hidden on mobile per the 390px frames).
 */
export function TyHeader({ stepper, onHome }: { stepper: StepperCopy; onHome?: () => void }) {
  return (
    <header className="flex w-full items-center justify-between px-28 py-8 max-md:px-4 max-md:py-3">
      <button
        type="button"
        data-ff="ty-home"
        aria-label="PDFLeader — start over"
        onClick={onHome}
        className="cursor-pointer disabled:cursor-not-allowed"
      >
        <Logo className="max-md:scale-75 max-md:origin-left" />
      </button>
      <IconButton
        variant="text"
        color="action"
        size="ms"
        disabled
        aria-label="Menu"
        className="md:hidden"
      >
        <Icon name="menu" className="text-text-primary" />
      </IconButton>
      <div data-ff="ty-stepper" className="flex items-center gap-3 max-md:hidden">
        {stepper.steps.map((label, i) => {
          const stepNumber = i + 1;
          const completed = stepNumber < stepper.activeStep;
          const active = stepNumber === stepper.activeStep;
          return (
            <div key={label} className="flex items-center gap-3">
              {i > 0 && <span className="bg-secondary-filled-800 h-px w-8 rounded-1" aria-hidden />}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-2',
                    active ? 'bg-primary' : 'bg-os-divider',
                  )}
                >
                  {completed ? (
                    <Icon name="check" size={16} className="text-text-primary" />
                  ) : (
                    <span
                      className={cn(
                        'text-subtitle-emph',
                        active ? 'text-primary-contrast-text' : 'text-text-primary',
                      )}
                    >
                      {stepNumber}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    active ? 'text-subtitle-emph' : 'text-subtitle',
                    'text-text-primary',
                  )}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </header>
  );
}
