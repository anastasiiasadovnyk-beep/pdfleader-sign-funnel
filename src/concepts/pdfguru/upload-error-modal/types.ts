export type UploadErrorVariant = 'unsupportedType' | 'corrupted' | 'tooLarge';

export type UploadErrorDetail = {
  label: string;
  value: string;
};

export type UploadErrorModalProps = {
  variant: UploadErrorVariant;
  title: string;
  description: string;
  fileName?: string;
  details?: UploadErrorDetail[];
  retryLabel: string;
  cancelLabel: string;
  onRetry: () => void;
  onCancel: () => void;
  onClose: () => void;
};
