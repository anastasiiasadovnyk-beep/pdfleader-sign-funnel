import { type FC } from 'react';

import 'material-symbols/rounded.css';

import { cn } from '@universe-forma/ui-pes';

import { TOOL_TABS } from '../../model/editorData';
import { THIN_SCROLLBAR } from './scrollbar';

interface ToolRailProps {
  activeTabId: string;
  onSelect: (id: string) => void;
  /** 'vertical' = desktop left rail; 'horizontal' = mobile bottom bar. */
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

/** Material Symbols glyph: `size`px square, weight 300, outlined (FILL 0) or filled (FILL 1). */
const symbolStyle = (filled: boolean, size: number) => ({
  fontSize: size,
  fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 300, 'GRAD' 0, 'opsz' ${size}`
});

/** Icon + label tool tabs (Media, Ratio, Text, …). Active tab tinted + filled. */
export const ToolRail: FC<ToolRailProps> = ({ activeTabId, onSelect, orientation = 'vertical', className }) => {
  const horizontal = orientation === 'horizontal';
  return (
    <nav
      className={cn(
        'flex shrink-0 gap-1 bg-bg-white-bg',
        horizontal
          ? 'w-full items-center overflow-x-auto border-t border-os-divider px-2 py-1'
          : `h-full w-[84px] flex-col items-center overflow-y-auto border-r border-os-divider p-2 ${THIN_SCROLLBAR}`,
        className
      )}
    >
      {TOOL_TABS.map(({ id, label, iconName }) => {
        const isActive = id === activeTabId;
        return (
          <button
            key={id}
            type='button'
            onClick={() => onSelect(id)}
            aria-current={isActive}
            className={cn(
              'flex shrink-0 flex-col items-center justify-center gap-1 rounded-4 transition-colors',
              horizontal ? 'h-14 w-16' : 'size-[68px]',
              isActive ? 'bg-secondary-opacity-8 text-secondary' : 'text-text-primary hover:bg-action-hover'
            )}
          >
            <span
              aria-hidden='true'
              className='material-symbols-rounded leading-none'
              style={symbolStyle(isActive, horizontal ? 24 : 28)}
            >
              {iconName}
            </span>
            <span className='text-caption-xs font-light'>{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
