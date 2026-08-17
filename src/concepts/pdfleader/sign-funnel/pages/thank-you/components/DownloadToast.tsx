import { IconButton } from '@universe-forma/ui-pes';

import type { ToastCopy, ToastVariant } from '../types';
import { Icon } from './Icon';

type Props = {
  variant: ToastVariant;
  copy: ToastCopy;
  onDismiss: () => void;
};

/**
 * Success download toast. Composed: ui-pes exports only the imperative
 * `showToast` (no declarative Toast), which can't render a scenario-driven
 * static state — DS gap, flagged in INTEGRATION.md.
 */
export function DownloadToast({ variant, copy, onDismiss }: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 max-md:px-4 max-md:pt-20 md:right-28 md:top-8 md:inset-x-auto">
      <div
        data-ff="ty-toast"
        role="status"
        className="pointer-events-auto relative overflow-hidden rounded-6 backdrop-blur-2xl md:w-[600px]"
      >
        {/* Design stacks white/85 under success/24 with heavy blur — the flattened surface reads opaque, so the base layer is solid white. */}
        <span aria-hidden className="bg-bg-white-bg absolute inset-0" />
        <span aria-hidden className="bg-success-24 absolute inset-0" />
        <div className="relative flex items-start gap-4 p-4">
          <span className="bg-success-16 flex h-10 w-10 shrink-0 items-center justify-center rounded-5 p-2">
            <Icon name="rocket_launch" filled className="text-success-dark" />
          </span>
          <div className="flex min-h-10 flex-1 flex-col justify-center">
            <p data-ff="ty-toast-title" className="text-alert-title text-text-primary">
              {variant === 'signed' ? copy.signedTitle : copy.auditTitle}
            </p>
            <p className="text-body text-text-primary">{copy.body}</p>
          </div>
          <IconButton variant="text" color="action" size="sm" aria-label="Dismiss" onClick={onDismiss}>
            <Icon name="close" size={20} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
