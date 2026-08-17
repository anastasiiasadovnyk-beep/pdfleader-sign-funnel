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
  files: [
    {
      id: 'f1',
      name: 'Invoice #1234567890',
      kind: 'pdf',
      lastEditDate: '05.06.2026',
      lastEditRelative: '1 hour ago',
      size: '122 KB',
      signature: 'digital',
    },
    {
      id: 'f2',
      name: 'Invoice #1234567890',
      kind: 'xlsx',
      lastEditDate: '05.06.2026',
      lastEditRelative: '1 hour ago',
      size: '122 KB',
    },
    {
      id: 'f3',
      name: 'Invoice #1234567890',
      kind: 'docx',
      lastEditDate: '05.06.2026',
      lastEditRelative: '1 hour ago',
      size: '122 KB',
    },
    {
      id: 'f4',
      name: 'Invoice #1234567890',
      kind: 'pdf',
      lastEditDate: '05.06.2026',
      lastEditRelative: '1 hour ago',
      size: '122 KB',
      signature: 'simple',
    },
    {
      id: 'f5',
      name: 'Invoice #1234567890',
      kind: 'jpg',
      lastEditDate: '05.06.2026',
      lastEditRelative: '1 hour ago',
      size: '122 KB',
    },
    {
      id: 'f6',
      name: 'Invoice #1234567890',
      kind: 'png',
      lastEditDate: '05.06.2026',
      lastEditRelative: '1 hour ago',
      size: '122 KB',
    },
  ],
  menu: {
    auditLabel: 'Download audit trail',
    duplicateLabel: 'Duplicate',
    deleteLabel: 'Delete',
  },
  downloads: {
    signedFileName: 'B-9_signed.pdf',
    auditFileName: 'B-9_signed_audit-trail.pdf',
  },
  toast: {
    signedTitle: 'The signed document has been downloaded',
    auditTitle: 'The audit trail has been downloaded',
    body: 'You can find your signed document in the Dashboard',
  },
  rowActionLabels: { edit: 'Edit', download: 'Download', more: 'More actions' },
};

export default mock;

/** Same dashboard reached after a simple signature — the top row flips kind. */
export const simple: DashboardScreenProps = {
  ...mock,
  files: mock.files.map((file, i) =>
    i === 0 ? { ...file, signature: 'simple' } : i === 3 ? { ...file, signature: 'digital' } : file,
  ),
};
