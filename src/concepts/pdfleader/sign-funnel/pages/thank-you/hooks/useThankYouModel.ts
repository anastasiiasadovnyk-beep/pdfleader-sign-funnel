import { useEffect, useRef, useState } from 'react';

import { recallSignatureType } from '../../../lib/signatureChoice';
import type { ThankYouScreenProps, ToastVariant } from '../types';

const TOAST_MS = 5000;

/**
 * View-model for the thank-you page: which download toast is visible, and which
 * signature type the page was reached with.
 *
 * The download CTAs deliberately produce NO file: a real download opens the
 * browser's own save/download UI, which pulls a test participant out of the
 * prototype. The green toast is the whole feedback. Downloads also do not
 * auto-start on page load (Figma annotation); the toast appears on arrival and
 * after a CTA click, and auto-dismisses after 5 s.
 */
export function useThankYouModel(props: ThankYouScreenProps) {
  const [toast, setToast] = useState<ToastVariant | null>(props.initialToast ?? null);
  const timer = useRef<number | undefined>(undefined);
  /** Editor's choice when arriving through the flow; the mock seeds previews. */
  const [signatureType] = useState(() => recallSignatureType() ?? props.signatureType);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Arriving on the page announces the signed document once, for 5 s. Skipped
  // when a scenario pins a toast, so the pinned one is not put on a timer.
  useEffect(() => {
    if (props.initialToast) return;
    setToast('signed');
    timer.current = window.setTimeout(() => setToast(null), TOAST_MS);
    // Mount only — this is the arrival announcement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const show = (variant: ToastVariant) => {
    setToast(variant);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  };

  return {
    state: { toast },
    actions: {
      downloadFile: () => show('signed'),
      downloadAudit: () => show('audit'),
      dismissToast: () => {
        window.clearTimeout(timer.current);
        setToast(null);
      },
    },
    derived: {
      signatureType,
      /** Only a digital signature has an audit trail to download. */
      showAuditCta: signatureType === 'digital',
    },
  };
}
