import { Button, cn } from '@universe-forma/ui-pes';

import type { SelectTypeModalCopy, SignTypeCardCopy, SignatureType } from '../types';
import { Icon } from './Icon';
import { InfoTooltip } from './InfoTooltip';

type CardProps = {
  copy: SignTypeCardCopy;
  kind: SignatureType;
  selected: boolean;
  previewImageUrl: string;
  bestUsedForLabel: string;
  onSelect: () => void;
};

function SignTypeCard({
  copy,
  kind,
  selected,
  previewImageUrl,
  bestUsedForLabel,
  onSelect,
}: CardProps) {
  const badgeError = kind === 'simple';
  return (
    <div
      data-ff={`st-card-${kind}`}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className={cn(
        'bg-bg-white-bg relative flex flex-1 cursor-pointer flex-col overflow-hidden rounded-7 border-4',
        selected ? 'border-primary' : 'border-os-divider',
      )}
    >
      {selected && (
        <span className="bg-primary absolute left-0 top-0 flex h-12 w-12 items-start justify-start rounded-br-7 p-3">
          <Icon name="check" filled className="text-primary-contrast-text" />
        </span>
      )}
      <div className="flex flex-col items-center px-12 pb-9 pt-12 max-md:px-6 max-md:pb-6 max-md:pt-8">
        <div
          className={cn(
            'relative flex h-20 w-full items-center justify-center p-3',
            kind === 'simple'
              ? 'border border-[rgba(101,31,255,0.12)]'
              : 'border-primary-opacity-40 border',
          )}
        >
          {[
            'left-0 top-0',
            'left-1/2 top-0 -translate-x-1/2',
            'right-0 top-0',
            'left-0 top-1/2 -translate-y-1/2',
            'right-0 top-1/2 -translate-y-1/2',
            'left-0 bottom-0',
            'left-1/2 bottom-0 -translate-x-1/2',
            'right-0 bottom-0',
          ].map((pos) => (
            <span
              key={pos}
              aria-hidden
              className={cn(
                'bg-bg-white-bg absolute h-1.5 w-1.5 rounded-full border',
                kind === 'simple' ? 'border-[rgba(101,31,255,0.4)]' : 'border-primary',
                pos,
              )}
            />
          ))}
          <img
            src={previewImageUrl}
            alt="Signature preview"
            className="block max-h-full w-auto max-w-full"
          />
          <span
            data-ff={`st-badge-${copy.badgeLabel.toLowerCase()}`}
            className={cn(
              'absolute bottom-0 left-1/2 flex -translate-x-1/2 translate-y-1/2 items-center gap-1',
              'rounded-2 border border-common-white/85 px-2 py-1 backdrop-blur-sm',
              'text-[10px] font-medium uppercase leading-[14px] tracking-wide',
              badgeError ? 'bg-error-20 text-error-dark' : 'bg-success-20 text-success-dark',
            )}
          >
            <Icon name={badgeError ? 'gpp_bad' : 'verified'} filled size={12} />
            {copy.badgeLabel}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-10 pb-8 text-center">
        <h3
          data-ff={`st-card-${kind}-title`}
          className={cn(
            'text-desktop-title-6 md:text-mobile-title-3',
            selected ? 'text-primary' : 'text-text-primary',
          )}
        >
          {copy.title}
        </h3>
        <div className="mt-4 flex flex-col gap-2">
          {copy.description.map((paragraph) => (
            <p key={paragraph} className="text-body-2 text-text-primary">
              {paragraph}
            </p>
          ))}
        </div>
        <InfoTooltip
          text={copy.bestUsedForTooltip}
          ff={`st-tooltip-${kind}`}
          label={bestUsedForLabel}
          className="text-body-2 mx-auto mt-auto pt-4 text-text-secondary"
        />
      </div>
    </div>
  );
}

type SelectTypeModalProps = {
  copy: SelectTypeModalCopy;
  selected: SignatureType;
  onSelect: (type: SignatureType) => void;
  onCancel: () => void;
  onContinue: () => void;
};

/** "Sign the document — choose sealing type" dialog (fullscreen on mobile). */
export function SelectTypeModal({
  copy,
  selected,
  onSelect,
  onCancel,
  onContinue,
}: SelectTypeModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-common-black/30 max-md:hidden" aria-hidden />
      <div
        data-ff="st-dialog"
        role="dialog"
        aria-modal
        aria-label={copy.title}
        className={cn(
          'bg-bg-white-bg relative flex flex-col',
          'max-md:h-full max-md:w-full',
          'md:w-[796px] md:rounded-6 md:shadow-[0_0_12px_-8px_rgba(0,0,0,0.08),0_20px_32px_0_rgba(0,0,0,0.16)]',
        )}
      >
        <div className="px-6 pb-4 pt-6">
          <h2
            data-ff="st-title"
            className="text-mobile-title-4 md:text-desktop-title-4 text-text-primary"
          >
            {copy.title}
          </h2>
          <p data-ff="st-subtitle" className="text-body-2 text-text-secondary">
            {copy.subtitle}
          </p>
        </div>
        <div
          data-ff="st-cards"
          className="flex gap-4 overflow-y-auto px-5 py-3 max-md:flex-col md:items-stretch"
        >
          <SignTypeCard
            copy={copy.simple}
            kind="simple"
            selected={selected === 'simple'}
            previewImageUrl={copy.previewImageUrl}
            bestUsedForLabel={copy.bestUsedForLabel}
            onSelect={() => onSelect('simple')}
          />
          <SignTypeCard
            copy={copy.digital}
            kind="digital"
            selected={selected === 'digital'}
            previewImageUrl={copy.previewImageUrl}
            bestUsedForLabel={copy.bestUsedForLabel}
            onSelect={() => onSelect('digital')}
          />
        </div>
        <div
          className={cn(
            'flex px-6 pb-6 pt-4',
            'max-md:border-os-divider max-md:flex-col-reverse max-md:gap-3 max-md:border-t max-md:shadow-[0_-4px_12px_rgba(0,0,0,0.04)]',
            'md:items-center md:justify-between',
          )}
        >
          <Button
            data-ff="st-cancel"
            size="md"
            variant="outlined"
            color="action"
            className="max-md:w-full"
            onClick={onCancel}
          >
            {copy.cancelLabel}
          </Button>
          <Button
            data-ff="st-continue"
            size="md"
            variant="filled"
            color="primary"
            className="max-md:w-full"
            rightIcon={
              <span className="max-md:hidden">
                <Icon name="chevron_right" />
              </span>
            }
            onClick={onContinue}
          >
            {copy.continueLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
