/** Contracts for the dashboard ("My Documents") page of the sign funnel. */

/** How a document was signed — drives both its indicator and its action menu. */
export type SignatureKind = 'simple' | 'digital';

export type FileKind = 'pdf' | 'xlsx' | 'docx' | 'jpg' | 'png';

export type DocumentRow = {
  id: string;
  name: string;
  kind: FileKind;
  /** Long form, as the reference shows it: "August 11, 2026". */
  lastEditDate: string;
  size: string;
  /** Only signed documents carry an indicator; unsigned rows leave this unset. */
  signature?: SignatureKind;
};

/** Which download the toast is confirming. */
export type ToastVariant = 'signed' | 'audit';

/** File names handed to the browser when a row download is pressed. */
export type ToastCopy = {
  signedTitle: string;
  auditTitle: string;
  body: string;
};

export type DashboardNavCopy = {
  /** Left-hand nav labels; the first two carry a chevron in the reference. */
  items: string[];
  accountLabel: string;
};

export type DashboardColumnsCopy = {
  file: string;
  lastEdit: string;
  size: string;
  actions: string;
};

/**
 * Row menu copy. `auditLabel` is the digital-only entry — a simple signature
 * has no audit trail to download, so its menu is the shorter list.
 */
export type RowMenuCopy = {
  auditLabel: string;
  duplicateLabel: string;
  deleteLabel: string;
};

export type DashboardScreenProps = {
  nav: DashboardNavCopy;
  heading: string;
  uploadLabel: string;
  columns: DashboardColumnsCopy;
  files: DocumentRow[];
  menu: RowMenuCopy;
  toast: ToastCopy;
  /** Scenario seed — render the page with a toast already visible. */
  initialToast?: ToastVariant | null;
  /** Accessible names for the per-row icon actions. */
  rowActionLabels: { edit: string; download: string; more: string };
  /** Injected by the sandbox route (and by the product router on integration). */
  onNext?: () => void;
  onBack?: () => void;
  /** Back to a clean editor — injected by the sandbox route. */
  onRestart?: () => void;
};
