import { Badge } from '@universe-forma/ui-pes';
import type { ProcessingFile } from '../types';

type FileRowProps = { file: ProcessingFile; className?: string };

/** Format badge + file name and its size · duration meta. */
export default function FileRow({ file, className }: FileRowProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <Badge
        data-ff="format-badge"
        type="badge"
        style="filled-tonal"
        color="primary"
        size="dense"
        className="text-caption-emph uppercase"
      >
        {file.format}
      </Badge>
      <div className="min-w-0">
        <p data-ff="file-name" className="truncate text-body-emph text-text-primary">
          {file.name}
        </p>
        <p data-ff="file-meta" className="text-body-2 text-text-secondary">
          {file.sizeLabel} · {file.durationLabel}
        </p>
      </div>
    </div>
  );
}
