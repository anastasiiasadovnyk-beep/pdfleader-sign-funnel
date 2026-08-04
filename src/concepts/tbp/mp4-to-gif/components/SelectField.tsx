import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ChevronDownIcon } from './icons';

/** Figma menu elevation ("base-shadow/top-2"): a soft two-layer drop shadow.
 * Applied inline because ui-pes exposes this only as a brand CSS var, not a
 * generated Tailwind `shadow-*` utility (so `shadow-modal-card` renders nothing). */
const MENU_SHADOW = '0 2px 6px 2px rgba(0,0,0,0.04), 0 8px 12px 0 rgba(0,0,0,0.08)';

export type SelectOption = {
  id: string;
  /** First line / primary label. */
  label: string;
  /** Optional second line (e.g. a ratio "16:9" or a size "~ 50KB"). */
  caption?: string;
  /** Optional leading glyph shown in the menu row. */
  icon?: ReactNode;
};

type SelectFieldProps = {
  /** Currently-selected option id. */
  value: string;
  options: SelectOption[];
  onSelect: (id: string) => void;
  /** Text shown in the closed trigger. */
  triggerLabel: string;
  /** Optional leading glyph in the closed trigger. */
  leftIcon?: ReactNode;
  ff?: string;
  disabled?: boolean;
};

/** Select / combobox field. DS GAP: ui-pes ships no Select — composed here from a
 * token-styled trigger `<button>` (filled-input look) + a popover `<ul role=listbox>`.
 * The menu is fixed-positioned from the trigger rect so it escapes the card's
 * `overflow-hidden`, flips above the trigger when space below is tight, and caps
 * its height to the viewport (scrolling only when the options don't fit). The
 * current option is highlighted with the primary state color (Figma "Menu"). */
export default function SelectField({
  value,
  options,
  onSelect,
  triggerLabel,
  leftIcon,
  ff,
  disabled,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const gap = 4;
      const margin = 16;
      const below = window.innerHeight - r.bottom - margin;
      const above = r.top - margin;
      const openUp = below < 220 && above > below;
      const maxHeight = Math.max(160, Math.min(320, openUp ? above : below));
      setMenuStyle(
        openUp
          ? { position: 'fixed', left: r.left, width: r.width, bottom: window.innerHeight - r.top + gap, maxHeight }
          : { position: 'fixed', left: r.left, width: r.width, top: r.bottom + gap, maxHeight },
      );
    };
    const onDocDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    place();
    document.addEventListener('pointerdown', onDocDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      document.removeEventListener('pointerdown', onDocDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        data-ff={ff}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center gap-2 rounded-1 bg-os-filled-input-bg px-input-lg-horizontal-padding text-left text-text-primary disabled:opacity-50"
      >
        {leftIcon ? <span className="flex shrink-0 items-center text-action-active">{leftIcon}</span> : null}
        <span className="min-w-0 flex-1 truncate text-body-2">{triggerLabel}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-action-active transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          style={{ ...menuStyle, boxShadow: MENU_SHADOW }}
          className="z-30 overflow-auto rounded-2 bg-bg-white-bg py-1"
        >
          {options.map((o) => {
            const selected = o.id === value;
            return (
              <li key={o.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(o.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${
                    selected ? 'bg-primary-opacity-8' : ''
                  }`}
                >
                  {o.icon ? (
                    <span className={`flex shrink-0 items-center ${selected ? 'text-primary' : 'text-action-active'}`}>
                      {o.icon}
                    </span>
                  ) : null}
                  <span className="flex min-w-0 flex-col">
                    <span className={`truncate text-body ${selected ? 'text-primary' : 'text-text-primary'}`}>
                      {o.label}
                    </span>
                    {o.caption ? (
                      <span className={`text-body-2 ${selected ? 'text-primary' : 'text-text-secondary'}`}>
                        {o.caption}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
