import type { UploadErrorVariant } from '../types';

type IconProps = { className?: string };

const stroke = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...stroke} className={className} aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: IconProps) {
  return (
    <svg {...stroke} className={className} aria-hidden="true">
      <path d="M12 3.5 2.5 20h19L12 3.5Z" />
      <path d="M12 10v4" />
      <path d="M12 17.5h.01" />
    </svg>
  );
}

function FileXIcon({ className }: IconProps) {
  return (
    <svg {...stroke} className={className} aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M9.5 13.5l5 5M14.5 13.5l-5 5" />
    </svg>
  );
}

function ScaleIcon({ className }: IconProps) {
  return (
    <svg {...stroke} className={className} aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  );
}

export function VariantIcon({ variant, className }: { variant: UploadErrorVariant; className?: string }) {
  if (variant === 'corrupted') return <FileXIcon className={className} />;
  if (variant === 'tooLarge') return <ScaleIcon className={className} />;
  return <AlertTriangleIcon className={className} />;
}
