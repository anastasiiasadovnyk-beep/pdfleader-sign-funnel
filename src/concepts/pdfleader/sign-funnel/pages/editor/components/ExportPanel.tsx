import { useState } from 'react';

import { BaseDrawer, Button, IconButton, cn } from '@universe-forma/ui-pes';

import type { ExportFormatId, ExportPanelCopy } from '../types';
import { Icon } from './Icon';

type Props = {
  copy: ExportPanelCopy;
  open: boolean;
  format: ExportFormatId;
  onFormatChange: (format: ExportFormatId) => void;
  onClose: () => void;
  onProceed: () => void;
};

/** Extension-chip colours, matching the dashboard's file glyphs. */
const CHIP: Record<ExportFormatId, string> = {
  pdf: 'bg-material-red-600',
  docx: 'bg-material-blue-700',
  pptx: 'bg-material-purple-700',
  xlsx: 'bg-material-green-700',
  jpg: 'bg-material-amber-500',
  png: 'bg-material-purple-600',
};

/**
 * "Export your file" — right-hand drawer opened by Done. Format picker plus the
 * checkout CTA that continues to the thank-you page. Uses the DS `BaseDrawer`
 * (`direction="right"`), the same primitive as the mobile pages drawer.
 */
export function ExportPanel({ copy, open, format, onFormatChange, onClose, onProceed }: Props) {
  const [fileName, setFileName] = useState(copy.fileName);
  const [renaming, setRenaming] = useState(false);

  return (
    <BaseDrawer
      direction="right"
      open={open}
      onOpenChange={(next) => !next && onClose()}
      overlayClassName="bg-common-black/50"
      className="bg-bg-white-bg h-full w-[440px] rounded-l-6 max-md:w-full max-md:rounded-none"
    >
      <div data-ff="export-panel" className="flex h-full flex-col">
        <div className="flex items-start justify-end px-6 pt-6">
          <IconButton variant="text" color="action" size="sm" aria-label={copy.closeLabel} onClick={onClose}>
            <Icon name="close" />
          </IconButton>
        </div>
        <h2
          data-ff="export-title"
          className="text-mobile-title-4 md:text-desktop-title-4 px-6 text-center text-text-primary"
        >
          {copy.title}
        </h2>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-4 pt-6">
          <div className="flex flex-col gap-3">
            <span className="text-caption-emph uppercase text-text-primary">
              {copy.fileNameLabel}
            </span>
            <div className="flex items-center justify-center gap-2">
              {renaming ? (
                <input
                  autoFocus
                  value={fileName}
                  onChange={(event) => setFileName(event.target.value)}
                  onBlur={() => setRenaming(false)}
                  onKeyDown={(event) => event.key === 'Enter' && setRenaming(false)}
                  aria-label={copy.editFileNameLabel}
                  className="border-os-divider text-body-emph min-w-0 flex-1 rounded-3 border px-3 py-1 text-center text-text-primary outline-none"
                />
              ) : (
                <>
                  <span data-ff="export-file-name" className="text-body-emph truncate text-text-primary">
                    {fileName}
                  </span>
                  <IconButton
                    data-ff="export-rename"
                    variant="text"
                    color="action"
                    size="xs"
                    aria-label={copy.editFileNameLabel}
                    onClick={() => setRenaming(true)}
                  >
                    <Icon name="edit_square" size={18} className="text-action-active" />
                  </IconButton>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-mobile-title-4 text-text-primary">{copy.formatLabel}</h3>
            <div role="radiogroup" aria-label={copy.formatLabel} className="flex flex-col gap-3">
              {copy.formats.map((option) => {
                const selected = option.id === format;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-ff={`export-format-${option.id}`}
                    onClick={() => onFormatChange(option.id)}
                    className={cn(
                      'relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-5 px-4 py-5',
                      'transition-colors disabled:cursor-not-allowed',
                      selected
                        ? 'border-primary border-2 bg-bg-white-bg'
                        : 'border-os-divider hover:bg-action-4 border bg-bg-white-bg',
                    )}
                  >
                    <span
                      className={cn(
                        'text-common-white flex h-6 w-14 shrink-0 items-center justify-center rounded-2',
                        'text-caption-emph uppercase',
                        CHIP[option.id],
                      )}
                    >
                      {option.chip}
                    </span>
                    <span
                      className={cn(
                        'text-mobile-title-4',
                        selected ? 'text-primary' : 'text-text-primary',
                      )}
                    >
                      {option.name}
                    </span>
                    <span className="text-body text-text-secondary">{option.extension}</span>
                    {selected && (
                      <span className="bg-primary absolute right-0 top-0 flex h-9 w-9 items-start justify-end rounded-bl-5 p-1.5">
                        <Icon name="check" size={18} className="text-primary-contrast-text" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-os-divider flex flex-col gap-3 border-t px-6 pb-6 pt-4">
          <Button
            data-ff="export-proceed"
            size="lg"
            variant="filled"
            color="primary"
            className="w-full"
            leftIcon={<Icon name="download" />}
            onClick={onProceed}
          >
            {copy.proceedLabel}
          </Button>
          <Button
            data-ff="export-print"
            size="lg"
            variant="outlined"
            color="action"
            className="w-full"
            leftIcon={<Icon name="print" />}
          >
            {copy.printLabel}
          </Button>
        </div>
      </div>
    </BaseDrawer>
  );
}
