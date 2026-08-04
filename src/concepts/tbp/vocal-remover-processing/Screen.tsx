import type { VocalRemoverProcessingProps } from './types';
import AnimationPanel from './components/AnimationPanel';
import FileRow from './components/FileRow';
import ProgressBar from './components/ProgressBar';
import InfoCallout from './components/InfoCallout';

/**
 * Vocal Remover — file-processing modal (TheBestPDF). Mounts over the landing
 * page on a dimmed backdrop while the uploaded track is split. Non-dismissible:
 * it closes itself when processing completes.
 *
 * Single DOM tree, reflowed with CSS grid line-placement so every region has
 * exactly one element (the fidelity gate measures the first `data-ff` match):
 *   mobile  → title · animation · file/progress · callout   (stacked)
 *   desktop → animation on the left; title + file/progress + callout stacked
 *             in the right column, centered between two flexible spacers with
 *             the callout pinned to the bottom row.
 */
export default function Screen(props: VocalRemoverProcessingProps) {
  const { title, file, progress, estimatedTimeLabel, info } = props;

  return (
    <div className="flex min-h-screen justify-center bg-os-backdrop-overlay md:items-center md:p-4">
      {/* Mobile: full-bleed (fills the screen, no radius/shadow).
          Desktop: centered card, max-w 860, rounded-4. */}
      <div
        data-ff="container"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex min-h-screen w-full flex-col bg-bg-white-bg md:min-h-0 md:max-w-[860px] md:overflow-hidden md:rounded-4 md:shadow-modal-card"
      >
        <div className="flex flex-1 flex-col gap-4 p-4 md:grid md:min-h-[600px] md:grid-cols-[354px_minmax(0,1fr)] md:grid-rows-[1fr_auto_auto_1fr_auto] md:gap-x-8 md:gap-y-4 md:p-8">
          {/* Title — mobile: top, centered; desktop: right column, second row */}
          <h1
            data-ff="title"
            className="text-center text-mobile-title-4 text-text-primary md:col-start-2 md:row-start-2 md:text-left md:text-desktop-title-4"
          >
            {title}
          </h1>

          {/* Animation — mobile: fixed band; desktop: full-height left column */}
          <AnimationPanel className="h-[280px] shrink-0 md:col-start-1 md:row-span-5 md:row-start-1 md:h-auto md:self-stretch" />

          {/* File + progress core */}
          <div className="flex flex-col gap-4 md:col-start-2 md:row-start-3">
            <FileRow file={file} />
            <div className="flex flex-col gap-1.5">
              <ProgressBar progress={progress} />
              <p data-ff="estimate" className="text-caption text-text-secondary">
                {estimatedTimeLabel}
              </p>
            </div>
          </div>

          {/* Reassurance callout — pinned to the bottom row on desktop */}
          <InfoCallout className="mt-auto md:col-start-2 md:row-start-5 md:mt-0">{info}</InfoCallout>
        </div>
      </div>
    </div>
  );
}
