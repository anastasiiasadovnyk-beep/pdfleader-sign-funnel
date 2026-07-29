import type { UploadErrorModalProps } from './types';

const mock: UploadErrorModalProps = {
  variant: 'unsupportedType',
  title: 'That file type is not supported',
  description: 'PDF Guru works with PDF files only. Convert your file to PDF or pick another document to continue.',
  fileName: 'quarterly-report.docx',
  details: [
    { label: 'Detected format', value: 'DOCX' },
    { label: 'Supported formats', value: 'PDF' },
  ],
  retryLabel: 'Choose another file',
  cancelLabel: 'Cancel',
  onRetry: () => console.log('retry upload'),
  onCancel: () => console.log('cancel'),
  onClose: () => console.log('close'),
};

export default mock;

export const corrupted: UploadErrorModalProps = {
  ...mock,
  variant: 'corrupted',
  title: 'We can’t read this file',
  description: 'The PDF appears to be damaged or partially uploaded. Try uploading it again, or pick a different file.',
  fileName: 'contract-signed.pdf',
  details: [
    { label: 'Reason', value: 'Unable to parse PDF structure' },
  ],
};

export const tooLarge: UploadErrorModalProps = {
  ...mock,
  variant: 'tooLarge',
  title: 'This file is over the size limit',
  description: 'Your PDF is larger than the 100 MB upload limit. Compress it first, or pick a smaller file.',
  fileName: 'scanned-archive-2024.pdf',
  details: [
    { label: 'File size', value: '232 MB' },
    { label: 'Upload limit', value: '100 MB' },
  ],
};
