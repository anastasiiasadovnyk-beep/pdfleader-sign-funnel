import { useRef, type PointerEvent as ReactPointerEvent } from 'react';

import { cn } from '@universe-forma/ui-pes';

import type {
  DocumentCanvasProps,
  DocumentFormValues,
  InkColor,
  SignatureAssets,
  SignatureMethod,
  SignaturePosition,
} from '../types';
import { Icon } from './Icon';

type Props = {
  document: DocumentCanvasProps;
  signatureAssets: SignatureAssets;
  inkColor: InkColor;
  placed: boolean;
  placedMethod: SignatureMethod;
  showSignId: boolean;
  signIdValue: string;
  onSignField: () => void;
  /** Selection chrome (frame, handles, red outline) only shows while selected. */
  selected: boolean;
  onSelect: () => void;
  signaturePosition: SignaturePosition;
  onSignatureMove: (position: SignaturePosition) => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Typed-value slots, measured from the page-1 raster (712x920) and expressed as
 * percentages so they track the page at any width. `left` is the text's start,
 * `top` its vertical centre. Sizing is in `cqw`, so the type scales with the
 * page too — the page box is the container.
 */
const VALUE_SLOTS = {
  name: { left: 10.39, top: 15.76 },
  address: { left: 10.39, top: 36.96 },
  cityStateZip: { left: 10.39, top: 40.0 },
} as const;

/** Centres of the nine SSN boxes (3-2-4), same raster. */
const SSN_BOX_CENTRES = [69.66, 71.98, 74.3, 79.07, 81.39, 86.1, 88.48, 90.8, 93.12];
const SSN_TOP = 48.48;

/** The form's own typeface, not the UI's — plain and page-sized. */
const VALUE_TEXT =
  'text-text-primary pointer-events-none absolute -translate-y-1/2 whitespace-nowrap text-[1.7cqw] leading-none';

/** What the taxpayer typed, dropped into the form's boxes. */
function TypedValues({ values }: { values: DocumentFormValues }) {
  const ssnDigits = [...values.ssn.replace(/\D/g, '')].slice(0, SSN_BOX_CENTRES.length);
  const slot = (key: keyof typeof VALUE_SLOTS) => ({
    left: `${VALUE_SLOTS[key].left}%`,
    top: `${VALUE_SLOTS[key].top}%`,
  });
  return (
    <>
      <span className={VALUE_TEXT} style={slot('name')}>
        {values.name}
      </span>
      <span className={VALUE_TEXT} style={slot('address')}>
        {values.address}
      </span>
      <span className={VALUE_TEXT} style={slot('cityStateZip')}>
        {values.cityStateZip}
      </span>
      {ssnDigits.map((digit, index) => (
        <span
          key={`${index}-${digit}`}
          className={cn(VALUE_TEXT, '-translate-x-1/2')}
          style={{ left: `${SSN_BOX_CENTRES[index]}%`, top: `${SSN_TOP}%` }}
        >
          {digit}
        </span>
      ))}
    </>
  );
}

/**
 * What a drag needs to convert pointer travel into page percentages. The box
 * geometry is captured at grab time and never re-measured: crossing onto
 * another page remounts the image, which can measure zero-width for a frame,
 * and clamping against that would let the signature hang off the edge.
 */
type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  boxLeft: number;
  boxTop: number;
  boxWidth: number;
  boxHeight: number;
  startLeft: number;
  startTop: number;
  pageWidth: number;
  pageHeight: number;
};

/** Eight selection handles around the placed signature (editor-style). */
function Handles() {
  const spots = [
    'left-0 top-0',
    'left-1/2 top-0 -translate-x-1/2',
    'right-0 top-0',
    'left-0 top-1/2 -translate-y-1/2',
    'right-0 top-1/2 -translate-y-1/2',
    'left-0 bottom-0',
    'left-1/2 bottom-0 -translate-x-1/2',
    'right-0 bottom-0',
  ];
  return (
    <>
      {spots.map((pos) => (
        <span
          key={pos}
          className={cn(
            'border-primary bg-bg-white-bg absolute h-1.5 w-1.5 -translate-y-1/2 rounded-full border',
            'translate-x-[-3px] translate-y-[-3px]',
            pos,
          )}
        />
      ))}
    </>
  );
}

