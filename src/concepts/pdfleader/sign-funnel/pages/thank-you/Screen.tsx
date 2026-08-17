import { Button } from '@universe-forma/ui-pes';

import { forgetSignatureType } from '../../lib/signatureChoice';
import type { ThankYouScreenProps } from './types';
import { useThankYouModel } from './hooks/useThankYouModel';
import { ContactBlock } from './components/ContactBlock';
import { DownloadToast } from './components/DownloadToast';
import { Icon } from './components/Icon';
import { PaymentCard } from './components/PaymentCard';
import { TyFooter } from './components/TyFooter';
import { TyHeader } from './components/TyHeader';

/**
 * Thank-you page of the sign funnel: payment confirmed, download CTAs
 * (Digital adds the audit trail), payment summary and contacts. A download
 * CTA click shows a 5-second success toast.
 */
export default function Screen(props: ThankYouScreenProps) {
  const { state, actions, derived } = useThankYouModel(props);

  return (
    <div className="bg-bg-white-bg relative flex min-h-screen flex-col items-center gap-26 max-md:gap-12">
      <div className="flex w-full flex-col gap-16 max-md:gap-10">
        <TyHeader
          stepper={props.stepper}
          onHome={() => {
            // Restarting clears the sealing choice so the editor opens unsigned.
            forgetSignatureType();
            props.onRestart?.();
          }}
        />
        <section className="flex w-full flex-col items-center gap-6 px-28 max-md:px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1
              data-ff="ty-heading"
              className="text-mobile-title-3 md:text-desktop-title-1 text-text-primary"
            >
              {props.heading}
            </h1>
            <p
              data-ff="ty-subheading"
              className="text-subtitle md:text-desktop-title-4 text-center text-text-primary"
            >
              {props.subheading}
            </p>
          </div>
          <div
            data-ff="ty-cta-row"
            className="flex items-start gap-3 max-md:w-full max-md:flex-col"
          >
            <Button
              data-ff="ty-download-file"
              size="lg"
              variant="filled"
              color="primary"
              className="max-md:text-body-emph max-md:h-14 max-md:w-full max-md:rounded-4 max-md:px-6 max-md:py-3"
              leftIcon={<Icon name="download" />}
              onClick={actions.downloadFile}
            >
              {props.downloadFileLabel}
            </Button>
            {derived.showAuditCta && (
              <Button
                data-ff="ty-download-audit"
                size="lg"
                variant="filled-tonal"
                color="primary"
                className="max-md:text-body-emph max-md:h-14 max-md:w-full max-md:rounded-4 max-md:px-6 max-md:py-3"
                leftIcon={<Icon name="download" />}
                onClick={actions.downloadAudit}
              >
                {props.downloadAuditLabel}
              </Button>
            )}
          </div>
        </section>
        <section className="flex w-full items-start justify-between px-28 max-md:flex-col max-md:gap-10 max-md:px-4">
          <PaymentCard copy={props.paymentDetails} onDashboard={props.onNext} />
          <div className="md:pt-10">
            <ContactBlock copy={props.contact} />
          </div>
        </section>
      </div>
      <TyFooter copy={props.footer} />
      {state.toast && (
        <DownloadToast variant={state.toast} copy={props.toast} onDismiss={actions.dismissToast} />
      )}
    </div>
  );
}
