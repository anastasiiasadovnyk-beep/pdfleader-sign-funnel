export type DocumentMetadataRow = {
  label: string;
  value: string;
};

export type DocumentDetailStatus = 'ready' | 'empty' | 'error';

export type DocumentDetailProps = {
  status: DocumentDetailStatus;
  documentTitle: string;
  metadata: DocumentMetadataRow[];
  onDownload: () => void;
  onDelete: () => void;
  downloadLabel: string;
  deleteLabel: string;
  emptyHeading: string;
  emptySubheading: string;
  errorHeading: string;
  errorSubheading: string;
  onRetry: () => void;
  retryLabel: string;
};
