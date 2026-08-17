import { Button, cn } from '@universe-forma/ui-pes';

import type { MobileChromeCopy } from '../types';
import { Icon } from './Icon';

type TopBarProps = {
  copy: MobileChromeCopy;
  onMenu: () => void;
  onDone: () => void;
};

/** 390px top bar: Menu / Undo / Redo / Done. */
export function MobileTopBar({ copy, onMenu, onDone }: TopBarProps) {
  return (
    <div
      data-ff="m-top-bar"
      className="border-action-stroke bg-bg-white-bg flex items-center gap-2 border-b px-4 py-2 md:hidden"
    >
      <button
        type="button"
        onClick={onMenu}
        className="flex cursor-pointer flex-col items-center gap-1 rounded-2 px-3 py-1 transition-all hover:bg-action-8 disabled:cursor-not-allowed"
      >
        <Icon name="menu" className="text-text-primary" />
        <span className="text-caption-emph text-text-primary">{copy.menuLabel}</span>
      </button>
      <button
        type="button"
        disabled
        className="flex cursor-pointer flex-col items-center gap-1 rounded-2 px-3 py-1 transition-all disabled:cursor-not-allowed"
      >
        <Icon name="undo" className="text-text-primary" />
        <span className="text-caption-emph text-text-primary">{copy.undoLabel}</span>
      </button>
      <button
        type="button"
        disabled
        className="flex cursor-pointer flex-col items-center gap-1 rounded-2 px-3 py-1 transition-all disabled:cursor-not-allowed"
      >
        <Icon name="redo" className="text-text-primary" />
        <span className="text-caption-emph text-text-primary">{copy.redoLabel}</span>
      </button>
      <div className="flex-1" />
      <Button size="ms" variant="filled" color="primary" onClick={onDone}>
        {copy.doneLabel}
      </Button>
    </div>
  );
}

type BottomNavProps = {
  copy: MobileChromeCopy;
  signActive: boolean;
  onSign: () => void;
};

/** 390px bottom tool nav: Select / Text / Sign / More. */
export function MobileBottomNav({ copy, signActive, onSign }: BottomNavProps) {
  const items: { id: string; label: string; glyph: string; onClick?: () => void; active?: boolean }[] = [
    { id: 'select', label: copy.selectLabel, glyph: 'arrow_selector_tool' },
    { id: 'text', label: copy.textLabel, glyph: 'text_fields' },
    { id: 'sign', label: copy.signLabel, glyph: 'signature', onClick: onSign, active: signActive },
    { id: 'more', label: copy.moreLabel, glyph: 'more_horiz' },
  ];
  return (
    <nav
      data-ff="m-bottom-nav"
      className="border-os-divider bg-bg-white-bg flex items-stretch justify-around border-t px-2 py-1 md:hidden"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={item.onClick}
          disabled={!item.onClick}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 rounded-2 px-2 py-1',
            'cursor-pointer transition-all disabled:cursor-not-allowed',
            item.active && 'bg-primary-opacity-8',
            item.onClick && 'hover:bg-action-8',
          )}
        >
          <Icon name={item.glyph} className="text-text-primary" />
          <span className="text-caption-emph text-text-primary">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
