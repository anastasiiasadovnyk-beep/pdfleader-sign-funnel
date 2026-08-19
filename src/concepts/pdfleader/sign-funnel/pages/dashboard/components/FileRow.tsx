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
 *
 * Tracks are sized so "Last Edit" starts where the reference puts it (~47% of
 * the table). "Size" lands a little left of the reference because the Actions
 * track has to hold the Download pill kept from this prototype, which is wider
 * than the reference's three bare icons.
 */
export const ROW_GRID =
  'grid grid-cols-[minmax(0,1fr)_240px_136px_224px] items-center gap-4 max-md:grid-cols-[minmax(0,1fr)_auto]';

const ITEM_CLASS =
  'text-body-2 text-text-primary flex cursor-pointer select-none items-center gap-2 rounded-2 px-2 py-1.5 outline-none hover:bg-action-8';

/**
 * One document row, laid out like the product's My Documents page: file glyph
 * and name, the last edit stacked over its relative time, the size, then the
 * actions. The reference draws all three actions as bare icons; the Download
 * pill is kept from this prototype's own version on request, so the action
 * cluster is wider here than in the reference.
 */
export function FileRow({ file, menu, labels, onDownload, onDownloadAudit }: Props) {
  const showAudit = file.signature === 'digital';
  return (
    <div
      data-ff="dash-file-row"
      // The reference separates rows by white space alone — no rules between them.
      className={cn(ROW_GRID, 'py-4')}
    >
      <span className="flex min-w-0 items-center gap-4">
        <FileGlyph kind={file.kind} signature={file.signature} />
        <span className="text-subtitle truncate text-text-primary">{file.name}</span>
      </span>
      {/* Last Edit stacks the date over how long ago it was. */}
      <span data-ff="dash-row-last-edit" className="flex flex-col max-md:hidden">
        <span className="text-body text-text-primary">{file.lastEditDate}</span>
        <span className="text-body-2 text-text-secondary">{file.lastEditRelative}</span>
      </span>
      <span className="text-body text-text-primary max-md:hidden">{file.size}</span>
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
            /*
             * Outlined, because the reference rings this action. ui-pes pairs
             * outlined+action with border-action-stroke (low-alpha black), which
             * is the DS's own way to get the ring — the opaque outline token
             * flagged in DS-GAPS.md belongs to Button, not IconButton, so no
             * hand-rolled border is needed.
             *
             * Not exactly the reference's shape: the 2px outline grows the box
             * to 36px while --radius-icon-btn-sm stays 16px, so each side keeps
             * a ~4px straight run — a squircle rather than a true circle — and
             * the border is heavier than the reference's hairline. Logged in
             * DS-GAPS.md; a circular icon-button token would close it.
             */
            <IconButton
              data-ff={`dash-row-more-${file.signature ?? 'unsigned'}`}
              variant="outlined"
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
