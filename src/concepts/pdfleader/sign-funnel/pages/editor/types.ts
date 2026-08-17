/** Contracts for the editor page of the sign funnel — every region owns its slice. */

export type SignatureMethod = 'draw' | 'type' | 'upload';
export type SignatureType = 'simple' | 'digital';
export type SignStep = 'editing' | 'selectType' | 'createSign' | 'signed';
export type InkColor = 'black' | 'blue' | 'red';
export type InkThickness = 'thin' | 'regular' | 'bold';

export type ToolId =
  | 'undo'
  | 'redo'
  | 'select'
  | 'add-text'
  | 'edit-text'
  | 'sign'
  | 'pencil'
  | 'highlight'
  | 'eraser'
  | 'annotate'
  | 'image'
  | 'ellipse'
  | 'ai-auto-fill';

export type ToolItem = {
  id: ToolId;
  label: string;
  /** Ellipse carries a 16px chevron for its shape-variants dropdown. */
  hasChevron?: boolean;
};

export type PageThumb = {
  id: number;
  imageUrl: string;
};

/** Header + toolbar + pages sidebar (desktop chrome). */
export type EditorChromeProps = {
  zoomValue: string;
  searchLabel: string;
  doneLabel: string;
  /** main zone: undo/redo/select; general zone: the rest; ai-auto-fill is right-aligned. */
  tools: ToolItem[];
  managePagesLabel: string;
  pageThumbs: PageThumb[];
  currentPage: number;
};

/** Compact chrome for the 390px layout. */
export type MobileChromeCopy = {
  menuLabel: string;
  undoLabel: string;
  redoLabel: string;
  doneLabel: string;
  selectLabel: string;
  textLabel: string;
  signLabel: string;
  moreLabel: string;
};

export type DocumentPage = {
  id: number;
  imageUrl: string;
};

/**
 * What the taxpayer typed into the form's own fields. Overlaid on the page
 * raster at positions measured from it — the raster is a blank form.
 * The Date box already carries its value in the raster, so it isn't here.
 */
export type DocumentFormValues = {
  /** Line 1 — name of entity/individual. */
  name: string;
  /** Line 5 — street address. */
  address: string;
  /** Line 6 — city, state and ZIP. */
  cityStateZip: string;
  /** Formatting is ignored; digits are spread one per box across the 3-2-4 grid. */
  ssn: string;
};

export type DocumentCanvasProps = {
  /** Every page of the document, in order — the canvas scrolls through them. */
  pages: DocumentPage[];
  /** Page id carrying the signature field and the typed values. */
  signFieldPage: number;
  /** Copy inside the purple field marker on the Sign Here row. */
  signFieldLabel: string;
  formValues: DocumentFormValues;
};

/**
 * Where the placed signature sits, as percentages of the page box so it holds
 * position at any render width. Anchored bottom-left: `topPct` is the box's
 * bottom edge, which is what keeps it sitting on the signature line.
 */
export type SignaturePosition = {
  leftPct: number;
  topPct: number;
};

export type SignTypeCardCopy = {
  title: string;
  /** Paragraphs, stacked with a small gap. */
  description: string[];
  badgeLabel: string;
  /** Shown from the "Best used for" info icon. */
  bestUsedForTooltip: string;
};

export type SelectTypeModalCopy = {
  title: string;
  subtitle: string;
  simple: SignTypeCardCopy;
  digital: SignTypeCardCopy;
  /** Script "John Smith" preview shown in both cards. */
  previewImageUrl: string;
  bestUsedForLabel: string;
  cancelLabel: string;
  continueLabel: string;
};

export type CreateSignModalCopy = {
  title: string;
  subtitle: string;
  drawTabLabel: string;
  typeTabLabel: string;
  uploadTabLabel: string;
  colorLabel: string;
  thicknessLabel: string;
  /** Label of the font select on the Type tab. */
  typeFontLabel: string;
  /** Value previewed inside the font select. */
  fontName: string;
  drawHint: string;
  typeHint: string;
  uploadHeadline: string;
  uploadOrLabel: string;
  uploadButtonLabel: string;
  /** `**bold**` segments are emphasised when rendered. */
  uploadCaption: string;
  clearLabel: string;
  signLabel: string;
};

export type ExportFormatId = 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'jpg' | 'png';

export type ExportFormatOption = {
  id: ExportFormatId;
  /** Chip text, e.g. "PDF" — the reference abbreviates DOCX to "DOC". */
  chip: string;
  name: string;
  extension: string;
};

/** Right-hand "Export your file" panel shown after Done. */
export type ExportPanelCopy = {
  title: string;
  fileNameLabel: string;
  /** Editable in the panel; seeds the field. */
  fileName: string;
  formatLabel: string;
  formats: ExportFormatOption[];
  proceedLabel: string;
  printLabel: string;
  editFileNameLabel: string;
  closeLabel: string;
};

export type SignedToolbarCopy = {
  colorLabel: string;
  thicknessLabel: string;
  verifiedLabel: string;
  /** Explains the digital seal, from the info icon beside the Verified toggle. */
  verifiedTooltip: string;
  /** e.g. "Sign ID: B529...4567" — shown under the placed signature when verified. */
  signIdValue: string;
};

/** Signature renders per creation method (prototype assets; real app renders user ink). */
/**
 * Signature artwork per method and per ink. The real product renders the ink
 * live (canvas strokes / a font / the user's upload); the prototype ships one
 * asset per combination so the colour switcher shows real artwork.
 */
export type SignatureAssets = Record<SignatureMethod, Record<InkColor, string>>;

export type EditorScreenProps = {
  chrome: EditorChromeProps;
  mobileChrome: MobileChromeCopy;
  document: DocumentCanvasProps;
  selectTypeModal: SelectTypeModalCopy;
  createSignModal: CreateSignModalCopy;
  signedToolbar: SignedToolbarCopy;
  exportPanel: ExportPanelCopy;
  signatureAssets: SignatureAssets;
  /** Scenario seeds — the view-model starts from these. */
  initialStep?: SignStep;
  initialSignatureType?: SignatureType;
  initialMethod?: SignatureMethod;
  /** Whether the active creation tab already holds a signature. */
  initialFilled?: boolean;
  initialVerified?: boolean;
  /** Scenario seed — render with the export panel already open. */
  initialExportOpen?: boolean;
  /** Injected by the sandbox route (and by the product router on integration). */
  onNext?: () => void;
  onBack?: () => void;
};
