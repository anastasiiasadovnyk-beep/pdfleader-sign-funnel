import type { EditorScreenProps } from './types';

import w9Page1 from '../../assets/w9-page1.png';
import w9Page2 from '../../assets/w9-page2.png';
import w9Page3 from '../../assets/w9-page3.png';
import w9Page4 from '../../assets/w9-page4.png';
import w9Page5 from '../../assets/w9-page5.png';
import w9Page6 from '../../assets/w9-page6.png';
import thumbP1 from '../../assets/thumb-p1.png';
import thumbP2 from '../../assets/thumb-p2.png';
import thumbP3 from '../../assets/thumb-p3.png';
import thumbP4 from '../../assets/thumb-p4.png';
import thumbP5 from '../../assets/thumb-p5.png';
import thumbP6 from '../../assets/thumb-p6.png';
import sigJohnSmith from '../../assets/sig-john-smith.png';
import sigDrawn from '../../assets/sig-drawn.png';
import sigTyped from '../../assets/sig-typed.png';
import sigUploaded from '../../assets/sig-uploaded.png';

const mock: EditorScreenProps = {
  chrome: {
    zoomValue: '100%',
    searchLabel: 'Search',
    doneLabel: 'Done',
    tools: [
      { id: 'undo', label: 'Undo' },
      { id: 'redo', label: 'Redo' },
      { id: 'select', label: 'Select' },
      { id: 'add-text', label: 'Add Text' },
      { id: 'edit-text', label: 'Edit Text' },
      { id: 'sign', label: 'Sign' },
      { id: 'pencil', label: 'Pencil' },
      { id: 'highlight', label: 'Highlight' },
      { id: 'eraser', label: 'Eraser' },
      { id: 'annotate', label: 'Annotate' },
      { id: 'image', label: 'Image' },
      { id: 'ellipse', label: 'Ellipse', hasChevron: true },
      { id: 'ai-auto-fill', label: 'AI auto-fill' },
    ],
    managePagesLabel: 'Manage pages',
    // All six pages of Form W-9 (Rev. 3-2024), one thumbnail each.
    pageThumbs: [
      { id: 1, imageUrl: thumbP1 },
      { id: 2, imageUrl: thumbP2 },
      { id: 3, imageUrl: thumbP3 },
      { id: 4, imageUrl: thumbP4 },
      { id: 5, imageUrl: thumbP5 },
      { id: 6, imageUrl: thumbP6 },
    ],
    currentPage: 1,
  },
  mobileChrome: {
    menuLabel: 'Menu',
    undoLabel: 'Undo',
    redoLabel: 'Redo',
    doneLabel: 'Done',
    selectLabel: 'Select',
    textLabel: 'Text',
    signLabel: 'Sign',
    moreLabel: 'More',
  },
  document: {
    pages: [
      { id: 1, imageUrl: w9Page1 },
      { id: 2, imageUrl: w9Page2 },
      { id: 3, imageUrl: w9Page3 },
      { id: 4, imageUrl: w9Page4 },
      { id: 5, imageUrl: w9Page5 },
      { id: 6, imageUrl: w9Page6 },
    ],
    signFieldPage: 1,
    signFieldLabel: 'sign',
    formValues: {
      name: 'John Snow',
      address: '123 Banana Bay, Apt 47',
      cityStateZip: 'Borderland, BB 285769',
      ssn: '777-77-7777',
    },
  },
  selectTypeModal: {
    title: 'Sign the document',
    subtitle: 'Choose sealing type',
    simple: {
      title: 'Simple Signature',
      description: ['Signature isn’t verifiable'],
      badgeLabel: 'Unverified',
      // PLACEHOLDER — tooltip copy is not in the referenced Figma frame.
      bestUsedForTooltip:
        'Everyday paperwork where identity does not need to be proven — internal sign-offs, simple forms and quick approvals.',
    },
    digital: {
      title: 'Digital Signature',
      description: [
        'Signature is verifiable with a digital seal.',
        'You get a Certificate of Completion with an audit trail.',
      ],
      badgeLabel: 'Verified',
      // PLACEHOLDER — tooltip copy is not in the referenced Figma frame.
      bestUsedForTooltip:
        'Agreements that may be challenged — the seal proves who signed, and the Certificate of Completion carries the audit trail.',
    },
    previewImageUrl: sigJohnSmith,
    bestUsedForLabel: 'Best used for',
    cancelLabel: 'Cancel',
    continueLabel: 'Continue',
  },
  createSignModal: {
    // The Figma frames keep the DS Dialog placeholders ("Title" / "Subheader" /
    // "Tertiary" / "Secondary" / "Primary") — real copy proposed for the prototype.
    title: 'Create your signature',
    subtitle: 'It will be placed on the document',
    drawTabLabel: 'Draw',
    typeTabLabel: 'Type',
    uploadTabLabel: 'Upload',
    colorLabel: 'Color',
    thicknessLabel: 'Thickness',
    typeFontLabel: 'Type',
    fontName: 'N Emerald',
    drawHint: 'Draw above the line',
    typeHint: 'Type above the line',
    uploadHeadline: 'Drag & drop a sign file here',
    uploadOrLabel: 'or',
    uploadButtonLabel: 'Upload your sign',
    uploadCaption: 'Size: **up to 5 MB.**\nSupported format: **JPG**, **PNG**, or **SVG**',
    clearLabel: 'Clear',
    cancelLabel: 'Cancel',
    saveLabel: 'Save signature',
    signLabel: 'Accept and Sign',
  },
  signedToolbar: {
    colorLabel: 'Color',
    thicknessLabel: 'Thickness',
    verifiedLabel: 'Verified',
    // PLACEHOLDER — tooltip copy is not in the referenced Figma frame.
    verifiedTooltip:
      'Sealed with a digital certificate: the signature can be verified by anyone, and a Certificate of Completion with an audit trail is issued.',
    signIdValue: 'Sign ID: B529...4567',
  },
  exportPanel: {
    title: 'Export your file',
    fileNameLabel: 'File name',
    // Requested verbatim; the document in the prototype is a W-9, so this may
    // be meant as "W-9_signed" — one line to change if so.
    fileName: 'B-9_signed',
    formatLabel: 'Format',
    formats: [
      { id: 'pdf', chip: 'PDF', name: 'PDF', extension: '.pdf' },
      { id: 'docx', chip: 'DOC', name: 'DOCX', extension: '.docx' },
      { id: 'pptx', chip: 'PPTX', name: 'PPTX', extension: '.pptx' },
      { id: 'xlsx', chip: 'XLS', name: 'XLSX', extension: '.xlsx' },
      { id: 'jpg', chip: 'JPG', name: 'JPG', extension: '.jpg' },
      { id: 'png', chip: 'PNG', name: 'PNG', extension: '.png' },
    ],
    proceedLabel: 'Proceed to checkout',
    printLabel: 'Print',
    editFileNameLabel: 'Rename file',
    closeLabel: 'Close',
  },
  signatureAssets: {
    drawn: sigDrawn,
    typed: sigTyped,
    uploaded: sigUploaded,
  },
  onNext: () => {},
};

