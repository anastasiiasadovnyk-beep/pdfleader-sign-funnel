import { useRef, useState } from 'react';

import type {
  EditorScreenProps,
  ExportFormatId,
  InkColor,
  InkThickness,
  PlacedSignature,
  SignStep,
  SignatureMethod,
  SignaturePosition,
  SignatureType,
} from '../types';

/** A brand-new signature draft: no ink on any tab. */
const BLANK_INK: Record<SignatureMethod, boolean> = { draw: false, type: false, upload: false };

/** Bottom-left of a signature's resting spot on the W-9's signature line. */
const SIGNATURE_HOME = { leftPct: 30, topPct: 76.74 };

/**
 * Each further signature lands offset from the one before it, so adding a
 * second does not drop it exactly behind the first — which would read as
 * "nothing happened". Wraps so the cascade cannot walk off the page.
 */
const CASCADE_PCT = 5;
const CASCADE_WRAP = 4;

/**
 * View-model for the sign funnel's editor page, shaped to mirror the product
 * store: `state` becomes slice state, `actions` map 1:1 to dispatches and
 * `derived` to selectors on integration (see INTEGRATION.md).
 *
 * The document carries a LIST of signatures, each selected, moved, edited and
 * deleted on its own. `step` says only which dialog is open — never whether
 * anything is signed — so dismissing a dialog cannot discard placed work.
 */
