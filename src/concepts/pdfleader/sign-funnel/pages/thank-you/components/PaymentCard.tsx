import { Button } from '@universe-forma/ui-pes';

import type { PaymentDetailsCopy } from '../types';
import { Icon } from './Icon';

/** Dashed-border payment summary card (Card is a DS gap — composed from tokens). */
export function PaymentCard({ copy, onDashboard }: { copy: PaymentDetailsCopy; onDashboard?: () => void }) {
  return (
    <div
      data-ff="ty-payment-card"
      className="border-primary bg-bg-white-bg flex w-[568px] flex-col items-center rounded-7 border border-dashed px-26 py-10 max-md:w-full max-md:px-6"
    >
      <div className="border-os-divider flex w-full max-w-[360px] flex-col gap-6 border-b pb-6">
        <h2 data-ff="ty-payment-title" className="text-desktop-title-4 text-center text-text-primary">
          {copy.title}
        </h2>
        <dl className="flex flex-col gap-2">
          {copy.rows.map((row) => (
            <div key={row.label} className="flex h-6 items-center justify-between">
              <dt className="text-subtitle text-text-secondary">{row.label}</dt>
              <dd data-ff={row.label === 'Plan:' ? 'ty-plan-value' : undefined} className="text-subtitle-emph text-text-primary">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex w-full max-w-[360px] flex-col items-center gap-4 pt-6">
        <p className="text-body-2 text-center text-text-secondary">{copy.dashboardCaption}</p>
        <Button
          data-ff="ty-dashboard-cta"
          onClick={onDashboard}
          size="lg"
          variant="outlined"
          color="primary"
          className="max-md:text-body-emph w-full whitespace-nowrap max-md:h-14 max-md:rounded-4 max-md:py-3"
          rightIcon={<Icon name="arrow_forward" />}
        >
          {copy.dashboardCtaLabel}
        </Button>
      </div>
    </div>
  );
}
