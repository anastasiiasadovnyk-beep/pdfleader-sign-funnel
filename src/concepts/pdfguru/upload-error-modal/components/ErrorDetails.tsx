import type { UploadErrorDetail } from '../types';

type ErrorDetailsProps = {
  fileName?: string;
  details?: UploadErrorDetail[];
};

export default function ErrorDetails({ fileName, details }: ErrorDetailsProps) {
  if (!fileName && (!details || details.length === 0)) return null;

  return (
    <div data-ff="details" className="flex flex-col gap-2 rounded-4 bg-bg-light-grey px-4 py-3">
      {fileName && (
        <div className="flex items-center gap-2">
          <span className="text-caption text-text-secondary">File</span>
          <span data-ff="file-name" className="min-w-0 flex-1 truncate text-body-2-emph text-text-primary">
            {fileName}
          </span>
        </div>
      )}
      {details?.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-3">
          <span className="text-caption text-text-secondary">{row.label}</span>
          <span className="text-body-2-emph text-text-primary">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
