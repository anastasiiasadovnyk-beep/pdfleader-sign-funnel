import { BaseDropdown, BaseDropdownItem, Button, IconButton, cn } from '@universe-forma/ui-pes';

import type { DocumentRow, RowMenuCopy } from '../types';
import { FileGlyph } from './FileGlyph';
import { Icon } from './Icon';

type Props = {
  file: DocumentRow;
  menu: RowMenuCopy;
  labels: { edit: string; download: string; more: string };
  onDownload: () => void;
  onDownloadAudit: () => void;
};

/**
 * Column template shared by the header and every row. Header and rows are
 * separate grids, so the tracks must be fixed widths — an `auto` track resolves
 * per-grid and the two would drift apart.
 */
export const ROW_GRID =
  'grid grid-cols-[minmax(0,1fr)_150px_110px_224px] items-center gap-4 max-md:grid-cols-[minmax(0,1fr)_auto]';

const ITEM_CLASS =
  'text-body-2 text-text-primary flex cursor-pointer select-none items-center gap-2 rounded-2 px-2 py-1.5 outline-none hover:bg-action-8';

/**
 * One document row: edit and a Download pill, with everything else behind the
 * overflow menu (Duplicate and Delete, plus "Download audit trail" — only a
 * digital signature has an audit trail to fetch).
 */
export function FileRow({ file, menu, labels, onDownload, onDownloadAudit }: Props) {
  const showAudit = file.signature === 'digital';
  return (
    <div
      data-ff="dash-file-row"
      className={cn(ROW_GRID, 'border-os-divider border-b py-3')}
    >
      <span className="flex min-w-0 items-center gap-3">
        <FileGlyph kind={file.kind} signature={file.signature} />
        <span className="text-body-2 truncate text-text-primary">{file.name}</span>
      </span>
      <span className="text-body-2 text-text-primary max-md:hidden">{file.lastEditDate}</span>
      <span className="text-body-2 text-text-secondary max-md:hidden">{file.size}</span>
      <span className="flex items-center justify-end gap-1">
        <IconButton variant="text" color="action" size="sm" aria-label={labels.edit}>
          <Icon name="edit_square" size={20} className="text-action-active" />
        </IconButton>
        <Button
          data-ff="dash-row-download"
          size="ms"
          variant="filled-tonal"
          color="action"
          leftIcon={<Icon name="download" size={20} />}
          onClick={onDownload}
        >
          {labels.download}
        </Button>
        <BaseDropdown
          align="end"
          sideOffset={4}
          className={cn(
            'bg-bg-white-bg z-30 flex min-w-[208px] flex-col rounded-4 p-2',
            'shadow-[0_8px_24px_rgba(0,0,0,0.12)]',
          )}
          trigger={
            <IconButton
              data-ff={`dash-row-more-${file.signature ?? 'unsigned'}`}
              variant="text"
              color="action"
              size="sm"
              aria-label={labels.more}
            >
              <Icon name="more_horiz" size={20} className="text-action-active" />
            </IconButton>
          }
        >
          {showAudit && (
            <BaseDropdownItem
              data-ff="dash-menu-audit"
              className={ITEM_CLASS}
              onSelect={onDownloadAudit}
            >
              <Icon name="history" size={18} className="text-action-active" />
              {menu.auditLabel}
            </BaseDropdownItem>
          )}
          <BaseDropdownItem className={ITEM_CLASS}>
            <Icon name="content_copy" size={18} className="text-action-active" />
            {menu.duplicateLabel}
          </BaseDropdownItem>
          <span className="bg-os-divider my-1 block h-px" aria-hidden />
          <BaseDropdownItem data-ff="dash-menu-delete" className={ITEM_CLASS}>
            <Icon name="delete" size={18} className="text-action-active" />
            {menu.deleteLabel}
          </BaseDropdownItem>
        </BaseDropdown>
      </span>
    </div>
  );
}
