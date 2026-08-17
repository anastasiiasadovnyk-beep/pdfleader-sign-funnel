/** Contracts for the thank-you (download) page of the sign funnel. */

export type SignatureType = 'simple' | 'digital';
export type ToastVariant = 'signed' | 'audit';

export type StepperCopy = {
  /** Ordered step labels; steps before `activeStep` render as completed. */
  steps: string[];
  /** 1-based index of the active step. */
  activeStep: number;
};

export type PaymentRow = { label: string; value: string };

export type PaymentDetailsCopy = {
  title: string;
  rows: PaymentRow[];
  dashboardCaption: string;
  dashboardCtaLabel: string;
};

export type ContactItem = {
  icon: 'phone' | 'email' | 'address';
  text: string;
};

export type ContactCopy = {
  heading: string;
  items: ContactItem[];
};

/** File names handed to the browser when a download CTA is pressed. */
export type ToastCopy = {
  signedTitle: string;
  auditTitle: string;
  body: string;
};

export type FooterColumn = { heading: string; items: string[] };

export type FooterCopy = {
  columns: FooterColumn[];
  languageLabel: string;
  terms: string;
  links: string[];
};

export type ThankYouScreenProps = {
  /** Digital adds the "Download audit trail" secondary CTA. */
  signatureType: SignatureType;
  stepper: StepperCopy;
  heading: string;
  subheading: string;
  downloadFileLabel: string;
  downloadAuditLabel: string;
  paymentDetails: PaymentDetailsCopy;
  contact: ContactCopy;
  toast: ToastCopy;
  footer: FooterCopy;
  /** Scenario seed — render the page with a download toast already visible. */
  initialToast?: ToastVariant | null;
  onNext?: () => void;
  onBack?: () => void;
  /** Back to a clean editor — injected by the sandbox route. */
  onRestart?: () => void;
};
