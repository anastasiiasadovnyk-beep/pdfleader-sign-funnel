import { useEffect, useState } from 'react';

import {
  Button,
  IconButton,
  TabsList,
  TabsRoot,
  TabsTrigger,
  cn,
} from '@universe-forma/ui-pes';

import { renderEmphasis } from '../lib/markup';
import type {
  CreateSignModalCopy,
  InkColor,
  InkThickness,
  SignatureAssets,
  SignatureMethod,
} from '../types';
import { Icon } from './Icon';

/** One source of ink per colour, so the swatch and the signature always agree. */
const INK_COLOR: Record<InkColor, string> = {
  black: 'bg-secondary-filled-800',
  blue: 'bg-primary',
  red: 'bg-material-red-700',
};

const STROKE_WIDTH: Record<InkThickness, number> = { thin: 2, regular: 3.5, bold: 5 };

type SwatchGroupProps = {
  label: string;
  value: InkColor;
  onChange: (color: InkColor) => void;
  ff?: string;
};

/** Color swatch toggle group (DS gap — composed per DS-GAPS.md workaround). */
export function ColorSwatches({ label, value, onChange, ff }: SwatchGroupProps) {
  return (
    <div className="flex items-center gap-2">
      <span data-ff={ff} className="text-caption text-text-primary">
        {label}
      </span>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {(Object.keys(INK_COLOR) as InkColor[]).map((color) => (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={value === color}
            aria-label={color}
            onClick={() => onChange(color)}
            className={cn(
              'flex h-9 w-9 cursor-pointer items-center justify-center rounded-3 transition-all hover:bg-action-8',
              value === color && 'bg-primary-opacity-8',
            )}
          >
            <span className={cn('h-4.5 w-4.5 rounded-full', INK_COLOR[color])} />
          </button>
        ))}
      </div>
    </div>
  );
}

type ThicknessGroupProps = {
  label: string;
  value: InkThickness;
  onChange: (thickness: InkThickness) => void;
  ff?: string;
};

export function ThicknessPicker({ label, value, onChange, ff }: ThicknessGroupProps) {
  return (
    <div className="flex items-center gap-2">
      <span data-ff={ff} className="text-caption text-text-primary">
        {label}
      </span>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {(Object.keys(STROKE_WIDTH) as InkThickness[]).map((thickness) => (
          <button
            key={thickness}
            type="button"
            role="radio"
            aria-checked={value === thickness}
            aria-label={thickness}
            onClick={() => onChange(thickness)}
            className={cn(
              'flex h-9 w-9 cursor-pointer items-center justify-center rounded-3 transition-all hover:bg-action-8',
              value === thickness && 'bg-primary-opacity-8',
            )}
          >
            <svg width="20" height="8" viewBox="0 0 20 8" fill="none" aria-hidden>
              <path
                d="M1 5.5C4 1.5 7 1.5 10 4C13 6.5 16 6.5 19 2.5"
                stroke="currentColor"
                strokeWidth={STROKE_WIDTH[thickness]}
                strokeLinecap="round"
                className="text-text-primary"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * ui-pes `TabsActiveAnimation` measures the active trigger in an effect, so its
 * indicator mounts at width/height 0 with `transition-all duration-400` already
 * live — the pill visibly grows in from nothing every time the dialog opens.
 * Hold the transition off until the first measurement has painted; switching
 * tabs after that still slides. Drop this if ui-pes skips its first transition.
 */
function useTabIndicatorReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Two frames: one paints the DS's measured position, the next re-arms the
    // transition — so only later tab switches animate.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setReady(true));
    });
    // rAF is paused while the tab is hidden; don't leave the transition off for
    // good if the dialog happens to mount there (nothing paints meanwhile).
    const fallback = setTimeout(() => setReady(true), 300);
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      clearTimeout(fallback);
    };
  }, []);
  return ready;
}

type CanvasActionsProps = {
  canUndo: boolean;
  clearLabel: string;
  onClear: () => void;
};

