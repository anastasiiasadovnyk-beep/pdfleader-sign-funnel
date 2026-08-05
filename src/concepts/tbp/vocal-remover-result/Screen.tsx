import { Button } from '@universe-forma/ui-pes';
import type { VocalRemoverResultProps } from './types';
import { useResultModel } from './hooks/useResultModel';
import Header from './components/Header';
import FeatureBadges from './components/FeatureBadges';
import OriginalTrackRow from './components/OriginalTrackRow';
import TrackItem from './components/TrackItem';
import RateResult from './components/RateResult';
import { DownloadIcon } from './components/icons';

/**
 * Vocal Remover — **result** screen (TheBestPDF), variant B of the result A/B
 * test. Shown after the split completes: the user previews the separated stems
 * (first 30s playable), downloads the full tracks, and rates the result.
 *
 * Pure composition root — props in, UI out. Interaction (which stem is playing,
 * the thumbs rating) lives in `useResultModel`; every region is a sub-component
 * carrying its own `data-ff` contract.
 *
 * Responsive flow (flex `order`): desktop keeps the feature row above the card
 * with the download CTA inline in the "Separated tracks" header; mobile drops
 * the feature list below the card and pins the CTA to the bottom of the screen.
 */
export default function Screen(props: VocalRemoverResultProps) {
  const {
    title,
    subtitle,
    features,
    originalLabel,
    original,
    changeLabel,
    separatedLabel,
    downloadAllLabel,
    tracks,
    rateLabel,
    thanksLabel,
  } = props;
  const { state, actions } = useResultModel(props);

  return (
    <div className="min-h-screen bg-bg-light-grey">
      <Header />

      <main className="mx-auto flex w-full max-w-[676px] flex-col gap-6 px-4 pb-28 md:px-0 md:pb-16">
        {/* Title + subtitle */}
        <div className="order-1 flex flex-col items-center gap-2 text-center">
          <h1
            data-ff="title"
            className="text-mobile-title-3 font-bold text-text-primary md:text-desktop-title-3"
          >
            {title}
          </h1>
          <p data-ff="subtitle" className="whitespace-pre-line text-body text-text-secondary">
            {subtitle}
          </p>
        </div>

        {/* Reassurance features — above the card on desktop, below it on mobile */}
        <div className="order-3 md:order-2">
          <FeatureBadges features={features} />
        </div>

        {/* Result card */}
        <section
          data-ff="card"
          className="order-2 flex flex-col gap-5 rounded-3 bg-bg-white-bg p-6 shadow-modal-card md:order-3"
        >
          {/* Original track */}
          <div className="flex flex-col gap-3">
            <h2 data-ff="original-title" className="text-subtitle-emph text-text-primary">
              {originalLabel}
            </h2>
            <OriginalTrackRow file={original} changeLabel={changeLabel} onChange={actions.changeFile} />
          </div>

          <div className="h-px bg-os-divider" />

          {/* Separated tracks */}
          <div className="flex flex-col gap-4">
            <div
              data-ff="separated-header"
              className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
            >
              <h2 data-ff="separated-title" className="text-subtitle-emph text-text-primary">
                {separatedLabel}
              </h2>
              {/* Inline CTA — desktop only (mobile uses the fixed bottom bar) */}
              <Button
                data-ff="download-all"
                color="primary"
                size="md"
                onClick={actions.downloadAll}
                leftIcon={<DownloadIcon className="h-5 w-5" />}
                className="hidden w-full md:inline-flex md:w-auto"
              >
                {downloadAllLabel}
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              {tracks.map((track) => (
                <TrackItem
                  key={track.id}
                  track={track}
                  playing={state.playingId === track.id}
                  onTogglePlay={actions.togglePlay}
                  onDownload={actions.downloadTrack}
                />
              ))}
            </div>
          </div>

          <RateResult
            label={rateLabel}
            thanksLabel={thanksLabel}
            rating={state.rating}
            onRate={actions.rate}
          />
        </section>
      </main>

      {/* Mobile-only sticky download bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-os-divider bg-bg-white-bg px-4 py-3 md:hidden">
        <Button
          data-ff="download-all-mobile"
          color="primary"
          size="md"
          onClick={actions.downloadAll}
          leftIcon={<DownloadIcon className="h-5 w-5" />}
          className="w-full"
        >
          {downloadAllLabel}
        </Button>
      </div>
    </div>
  );
}
