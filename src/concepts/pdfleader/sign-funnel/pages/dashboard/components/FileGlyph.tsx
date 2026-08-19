import { cn } from '@universe-forma/ui-pes';

import type { FileKind, SignatureKind } from '../types';
import { Icon } from './Icon';

/** Extension chip colours, per the reference's file icons. */
const TYPE_CHIP: Record<FileKind, { label: string; className: string }> = {
  pdf: { label: 'PDF', className: 'bg-material-red-600' },
  xlsx: { label: 'XLSX', className: 'bg-material-green-700' },
  docx: { label: 'DOCX', className: 'bg-material-blue-700' },
  jpg: { label: 'JPG', className: 'bg-material-amber-500' },
  png: { label: 'PNG', className: 'bg-material-purple-600' },
};

/**
 * Signed-document indicator. Green for a digital signature (sealed, has an
 * audit trail), grey for a simple one — the same split the row menu uses.
 * The reference draws the digital badge as a scalloped seal; ui-pes has no
 * seal shape, so this is a round badge in the seal's green (flagged in
 * INTEGRATION.md).
 */
function SignatureBadge({ kind }: { kind: SignatureKind }) {
  return (
    <span
      data-ff={`file-signature-${kind}`}
      className={cn(
        'absolute -left-1.5 -top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full',
        kind === 'digital' ? 'bg-material-green-600' : 'bg-material-grey-500',
      )}
    >
      <Icon name="signature" size={12} filled className="text-common-white" />
    </span>
  );
}

/** File-type icon: page shape, extension chip, and the signature badge if signed. */
export function FileGlyph({ kind, signature }: { kind: FileKind; signature?: SignatureKind }) {
  const chip = TYPE_CHIP[kind];
  return (
    <span className="relative block h-10 w-8 shrink-0">
      <span className="border-os-divider bg-bg-white-bg absolute inset-0 rounded-1 border" />
      {/* Folded corner, drawn as a lighter square with two edges. */}
      <span className="border-os-divider bg-bg-light-grey absolute right-0 top-0 h-2.5 w-2.5 border-b border-l" />
      <span
        className={cn(
          'text-common-white absolute -left-0.5 -right-0.5 bottom-1 rounded-1 py-px text-center text-[8px] font-bold leading-tight',
          chip.className,
        )}
      >
        {chip.label}
      </span>
      {signature && <SignatureBadge kind={signature} />}
    </span>
  );
}
