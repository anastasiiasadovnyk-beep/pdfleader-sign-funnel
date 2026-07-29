import type { UploadErrorVariant } from '../types';
import { VariantIcon } from './icons';

type ErrorBadgeProps = {
  variant: UploadErrorVariant;
};

export default function ErrorBadge({ variant }: ErrorBadgeProps) {
  return (
    <div
      data-ff="error-badge"
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-error-8 text-error-main"
    >
      <VariantIcon variant={variant} className="h-8 w-8" />
    </div>
  );
}
