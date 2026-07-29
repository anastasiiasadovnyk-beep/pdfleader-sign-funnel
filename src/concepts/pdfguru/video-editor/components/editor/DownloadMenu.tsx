import { type FC, useState } from 'react';

import { MdKeyboardArrowDown } from 'react-icons/md';

import { BaseDropdown, BaseDropdownItem, Button, cn } from '@universe-forma/ui-pes';

import { EXPORT_FORMATS, type ExportFormat } from '../../model/constants';

interface DownloadMenuProps {
  onSelectFormat: (format: ExportFormat) => void;
}

/**
 * Header "Download" button + format menu (MP4 / MOV / WebM / GIF).
 * Choosing a format starts the export flow (Screen 4).
 */
export const DownloadMenu: FC<DownloadMenuProps> = ({ onSelectFormat }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <BaseDropdown
      open={isOpen}
      onOpenChange={setIsOpen}
      align='end'
      sideOffset={8}
      className='z-[10006] w-40 space-y-0.5 rounded-4 bg-bg-white-bg p-2 [box-shadow:0_6px_12px_-2px_rgba(0,0,0,0.08),0_8px_40px_0_rgba(0,0,0,0.08)]'
      trigger={
        <Button
          variant='filled'
          color='secondary'
          size='md'
          rightIcon={<MdKeyboardArrowDown className={cn('size-5 transition-transform', isOpen && 'rotate-180')} />}
        >
          Download
        </Button>
      }
    >
      {EXPORT_FORMATS.map((format) => (
        <BaseDropdownItem
          key={format}
          onClick={() => onSelectFormat(format)}
          className='flex min-h-11 cursor-pointer items-center rounded-3 px-3 text-body font-medium text-text-primary transition-colors hover:bg-action-hover'
        >
          {format}
        </BaseDropdownItem>
      ))}
    </BaseDropdown>
  );
};