function CanvasActions({ canUndo, clearLabel, onClear }: CanvasActionsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-1">
        <IconButton variant="text" color="action" size="sm" disabled={!canUndo} aria-label="Undo">
          <Icon name="undo" size={20} />
        </IconButton>
        <IconButton variant="text" color="action" size="sm" disabled aria-label="Redo">
          <Icon name="redo" size={20} />
        </IconButton>
      </div>
      <Button
        data-ff="cs-clear"
        size="ms"
        variant="text"
        color="primary"
        leftIcon={<Icon name="delete" />}
        onClick={onClear}
      >
        {clearLabel}
      </Button>
    </div>
  );
}

type SignatureModalProps = {
  copy: CreateSignModalCopy;
  method: SignatureMethod;
  filled: boolean;
  inkColor: InkColor;
  thickness: InkThickness;
  assets: SignatureAssets;
  canPlace: boolean;
  onBack: () => void;
  onClose: () => void;
  onMethodChange: (method: SignatureMethod) => void;
  onInkColorChange: (color: InkColor) => void;
  onThicknessChange: (thickness: InkThickness) => void;
  onDraw: () => void;
  onType: (value: string) => void;
  onUpload: () => void;
  onClear: () => void;
  onPlace: () => void;
};

/** Signature creation dialog: Draw / Type / Upload (fullscreen on mobile — no mobile reference frame, adapted from desktop). */
export function SignatureModal(props: SignatureModalProps) {
  const { copy, method, filled, inkColor, thickness, assets } = props;
  const tabIndicatorReady = useTabIndicatorReady();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-common-black/30 max-md:hidden" aria-hidden />
      <div
        data-ff="cs-dialog"
        role="dialog"
        aria-modal
        aria-label={copy.title}
        className={cn(
          'bg-bg-white-bg relative flex flex-col',
          'max-md:h-full max-md:w-full',
          'md:w-[796px] md:rounded-6 md:shadow-[0_0_12px_-8px_rgba(0,0,0,0.08),0_20px_32px_0_rgba(0,0,0,0.16)]',
        )}
      >
        <div className="flex items-start gap-4 px-6 pb-4 pt-6">
          <IconButton
            variant="outlined"
            color="action"
            size="md"
            aria-label="Back"
            onClick={props.onBack}
          >
            <Icon name="chevron_left" />
          </IconButton>
          <div className="flex-1">
            <h2
              data-ff="cs-title"
              className="text-mobile-title-4 md:text-desktop-title-4 text-text-primary"
            >
              {copy.title}
            </h2>
            <p data-ff="cs-subtitle" className="text-body-2 text-text-secondary">
              {copy.subtitle}
            </p>
          </div>
          <IconButton variant="text" color="action" size="md" aria-label="Close" onClick={props.onClose}>
            <Icon name="close" />
          </IconButton>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-2">
          <TabsRoot
            value={method}
            onValueChange={(v) => props.onMethodChange(v as SignatureMethod)}
            transparent={false}
            color="grey"
            size="md"
            scrollable={false}
          >
            <TabsList
              data-ff="cs-tabs"
              className={cn('w-full', !tabIndicatorReady && '[&>div>div>div]:transition-none!')}
            >
              <TabsTrigger data-ff="cs-tab-draw" value="draw" className="flex-1">
                <span className="flex items-center justify-center gap-2">
                  <Icon name="stylus_note" size={16} filled={method === 'draw'} />
                  {copy.drawTabLabel}
                </span>
              </TabsTrigger>
              <TabsTrigger data-ff="cs-tab-type" value="type" className="flex-1">
                <span className="flex items-center justify-center gap-2">
                  <Icon name="text_fields" size={16} filled={method === 'type'} />
                  {copy.typeTabLabel}
                </span>
              </TabsTrigger>
              <TabsTrigger data-ff="cs-tab-upload" value="upload" className="flex-1">
                <span className="flex items-center justify-center gap-2">
                  <Icon name="upload" size={16} filled={method === 'upload'} />
                  {copy.uploadTabLabel}
                </span>
              </TabsTrigger>
            </TabsList>
          </TabsRoot>

          {method === 'upload' && !filled ? (
            <button
              type="button"
              data-ff="cs-dropzone"
              onClick={props.onUpload}
              className="border-primary relative flex h-[356px] flex-col items-center justify-center gap-3 rounded-4 border border-dashed"
            >
              <span data-ff="cs-upload-headline" className="text-body-emph text-text-primary">
                {copy.uploadHeadline}
              </span>
              <span className="text-body text-text-secondary">{copy.uploadOrLabel}</span>
              <Button
                data-ff="cs-upload-button"
                size="md"
                variant="filled-tonal"
                color="primary"
                leftIcon={<Icon name="upload" />}
                element="div"
              >
                {copy.uploadButtonLabel}
              </Button>
              <span
                data-ff="cs-upload-caption"
                className="text-caption mt-2 max-w-[320px] whitespace-pre-line text-center text-text-disabled"
              >
                {renderEmphasis(copy.uploadCaption)}
              </span>
            </button>
          ) : (
            <div
              data-ff="cs-canvas"
              className="border-os-divider flex h-[356px] flex-col rounded-5 border p-5"
            >
              <div className="flex items-center justify-between">
                <ColorSwatches
                  label={copy.colorLabel}
                  value={inkColor}
                  onChange={props.onInkColorChange}
                  ff="cs-color-label"
                />
                {method === 'draw' && (
                  <ThicknessPicker
                    label={copy.thicknessLabel}
                    value={thickness}
                    onChange={props.onThicknessChange}
                    ff="cs-thickness-label"
                  />
                )}
                {method === 'type' && (
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-text-primary">{copy.typeFontLabel}</span>
                    <button
                      type="button"
                      data-ff="cs-font-select"
                      className="border-os-divider flex h-10 w-50 items-center gap-2 rounded-3 border px-3"
                    >
                      <Icon name="font_download" size={18} className="text-action-active" />
                      <img
                        src={assets.type.black}
                        alt={copy.fontName}
                        className="h-4 w-auto flex-1 object-contain object-left"
                      />
                      <Icon name="keyboard_arrow_down" size={18} className="text-action-active" />
                    </button>
                  </div>
                )}
              </div>

              {method === 'upload' ? (
                <div className="border-primary my-4 flex flex-1 items-center justify-center rounded-4 border">
                  <img
                    src={assets.upload[inkColor]}
                    alt="Uploaded signature"
                    className="max-h-[170px] w-auto"
                  />
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={method === 'draw' ? copy.drawHint : copy.typeHint}
                  onClick={method === 'draw' ? props.onDraw : () => props.onType('N Emerald')}
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    (method === 'draw' ? props.onDraw() : props.onType('N Emerald'))
                  }
                  className="relative flex flex-1 cursor-crosshair flex-col justify-end"
                >
                  {filled && (
                    <img
                      src={assets[method][inkColor]}
                      alt="Signature"
                      className={cn(
                        'mx-auto w-auto',
                        method === 'draw' ? 'max-h-[110px]' : 'max-h-[84px]',
                      )}
                    />
                  )}
                  <div className="border-primary mx-6 border-t-2" />
                  <p
                    data-ff="cs-hint"
                    className="text-caption pt-2 text-center tracking-[0.02em] text-text-secondary"
                  >
                    {method === 'draw' ? copy.drawHint : copy.typeHint}
                  </p>
                </div>
              )}

              <CanvasActions
                canUndo={filled}
                clearLabel={copy.clearLabel}
                onClear={props.onClear}
              />
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex px-6 pb-6 pt-4',
            'max-md:border-os-divider max-md:border-t max-md:shadow-[0_-4px_12px_rgba(0,0,0,0.04)]',
            'md:items-center md:justify-end',
          )}
        >
          <Button
            data-ff="cs-sign"
            size="md"
            variant="filled"
            color="primary"
            className="max-md:w-full"
            disabled={!props.canPlace}
            onClick={props.onPlace}
          >
            {copy.signLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
