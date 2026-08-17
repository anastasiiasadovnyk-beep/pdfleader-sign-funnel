import type { ThankYouScreenProps } from './types';

const mock: ThankYouScreenProps = {
  signatureType: 'simple',
  stepper: {
    steps: ['Choose a plan', 'Add payment details', 'Download'],
    activeStep: 3,
  },
  heading: 'Got your payment!',
  subheading: 'Thank you for choosing PDFLeader! Below is your order summary.',
  downloadFileLabel: 'Download signed file',
  downloadAuditLabel: 'Download audit trail',
  paymentDetails: {
    title: 'Payment details',
    rows: [
      { label: 'Plan:', value: '7-Day Access' },
      { label: 'Account ID:', value: '94694612' },
      { label: 'Amount:', value: '$0.95' },
      { label: 'Date:', value: '20/02/2025' },
      { label: 'Order ID:', value: '52055' },
    ],
    dashboardCaption: 'Your document also available in the dashboard:',
    dashboardCtaLabel: 'Go to My Documents',
  },
  contact: {
    heading: 'For any questions, please contact us:',
    items: [
      { icon: 'phone', text: '+1 (866) 716-6045' },
      { icon: 'email', text: 'support@pdfleader.com' },
      { icon: 'address', text: '26 Stavrou Street, Strovolos 2034, Nicosia, Cyprus' },
    ],
  },
  toast: {
    signedTitle: 'The signed document has been downloaded',
    auditTitle: 'The audit trail has been downloaded',
    body: 'You can find your signed document in the Dashboard',
  },
  footer: {
    columns: [
      { heading: 'Tools', items: ['Convert', 'Convert from PDF', 'Convert to PDF', 'Organize', 'Optimize', 'Edit'] },
      { heading: 'Forms', items: ['W9', 'DS11', 'DS82', 'CMS1500', 'I9', 'I864'] },
      { heading: 'For developers', items: ['API'] },
      { heading: 'Our Team', items: ['About Us', 'Contact Us'] },
    ],
    languageLabel: 'English',
    terms:
      '© PDFLeader. All rights reserved 2025. Company: Lopital Limited, 2025. Address: Ezekia Papaioannou, 14, Flat/Office 101, 1075, Nicosia, Cyprus.',
    links: [
      'Subscription Terms',
      'Terms & Conditions',
      'Money-Back Policy',
      'Privacy Policy',
      'Cookie Policy',
    ],
  },
  initialToast: null,
  onBack: () => {},
};

export default mock;

/** Digital signature order — two download CTAs. */
export const digital: ThankYouScreenProps = {
  ...mock,
  signatureType: 'digital',
};

/** Simple order right after "Download signed file" — success toast visible. */
export const signedDownloaded: ThankYouScreenProps = {
  ...mock,
  initialToast: 'signed',
};

/** Digital order after "Download signed file". */
export const digitalDownloaded: ThankYouScreenProps = {
  ...digital,
  initialToast: 'signed',
};

/** Digital order after "Download audit trail". */
export const auditDownloaded: ThankYouScreenProps = {
  ...digital,
  initialToast: 'audit',
};
