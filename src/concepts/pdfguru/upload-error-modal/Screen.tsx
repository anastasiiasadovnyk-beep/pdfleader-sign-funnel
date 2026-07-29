import { Button, IconButton } from '@universe-forma/ui-pes';
import type { UploadErrorModalProps } from './types';
import { CloseIcon } from './components/icons';
import ErrorBadge from './components/ErrorBadge';
import ErrorDetails from './components/ErrorDetails';

export default function Screen(props: UploadErrorModalProps) {
  const { variant, title, description, fileName, details, retryLabel, cancelLabel, onRetry, onCancel, onClose } = props;

  return (
    <div className="flex min-h-screen items-end justify-center bg-os-backdrop-overlay md:items-center md:p-4">
      <div
        data-ff="container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-error-title"
        className="flex w-full max-w-[480px] flex-col overflow-hidden rounded-t-6 bg-bg-white-bg shadow-xl md:rounded-6"
      >
        <div className="mx-auto mt-3 h-1 w-16 shrink-0 rounded-full bg-material-grey-300 md:hidden" />

        <header className="flex items-start justify-end px-4 pt-4 md:px-6 md:pt-6">
          <IconButton
            variant="text"
            color="action"
            size="md"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon className="h-6 w-6" />
          </IconButton>
        </header>

        <div className="flex flex-col items-center gap-4 px-4 pb-2 text-center md:px-6">
          <ErrorBadge variant={variant} />
          <div className="flex flex-col gap-2">
            <h1
              id="upload-error-title"
              data-ff="title"
              className="text-mobile-title-4 text-text-primary md:text-desktop-title-4"
            >
              {title}
            </h1>
            <p data-ff="description" className="text-body text-text-secondary">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-4 py-4 md:px-6 md:py-5">
          <ErrorDetails fileName={fileName} details={details} />
        </div>

        <footer data-ff="footer" className="flex flex-col gap-2 px-4 pb-4 md:flex-row-reverse md:px-6 md:pb-6">
          <Button
            data-ff="cta-retry"
            color="secondary"
            size="md"
            onClick={onRetry}
            className="w-full md:flex-1"
          >
            {retryLabel}
          </Button>
          <Button
            data-ff="cta-cancel"
            variant="text"
            color="action"
            size="md"
            onClick={onCancel}
            className="w-full md:flex-1"
          >
            {cancelLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
}
