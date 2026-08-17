import { IconButton, Switch } from '@universe-forma/ui-pes';

import type { InkColor, InkThickness, SignedToolbarCopy } from '../types';
import { ColorSwatches, ThicknessPicker } from './SignatureModal';
import { Icon } from './Icon';
import { InfoTooltip } from './InfoTooltip';

type Props = {
  copy: SignedToolbarCopy;
  inkColor: InkColor;
  thickness: InkThickness;
  verified: boolean;
  onInkColorChange: (color: InkColor) => void;
  onThicknessChange: (thickness: InkThickness) => void;
  onVerifiedChange: (checked: boolean) => void;
  onDelete: () => void;
};

function Divider() {
  return <span className="bg-os-divider block h-8 w-px shrink-0" aria-hidden />;
}

/**
 * Contextual toolbar shown under the header while the placed signature is
 * selected (composed — ui-pes ships no Toolbar; Switch/IconButton are DS).
 */
export function SignContextToolbar({
  copy,
  inkColor,
  thickness,
  verified,
  onInkColorChange,
  onThicknessChange,
  onVerifiedChange,
  onDelete,
}: Props) {
  return (
    <div
      data-ff="ctx-toolbar"
      data-signature-ui="toolbar"
      className="border-os-divider bg-bg-white-bg flex h-13 items-center justify-center gap-4 border-b px-4"
    >
      <IconButton variant="text" color="action" size="sm" aria-label="Edit signature">
        <Icon name="edit" size={20} />
      </IconButton>
      <Divider />
      <div className="max-md:hidden">
        <ColorSwatches label={copy.colorLabel} value={inkColor} onChange={onInkColorChange} ff="ctx-color-label" />
      </div>
      <div className="max-md:hidden">
        <Divider />
      </div>
      <div className="max-md:hidden">
        <ThicknessPicker
          label={copy.thicknessLabel}
          value={thickness}
          onChange={onThicknessChange}
          ff="ctx-thickness-label"
        />
      </div>
      <div className="max-md:hidden">
        <Divider />
      </div>
      <div className="flex items-center gap-2">
        <InfoTooltip text={copy.verifiedTooltip} ff="ctx-tooltip-verified" />
        <span data-ff="ctx-verified-label" className="text-body text-text-primary">
          {copy.verifiedLabel}
        </span>
        <Switch
          color="primary"
          size="md"
          icon={verified ? 'check' : 'minus'}
          checked={verified}
          onCheckedChange={onVerifiedChange}
          aria-label={copy.verifiedLabel}
        />
      </div>
      <Divider />
      <IconButton variant="text" color="action" size="sm" aria-label="Delete signature" onClick={onDelete}>
        <Icon name="delete" size={20} />
      </IconButton>
    </div>
  );
}
