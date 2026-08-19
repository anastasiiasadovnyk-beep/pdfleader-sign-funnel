import type { DashboardScreenProps } from './types';

/**
 * Six documents as in the product reference: the freshly signed W-9 on top, a
 * second signed form further down, and four ordinary uploads. The two signed
 * rows carry different signature kinds so both indicators and both row menus
 * are visible on one dashboard.
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
  // The six files from the product reference, newest first. Two are signed and
  // carry different signature kinds, so both indicators and both row menus are
  // visible at once; the other four are ordinary uploads with no indicator.
  files: [
    {
      id: 'f1',
      name: 'W-9',
      kind: 'pdf',
      lastEditDate: '19.08.2026',
      lastEditRelative: '10 min ago',
      size: '122 KB',
      signature: 'digital',
    },
    {
      id: 'f2',
      name: 'dataset2026',
      kind: 'xlsx',
      lastEditDate: '18.08.2026',
      lastEditRelative: '1 day ago',
      size: '122 KB',
    },
    {
      id: 'f3',
      name: 'Invoice #1864',
      kind: 'docx',
      lastEditDate: '10.07.2026',
      lastEditRelative: '40 days ago',
      size: '122 KB',
    },
    {
      id: 'f4',
      name: 'W-4',
      kind: 'pdf',
      lastEditDate: '05.07.2026',
      lastEditRelative: '45 days ago',
      size: '122 KB',
      signature: 'simple',
    },
    {
      id: 'f5',
      name: 'Invoice #1234567890',
      kind: 'jpg',
      lastEditDate: '01.06.2026',
      lastEditRelative: '79 days ago',
      size: '122 KB',
    },
    {
      id: 'f6',
      name: 'image49',
      kind: 'png',
      lastEditDate: '20.05.2026',
      lastEditRelative: '91 days ago',
      size: '122 KB',
    },
  ],
  menu: {
    auditLabel: 'Download audit trail',
    duplicateLabel: 'Duplicate',
    deleteLabel: 'Delete',
  },
  toast: {
    signedTitle: 'The signed document has been downloaded',
    auditTitle: 'The audit trail has been downloaded',
    body: 'You can find your signed document in the Dashboard',
  },
  rowActionLabels: { edit: 'Edit', download: 'Download', more: 'More actions' },
};

export default mock;
