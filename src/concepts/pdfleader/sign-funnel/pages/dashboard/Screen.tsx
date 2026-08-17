import { useEffect, useRef, useState } from 'react';

import { Button } from '@universe-forma/ui-pes';

import { downloadPdf } from '../../lib/downloadFile';
import { forgetSignatureType, recallSignatureType } from '../../lib/signatureChoice';
import type { DashboardScreenProps, ToastVariant } from './types';
import { DashHeader } from './components/DashHeader';
import { DownloadToast } from './components/DownloadToast';
import { FileRow } from './components/FileRow';
import { Icon } from './components/Icon';

/** Same 5 s as the thank-you page's toast. */
const TOAST_MS = 5000;

/**
 * "My Documents" — one dashboard for both signature types. Signed rows carry an
 * indicator (green = digital, grey = simple) and their overflow menu differs:
 * only a digital signature offers "Download audit trail".
 *
 * The document the user just signed is the top row, so its indicator follows
 * the choice made in the editor; the other signed row takes the opposite kind
 * so both indicators and both menus stay visible on the page.
 */
export default function Screen(props: DashboardScreenProps) {
  const [signedWith] = useState(recallSignatureType);
  // Row downloads confirm themselves with the thank-you page's green toast.
  const [toast, setToast] = useState<ToastVariant | null>(props.initialToast ?? null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const showToast = (variant: ToastVariant) => {
    setToast(variant);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  };
  const dismissToast = () => {
    window.clearTimeout(timer.current);
    setToast(null);
  };
  const files = signedWith
    ? props.files.map((file, index) => {
        if (index === 0) return { ...file, signature: signedWith };
        if (file.signature) {
          return { ...file, signature: signedWith === 'digital' ? 'simple' : 'digital' } as const;
        }
        return file;
      })
    : props.files;

  return (
    <div className="bg-bg-white-bg relative flex min-h-screen flex-col">
      <DashHeader
        nav={props.nav}
        onHome={() => {
          // Restarting clears the sealing choice so the editor opens unsigned.
          forgetSignatureType();
          props.onRestart?.();
        }}
      />
      <main className="flex w-full flex-col gap-8 px-28 py-12 max-md:gap-6 max-md:px-4 max-md:py-8">
        <div className="flex items-center justify-between gap-4">
          <h1
            data-ff="dash-heading"
            className="text-mobile-title-3 md:text-desktop-title-2 text-text-primary"
          >
            {props.heading}
          </h1>
          <Button
            data-ff="dash-upload"
            size="md"
            variant="filled"
            color="primary"
            leftIcon={<Icon name="upload" />}
          >
            {props.uploadLabel}
          </Button>
        </div>
        <section data-ff="dash-table" className="flex w-full flex-col">
          <div className="grid grid-cols-[minmax(0,1fr)_140px_100px_128px] items-center gap-4 pb-2 max-md:grid-cols-[minmax(0,1fr)_auto]">
            <span className="text-caption text-text-secondary">{props.columns.file}</span>
            <span className="text-caption text-text-secondary max-md:hidden">
              {props.columns.lastEdit}
            </span>
            <span className="text-caption text-text-secondary max-md:hidden">
              {props.columns.size}
            </span>
            <span className="text-caption text-right text-text-secondary">
              {props.columns.actions}
            </span>
          </div>
          {files.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              menu={props.menu}
              labels={props.rowActionLabels}
              onDownload={() => {
                downloadPdf(props.downloads.signedFileName, ['Signed document', `${file.name} — prototype copy.`]);
                showToast('signed');
              }}
              onDownloadAudit={() => {
                downloadPdf(props.downloads.auditFileName, ['Audit trail', `${file.name} — Certificate of Completion.`]);
                showToast('audit');
              }}
            />
          ))}
        </section>
      </main>
      {toast && <DownloadToast variant={toast} copy={props.toast} onDismiss={dismissToast} />}
    </div>
  );
}
