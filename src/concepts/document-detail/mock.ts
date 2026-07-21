import type { DocumentDetailProps } from './types';

const mock: DocumentDetailProps = {
  status: 'ready',
  documentTitle: 'Q3-Report.pdf',
  metadata: [
    { label: 'Name', value: 'Q3-Report.pdf' },
    { label: 'Size', value: '2.4 MB' },
    { label: 'Pages', value: '18' },
    { label: 'Modified', value: 'Jul 18, 2026' },
  ],
  downloadLabel: 'Download',
  deleteLabel: 'Delete',
  onDownload: () => console.log('download'),
  onDelete: () => console.log('delete'),
  emptyHeading: "This document isn't here anymore",
  emptySubheading: 'It may have been deleted or moved. Go back to your documents to find it.',
  errorHeading: "Couldn't load this document",
  errorSubheading: 'Something went wrong while fetching its details. Try again.',
  onRetry: () => console.log('retry'),
  retryLabel: 'Try again',
};

export default mock;