/**
 * W-9 page on the grey canvas. The purple "sign" field marker is a real
 * overlay (the raster underneath carries the same pixels — the overlay is the
 * interactive element the flow starts from).
 */
export function DocumentCanvas({
  document,
  signatureAssets,
  inkColor,
  placed,
  placedMethod,
  showSignId,
  signIdValue,
  onSignField,
  selected,
  onSelect,
  signaturePosition,
  onSignatureMove,
}: Props) {
  /** Every page box, so a drag can be handed to whichever one it ends over. */
  const pages = useRef(new Map<number, HTMLDivElement>());
  const drag = useRef<DragState | null>(null);

  /**
   * The page nearest a point — zero distance when the point is inside it. Used
   * on release: let go over the gutter and the signature joins the page it is
   * closest to, which is what makes it snap to that page's edge.
   */
  function nearestPage(x: number, y: number) {
    let best: { id: number; rect: DOMRect } | null = null;
    let bestDistance = Infinity;
    for (const [id, element] of pages.current) {
      const rect = element.getBoundingClientRect();
      const dx = Math.max(rect.left - x, 0, x - rect.right);
      const dy = Math.max(rect.top - y, 0, y - rect.bottom);
      const distance = dx * dx + dy * dy;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = { id, rect };
      }
    }
    return best;
  }

  /**
   * Drag is delta-based: measure the page and the box once on pointer-down,
   * then translate pointer travel into page percentages. Pointer capture keeps
   * the moves coming even when the cursor outruns the box.
   */
  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    onSelect();
    const page = pages.current.get(signaturePosition.pageId);
    if (!page) return;
    const pageRect = page.getBoundingClientRect();
    const boxRect = event.currentTarget.getBoundingClientRect();
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      boxLeft: boxRect.left,
      boxTop: boxRect.top,
      boxWidth: boxRect.width,
      boxHeight: boxRect.height,
      startLeft: signaturePosition.leftPct,
      startTop: signaturePosition.topPct,
      pageWidth: pageRect.width,
      pageHeight: pageRect.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) return;
    const dxPct = ((event.clientX - state.startX) / state.pageWidth) * 100;
    const dyPct = ((event.clientY - state.startY) / state.pageHeight) * 100;
    // Unclamped on purpose: the signature follows the pointer past the page
    // edges and onto its neighbours; `endDrag` decides where it lands.
    onSignatureMove({
      pageId: signaturePosition.pageId,
      leftPct: state.startLeft + dxPct,
      topPct: state.startTop + dyPct,
    });
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    // Where the box came to rest: its grab-time geometry moved by the pointer's
    // travel, which holds even while the image is between pages.
    const left = state.boxLeft + (event.clientX - state.startX);
    const top = state.boxTop + (event.clientY - state.startY);
    const target = nearestPage(left + state.boxWidth / 2, top + state.boxHeight / 2);
    if (!target) return;
    const { rect } = target;
    const widthPct = (state.boxWidth / rect.width) * 100;
    const heightPct = (state.boxHeight / rect.height) * 100;
    onSignatureMove({
      pageId: target.id,
      leftPct: clamp(((left - rect.left) / rect.width) * 100, 0, 100 - widthPct),
      // topPct is the box's bottom edge, so it travels from one box-height down
      // to the page foot — that is what snaps it flush to the top or bottom.
      topPct: clamp(((top + state.boxHeight - rect.top) / rect.height) * 100, heightPct, 100),
    });
  }

  return (
    <main className="bg-bg-light-grey flex flex-1 items-start justify-center overflow-auto px-5 pt-5">
      {/*
       * Every page stacked, so the canvas scrolls through the whole document.
       * The trailing gap lives on this column rather than as padding on the
       * scroller, and `items-start` above keeps the column sized to its
       * content — stretched to the viewport, its bottom padding would sit
       * inside the box and the last page would rest against the bottom edge.
       */}
      <div className="flex w-full max-w-[640px] shrink-0 flex-col gap-5 pb-6">
        {document.pages.map((page, index) => {
          const isSignPage = page.id === document.signFieldPage;
          return (
            <div
              key={page.id}
              ref={(element) => {
                if (element) pages.current.set(page.id, element);
                else pages.current.delete(page.id);
              }}
              // The contract measures the first page. `@container` is what lets
              // the typed values size off the page instead of the viewport.
              data-ff={index === 0 ? 'document-page' : undefined}
              className="bg-bg-white-bg @container relative h-fit w-full shadow-[0_18.5px_46.3px_rgba(91,91,91,0.16)]"
            >
              <img
                src={page.imageUrl}
                alt={`Document page ${page.id}`}
                className="block h-auto w-full"
              />
              {isSignPage && (
                <>
                  <TypedValues values={document.formValues} />
                  {/*
                   * Sign-field hit area: the whole signature field, not just the
                   * chip — the purple chip plus the pale field to its right (it
                   * stops short of the Date field). Both are baked into the page
                   * raster, so the box is laid over them in percentages measured
                   * from it (page 1, 712x920: chip x 141-208, pale field to
                   * x 448, y 670-706) and stays aligned at any render width. The
                   * button itself is transparent — the purple comes from the chip
                   * span, which keeps its own 68px slice of the box. Re-measure
                   * if the page image is swapped.
                   */}
                  <button
                    type="button"
                    data-ff="sign-field-marker"
                    aria-label="Sign here"
                    onClick={onSignField}
                    disabled={placed}
                    className={cn(
                      'group absolute left-[19.8%] top-[72.83%] flex h-[4.02%] w-[43.26%] items-stretch',
                      // The flow's entry point, so the whole field reads as clickable.
                      'cursor-pointer transition-colors hover:bg-primary-opacity-16 disabled:cursor-not-allowed',
                    )}
                  >
                    <span className="text-body-2 text-common-white lowercase flex w-[22.08%] items-center justify-center bg-[#4437da] leading-none transition-opacity group-hover:opacity-90">
                      {document.signFieldLabel}
                    </span>
                  </button>
                </>
              )}
              {/*
               * The signature lives on whichever page it was dropped on, not
               * only the signing page — so it renders here rather than inside
               * the `isSignPage` block above.
               */}
              {placed && page.id === signaturePosition.pageId && (
                <div
                  data-ff="placed-signature"
                  data-signature-ui="selection"
                  role="button"
                  tabIndex={0}
                  aria-label="Placed signature — drag to move"
                  onPointerDown={startDrag}
                  onPointerMove={onDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  // Images are natively draggable, and that native drag fires
                  // pointercancel — which would kill the gesture the moment
                  // you grab the signature itself rather than its frame.
                  onDragStart={(event) => event.preventDefault()}
                  // touch-none so a drag on mobile moves the signature instead
                  // of scrolling the page. z-10 keeps it above the neighbouring
                  // pages while it is dragged across them.
                  className="absolute z-10 -translate-y-full cursor-grab touch-none select-none active:cursor-grabbing"
                  style={{
                    left: `${signaturePosition.leftPct}%`,
                    top: `${signaturePosition.topPct}%`,
                  }}
                >
                  <div
                    className={cn('relative p-3', selected && 'border-primary-opacity-40 border')}
                  >
                    <img
                      src={signatureAssets[placedMethod][inkColor]}
                      alt="Your signature"
                      draggable={false}
                      className={cn(
                        'block h-8 w-auto',
                        selected && 'border-error-state-main-50 border',
                      )}
                    />
                    {selected && <Handles />}
                  </div>
                  {showSignId && (
                    <span
                      data-ff="sign-id"
                      className="text-caption absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap text-text-secondary"
                    >
                      <Icon name="verified_user" size={16} className="text-action-active" />
                      {signIdValue}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
