import { useState } from 'react';

import type {
  EditorScreenProps,
  ExportFormatId,
  InkColor,
  InkThickness,
  SignStep,
  SignatureMethod,
  SignaturePosition,
  SignatureType,
} from '../types';

/** Bottom-left of the signature's resting spot — the W-9's signature line. */
const SIGNATURE_HOME: SignaturePosition = { leftPct: 30, topPct: 76.74 };

/**
 * View-model for the sign funnel's editor page, shaped to mirror the product
 * store: `state` becomes slice state, `actions` map 1:1 to dispatches and
 * `derived` to selectors on integration (see INTEGRATION.md).
 */
export function useSignFunnelModel(props: EditorScreenProps) {
  const [step, setStep] = useState<SignStep>(props.initialStep ?? 'editing');
  const [signatureType, setSignatureType] = useState<SignatureType>(
    props.initialSignatureType ?? 'simple',
  );
  const [method, setMethod] = useState<SignatureMethod>(props.initialMethod ?? 'draw');
  const [filled, setFilled] = useState<Record<SignatureMethod, boolean>>({
    draw: (props.initialMethod ?? 'draw') === 'draw' ? Boolean(props.initialFilled) : false,
    type: props.initialMethod === 'type' ? Boolean(props.initialFilled) : false,
    upload: props.initialMethod === 'upload' ? Boolean(props.initialFilled) : false,
  });
  const [inkColor, setInkColor] = useState<InkColor>('black');
  const [thickness, setThickness] = useState<InkThickness>('thin');
  const [verified, setVerified] = useState<boolean>(
    props.initialVerified ?? (props.initialSignatureType === 'digital'),
  );
  const [pagesOpen, setPagesOpen] = useState(false);
  /** The method the placed signature was created with. */
  const [placedMethod, setPlacedMethod] = useState<SignatureMethod>(
    props.initialMethod ?? 'draw',
  );
  const [signaturePosition, setSignaturePosition] = useState<SignaturePosition>(SIGNATURE_HOME);
  /** A placed signature starts selected; clicking off the page clears it. */
  const [signatureSelected, setSignatureSelected] = useState(true);
  /** Done opens the export panel; its checkout CTA leaves for the thank-you page. */
  const [exportOpen, setExportOpen] = useState(props.initialExportOpen ?? false);
  const [exportFormat, setExportFormat] = useState<ExportFormatId>('pdf');

  const actions = {
    /** Sign tool tile / purple field marker. */
    startSignFlow: () => setStep('selectType'),
    cancelSelectType: () => setStep('editing'),
    chooseType: (type: SignatureType) => setSignatureType(type),
    continueToCreate: () => setStep('createSign'),
    backToSelectType: () => setStep('selectType'),
    closeCreate: () => setStep('editing'),
    setMethod: (m: SignatureMethod) => setMethod(m),
    setInkColor,
    setThickness,
    /** Any pointer interaction with the draw canvas leaves ink. */
    draw: () => setFilled((f) => ({ ...f, draw: true })),
    typeName: (value: string) => setFilled((f) => ({ ...f, type: value.length > 0 })),
    upload: () => setFilled((f) => ({ ...f, upload: true })),
    clear: () => setFilled((f) => ({ ...f, [method]: false })),
    placeSignature: () => {
      setPlacedMethod(method);
      setVerified(signatureType === 'digital');
      setSignaturePosition(SIGNATURE_HOME);
      setSignatureSelected(true);
      setStep('signed');
    },
    selectSignature: () => setSignatureSelected(true),
    deselectSignature: () => setSignatureSelected(false),
    /** Drag of the placed signature; the canvas clamps it to the page. */
    moveSignature: (position: SignaturePosition) => setSignaturePosition(position),
    toggleVerified: (checked: boolean) => setVerified(checked),
    deleteSignature: () => setStep('editing'),
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
    signaturePlaced: step === 'signed',
    /** Selection chrome and the contextual toolbar travel together. */
    signatureActive: step === 'signed' && signatureSelected,
    /** Sign ID caption is a Digital Signature artefact. */
    showSignId: step === 'signed' && verified,
    placedMethod,
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
      signaturePosition,
      signatureSelected,
      exportOpen,
      exportFormat,
    },
    actions,
    derived,
  };
}

export type SignFunnelModel = ReturnType<typeof useSignFunnelModel>;