export default mock;

/** Select-type modal open, Simple Signature selected. */
export const selectType: EditorScreenProps = {
  ...mock,
  initialStep: 'selectType',
  initialSignatureType: 'simple',
};

/** Select-type modal open, Digital Signature selected. */
export const selectTypeDigital: EditorScreenProps = {
  ...mock,
  initialStep: 'selectType',
  initialSignatureType: 'digital',
};

/** Signature creation modal — Draw tab, empty canvas. */
export const sigDraw: EditorScreenProps = {
  ...mock,
  initialStep: 'createSign',
  initialMethod: 'draw',
};

/** Signature creation modal — Draw tab with drawn ink. */
export const sigDrawFilled: EditorScreenProps = {
  ...sigDraw,
  initialFilled: true,
};

/** Signature creation modal — Type tab, empty. */
export const sigType: EditorScreenProps = {
  ...mock,
  initialStep: 'createSign',
  initialMethod: 'type',
};

/** Signature creation modal — Type tab with a typed signature. */
export const sigTypeFilled: EditorScreenProps = {
  ...sigType,
  initialFilled: true,
};

/** Signature creation modal — Upload tab, dropzone. */
export const sigUpload: EditorScreenProps = {
  ...mock,
  initialStep: 'createSign',
  initialMethod: 'upload',
};

/** Signature creation modal — Upload tab with an uploaded signature. */
export const sigUploadFilled: EditorScreenProps = {
  ...sigUpload,
  initialFilled: true,
};

/** Signature placed on the page — Simple flow, Verified toggle off. */
export const signedUnverified: EditorScreenProps = {
  ...mock,
  initialStep: 'signed',
  initialSignatureType: 'simple',
  initialMethod: 'draw',
  initialVerified: false,
};

/** Export panel open over the signed document (Done was pressed). */
export const exportOpen: EditorScreenProps = {
  ...mock,
  initialStep: 'signed',
  initialSignatureType: 'digital',
  initialMethod: 'draw',
  initialVerified: true,
  initialExportOpen: true,
};

/** Signature placed on the page — Digital flow, Verified toggle on + Sign ID. */
export const signedVerified: EditorScreenProps = {
  ...mock,
  initialStep: 'signed',
  initialSignatureType: 'digital',
  initialMethod: 'draw',
  initialVerified: true,
};
