import type { DashboardScreenProps } from './types';

/**
 * Six documents as in the reference: the freshly signed one on top, a second
 * signed one further down, and four unsigned files. The two signed rows carry
 * different signature kinds so both indicators and both row menus are visible
 * on one dashboard.
 */
const mock: DashboardScreenProps = {
  nav: {
    items: ['Tools', 'Forms', 'Contact Us'],
    accountLabel: 'My account',
  },
  heading: 'My Documents',
  uploadLabel: 'Upload File',
  columns: {
    file: 'File',
    lastEdit: 'Last Edit',
    size: 'Size',
    actions: 'Actions',
  },
  // Two signed copies of the same form. The digital one is the newer of the
  // two, so the green indicator always sits above the grey one.
  files: [
    {
      id: 'f1',
      name: 'W-9_signed',
      kind: 'pdf',
      lastEditDate: 'August 11, 2026',
      size: '122.7 KB',
      signature: 'digital',
    },
    {
      id: 'f2',
      name: 'W-9_signed',
      kind: 'pdf',
      lastEditDate: 'June 03, 2026',
      size: '109.9 KB',
      signature: 'simple',
    },
  ],
  menu: {
    auditLabel: 'Download audit trail',
    duplicateLabel: 'Duplicate',
    deleteLabel: 'Delete',
  },
  downloads: {
    signedFileName: 'W-9_signed.pdf',
    auditFileName: 'W-9_signed_audit-trail.pdf',
  },
  toast: {
    signedTitle: 'The signed document has been downloaded',
    auditTitle: 'The audit trail has been downloaded',
    body: 'You can find your signed document in the Dashboard',
  },
  rowActionLabels: { edit: 'Edit', download: 'Download', more: 'More actions' },
};

export default mock;
