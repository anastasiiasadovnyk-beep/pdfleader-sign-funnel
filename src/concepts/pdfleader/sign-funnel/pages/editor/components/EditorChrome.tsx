import { Button, IconButton, cn } from '@universe-forma/ui-pes';

import type { EditorChromeProps, ToolId, ToolItem } from '../types';
import { Icon } from './Icon';
import { Logo } from './Logo';

const TOOL_GLYPHS: Record<ToolId, string> = {
  undo: 'undo',
  redo: 'redo',
  select: 'arrow_selector_tool',
  'add-text': 'title',
  'edit-text': 'edit_square',
  sign: 'signature',
  pencil: 'stylus',
  highlight: 'ink_highlighter',
  eraser: 'ink_eraser',
  annotate: 'add_comment',
  image: 'image',
  ellipse: 'circle',
  'ai-auto-fill': 'smart_button',
};

type ToolTileProps = {
  tool: ToolItem;
  active?: boolean;
  onClick?: () => void;
  ff?: string;
};

function ToolTile({ tool, active, onClick, ff }: ToolTileProps) {
  const accent = tool.id === 'ai-auto-fill';
  return (
    <button
      type="button"
      data-ff={ff}
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'flex h-13 flex-col items-center justify-center gap-1 rounded-2 px-4',
        // Toolbar is a DS gap: mirror Button's base states + action hover token.
        'cursor-pointer transition-all disabled:cursor-not-allowed',
        active ? 'bg-primary-opacity-8' : 'bg-bg-white-bg',
        onClick && 'hover:bg-action-8',
      )}
    >
      <span className="flex items-center gap-1">
        {/* Reference keeps every resting tool icon dark; only AI auto-fill is accented. */}
        <Icon
          name={TOOL_GLYPHS[tool.id]}
          className={accent ? 'text-primary' : 'text-text-primary'}
        />
        {tool.hasChevron && (
          <Icon name="keyboard_arrow_down" size={16} className="text-text-primary" />
        )}
      </span>
      {/* Design: Montserrat Bold 12/16 — nearest token is caption-emph (13/700). */}
      <span className="text-caption-emph whitespace-nowrap text-text-primary">{tool.label}</span>
    </button>
  );
}

type EditorHeaderProps = {
  chrome: EditorChromeProps;
  signToolActive: boolean;
  onSignTool: () => void;
  onDone: () => void;
};

/** Desktop editor header: top row (logo / zoom / search / Done) + tools row. */
export function EditorHeader({ chrome, signToolActive, onSignTool, onDone }: EditorHeaderProps) {
  const mainTools = chrome.tools.filter((t) => ['undo', 'redo', 'select'].includes(t.id));
  const generalTools = chrome.tools.filter(
    (t) => !['undo', 'redo', 'select', 'ai-auto-fill'].includes(t.id),
  );
  const extraTools = chrome.tools.filter((t) => t.id === 'ai-auto-fill');

  return (
    <header
      data-ff="editor-header"
      className="border-action-stroke bg-bg-white-bg relative z-10 border-b px-6 shadow-[0_4px_8px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-6">
          <Logo />
          <div className="flex h-13 items-center gap-1">
            <IconButton variant="text" color="action" size="sm" disabled aria-label="Zoom out">
              <Icon name="remove" className="text-action-active" />
            </IconButton>
            <div className="border-os-divider bg-bg-white-bg flex h-10 w-25 items-center justify-center gap-2 rounded-4 border px-3 py-2">
              <span data-ff="zoom-value" className="text-body-2 text-text-secondary">
                {chrome.zoomValue}
              </span>
              <Icon name="unfold_more" size={18} className="text-action-active" />
            </div>
            <IconButton variant="text" color="action" size="sm" disabled aria-label="Zoom in">
              <Icon name="add" className="text-action-active" />
            </IconButton>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled
            className="bg-bg-white-bg flex h-13 flex-col items-center justify-center gap-1 rounded-2 px-4"
          >
            <Icon name="search" className="text-action-active" />
            <span className="text-caption-emph text-text-primary">{chrome.searchLabel}</span>
          </button>
          <Button
            data-ff="done-button"
            size="md"
            variant="filled"
            color="primary"
            leftIcon={<Icon name="check" />}
            onClick={onDone}
          >
            {chrome.doneLabel}
          </Button>
        </div>
      </div>
      <div className="flex items-center py-2">
        <div className="flex flex-1 justify-end" />
        <div className="flex items-center gap-10">
          <div className="flex items-center">
            {mainTools.map((tool) => (
              <ToolTile key={tool.id} tool={tool} />
            ))}
          </div>
          <div className="flex items-center">
            {generalTools.map((tool) => (
              <ToolTile
                key={tool.id}
                tool={tool}
                active={tool.id === 'sign' && signToolActive}
                onClick={tool.id === 'sign' ? onSignTool : undefined}
                ff={tool.id === 'sign' ? 'tool-sign' : undefined}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-1 justify-end">
          {extraTools.map((tool) => (
            <ToolTile key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </header>
  );
}

type PagesSidebarProps = {
  chrome: EditorChromeProps;
  /** 'seal' (green, verified/entry) | 'pending' (purple, unverified) | null */
  pageBadge: 'seal' | 'pending' | null;
};

/**
 * Desktop "Manage pages" sidebar; also reused inside the mobile drawer.
 * The design insets the button ~13 from the edges of the 220-wide panel, so
 * `px-3` lets the DS `ms` button keep its own padding instead of being squeezed.
 * The panel scrolls on its own (a 6-page document is taller than the viewport)
 * and the button sticks to the top, so the pages travel under it.
 */
export function PagesSidebar({ chrome, pageBadge }: PagesSidebarProps) {
  return (
    <aside className="border-os-divider flex h-full w-55 shrink-0 flex-col items-center overflow-y-auto border-r px-3 pb-6">
      {/* Opaque in the panel's own tone so scrolled thumbnails don't show through. */}
      <div className="bg-bg-light-grey sticky top-0 z-10 w-full py-4">
        <Button
          data-ff="manage-pages"
          size="ms"
          variant="outlined"
          color="action"
          className="w-full whitespace-nowrap"
          leftIcon={<Icon name="file_copy" />}
        >
          {chrome.managePagesLabel}
        </Button>
      </div>
      <div className="flex w-30 shrink-0 flex-col gap-4">
        {chrome.pageThumbs.map((page) => {
          const current = page.id === chrome.currentPage;
          return (
            <div key={page.id} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'relative w-30 overflow-hidden shadow-[0_0_5px_rgba(73,136,252,0.16)]',
                  current && 'border-primary rounded-[2px] border',
                )}
              >
                <img
                  src={page.imageUrl}
                  alt={`Page ${page.id}`}
                  className="block h-auto w-full"
                />
                {current && pageBadge && (
                  <span
                    className={cn(
                      'absolute right-2 top-2 flex items-center justify-center rounded-2 p-0.5 backdrop-blur-xl',
                      pageBadge === 'seal' ? 'bg-material-green-600' : 'bg-secondary-opacity-50',
                    )}
                  >
                    <Icon name="signature" size={16} filled className="text-common-white" />
                  </span>
                )}
              </div>
              <span
                data-ff={current ? 'page-chip-current' : undefined}
                className={cn(
                  'text-caption-emph rounded-1 px-2',
                  current
                    ? 'bg-primary text-primary-contrast-text'
                    : 'bg-bg-white-bg text-text-secondary',
                )}
              >
                {page.id}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