export function useSignFunnelModel(props: EditorScreenProps) {
  const [signatureType, setSignatureType] = useState<SignatureType>(
    props.initialSignatureType ?? 'simple',
  );
  const [method, setMethod] = useState<SignatureMethod>(props.initialMethod ?? 'draw');
  const [filled, setFilled] = useState<Record<SignatureMethod, boolean>>({
    draw: (props.initialMethod ?? 'draw') === 'draw' ? Boolean(props.initialFilled) : false,
    type: props.initialMethod === 'type' ? Boolean(props.initialFilled) : false,
    upload: props.initialMethod === 'upload' ? Boolean(props.initialFilled) : false,
  });
  /** Draft ink for the create/edit dialog; each placed signature carries its own. */
  const [inkColor, setInkColor] = useState<InkColor>('black');
  const [thickness, setThickness] = useState<InkThickness>('thin');
  const [verified, setVerified] = useState<boolean>(
    props.initialVerified ?? props.initialSignatureType === 'digital',
  );
  const [pagesOpen, setPagesOpen] = useState(false);

  /** Resting spot for the nth signature, on whichever page carries the field. */
  const homeFor = (index: number): SignaturePosition => ({
    pageId: props.document.signFieldPage,
    leftPct: SIGNATURE_HOME.leftPct + (index % CASCADE_WRAP) * CASCADE_PCT,
    topPct: SIGNATURE_HOME.topPct - (index % CASCADE_WRAP) * CASCADE_PCT,
  });

  // `initialStep: 'signed'` is a scenario seed meaning "one signature already
  // placed and selected"; from then on `step` only tracks the dialogs.
  const seeded = props.initialStep === 'signed';
  const [signatures, setSignatures] = useState<PlacedSignature[]>(() =>
    seeded
      ? [
          {
            id: 'sig-1',
            method: props.initialMethod ?? 'draw',
            inkColor: 'black',
            thickness: 'thin',
            ...homeFor(0),
          },
        ]
      : [],
  );
  const nextId = useRef(2);
  const [selectedId, setSelectedId] = useState<string | null>(seeded ? 'sig-1' : null);
  /** Which signature the dialog is editing; null means it is creating a new one. */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [step, setStep] = useState<SignStep>(
    seeded ? 'editing' : (props.initialStep ?? 'editing'),
  );
  /** Done opens the export panel; its checkout CTA leaves for the thank-you page. */
  const [exportOpen, setExportOpen] = useState(props.initialExportOpen ?? false);
  const [exportFormat, setExportFormat] = useState<ExportFormatId>('pdf');

  const selected = signatures.find((signature) => signature.id === selectedId) ?? null;
  const patchSelected = (patch: Partial<PlacedSignature>) =>
    setSignatures((list) =>
      list.map((signature) => (signature.id === selectedId ? { ...signature, ...patch } : signature)),
    );

  const actions = {
    /**
     * Sign tool tile / purple field marker — always starts a NEW signature, so
     * clicking either again adds another instead of reopening one.
     */
    startSignFlow: () => {
      setEditingId(null);
      setMethod('draw');
      setFilled(BLANK_INK);
      // The sealing type is settled once something is signed, so further
      // signatures skip the chooser. Deleting them all restores the full flow.
      setStep(signatures.length > 0 ? 'createSign' : 'selectType');
    },
    cancelSelectType: () => {
      setStep('editing');
      setEditingId(null);
    },
    chooseType: (type: SignatureType) => setSignatureType(type),
    continueToCreate: () => setStep('createSign'),
    backToSelectType: () => setStep('selectType'),
    closeCreate: () => {
      setStep('editing');
      setEditingId(null);
    },
    setMethod: (m: SignatureMethod) => setMethod(m),
    /** Draft ink and thickness, used by the create/edit dialog. */
    setInkColor,
    setThickness,
    /** Any pointer interaction with the draw canvas leaves ink. */
    draw: () => setFilled((f) => ({ ...f, draw: true })),
    typeName: (value: string) => setFilled((f) => ({ ...f, type: value.length > 0 })),
    upload: () => setFilled((f) => ({ ...f, upload: true })),
    clear: () => setFilled((f) => ({ ...f, [method]: false })),
    placeSignature: () => {
      setStep('editing');
      if (editingId) {
        // Editing an existing one: only the artwork changes, so it keeps the
        // spot the user dragged it to.
        setSignatures((list) =>
          list.map((signature) =>
            signature.id === editingId ? { ...signature, method, inkColor, thickness } : signature,
          ),
        );
        setSelectedId(editingId);
        setEditingId(null);
        return;
      }
      const id = `sig-${nextId.current++}`;
      setSignatures((list) => [
        ...list,
        { id, method, inkColor, thickness, ...homeFor(list.length) },
      ]);
      setSelectedId(id);
      // The first signature settles the document's sealing state.
      if (signatures.length === 0) setVerified(signatureType === 'digital');
    },
    /** Pencil in the contextual toolbar — reopen the dialog on the selected one. */
    editSignature: () => {
      if (!selected) return;
      setEditingId(selected.id);
      setMethod(selected.method);
      setInkColor(selected.inkColor);
      setThickness(selected.thickness);
      // That signature IS the draft being edited, whatever a previous
      // new-signature attempt left behind.
      setFilled((f) => ({ ...f, [selected.method]: true }));
      setStep('createSign');
    },
    selectSignature: (id: string) => setSelectedId(id),
    deselectSignature: () => setSelectedId(null),
    /** Drag of one signature; the canvas clamps it into a page on release. */
    moveSignature: (id: string, position: SignaturePosition) =>
      setSignatures((list) =>
        list.map((signature) => (signature.id === id ? { ...signature, ...position } : signature)),
      ),
    /** The toolbar's pickers act on the selected signature, not the document. */
    setSelectedInkColor: (color: InkColor) => patchSelected({ inkColor: color }),
    setSelectedThickness: (value: InkThickness) => patchSelected({ thickness: value }),
    toggleVerified: (checked: boolean) => setVerified(checked),
    /** Trash in the toolbar — removes the selected signature only. */
    deleteSignature: () => {
      setSignatures((list) => list.filter((signature) => signature.id !== selectedId));
      setSelectedId(null);
    },
    openExport: () => setExportOpen(true),
    closeExport: () => setExportOpen(false),
    setExportFormat: (format: ExportFormatId) => setExportFormat(format),
    openPages: () => setPagesOpen(true),
    closePages: () => setPagesOpen(false),
  };

  const derived = {
    /** The Sign tool tile is tinted while a sign dialog is open (per the modal frames). */
    signToolActive: step === 'selectType' || step === 'createSign',
    canPlace: filled[method],
    canUndoInk: filled[method],
    signaturePlaced: signatures.length > 0,
    /**
     * Selection chrome and the contextual toolbar travel together — and both
     * belong to the editor, not to a dialog. Gating on the step keeps the
     * toolbar from sitting behind an open dialog, and stops clicks inside that
     * dialog from reaching the click-off-to-deselect listener.
     */
    signatureActive: selected !== null && step === 'editing',
    selectedSignature: selected,
    /**
     * Sign ID caption is a Digital Signature artefact, and reads as part of the
     * selection chrome — it shows under the selected signature only.
     */
    showSignId: verified && selected !== null,
  };

  return {
    state: {
      step,
      signatureType,
      method,
      filled,
      inkColor,
      thickness,
      verified,
      pagesOpen,
      signatures,
      selectedId,
      editingId,
      exportOpen,
      exportFormat,
    },
    actions,
    derived,
  };
}

export type SignFunnelModel = ReturnType<typeof useSignFunnelModel>;
