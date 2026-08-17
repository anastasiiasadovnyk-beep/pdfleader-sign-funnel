import { BaseDropdown, BaseDropdownItem, Button, IconButton, cn } from '@universe-forma/ui-pes';

import type { DocumentRow, RowMenuCopy } from '../types';
import { FileGlyph } from './FileGlyph';
import { Icon } from './Icon';

type Props = {
  file: DocumentRow;
  menu: RowMenuCopy;
  labels: { edit: string; delete: string; download: string; more: string };
  onDownload: () => void;
  onDownloadAudit: () => void;
};

const ITEM_CLASS =
  'text-body-2 text-text-primary flex cursor-pointer select-none items-center gap-2 rounded-2 px-2 py-1.5 outline-none hover:bg-action-8';

/**
 * One document row, laid out as the product's My Documents page: edit, delete
 * and a Download pill. The overflow menu is kept for the actions those icons
 * don't cover, and its contents depend on how the file was signed — only a
 * digital signature has an audit trail to fetch.
 */
export function FileRow({ file, menu, labels, onDownload, onDownloadAudit }: Props) {
  const showAudit = file.signature === 'digital';
  return (
    <div
      data-ff="dash-file-row"
      className="border-os-divider grid grid-cols-[minmax(0,1fr)_150px_100px_auto] items-center gap-4 border-b py-3 max-md:grid-cols-[minmax(0,1fr)_auto]"
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
        <IconButton variant="text" color="action" size="sm" aria-label={labels.delete}>
          <Icon name="delete" size={20} className="text-action-active" />
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
        </BaseDropdown>
      </span>
    </div>
  );
}
