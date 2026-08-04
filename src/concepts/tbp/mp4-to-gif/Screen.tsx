import { useRef } from 'react';
import { Button } from '@universe-forma/ui-pes';
import type { Mp4ToGifProps } from './types';
import { useMp4ToGifModel } from './hooks/useMp4ToGifModel';
import Header from './components/Header';
import VideoPreview from './components/VideoPreview';
import TrimTimeline from './components/TrimTimeline';
import GifSettingsPanel from './components/GifSettingsPanel';
import { DownloadIcon } from './components/icons';

/** MP4 → GIF builder (TheBestPDF). Left: the video stage + trim timeline.
 * Right (desktop) / below (mobile): the GIF settings form.
 *
 * Desktop is a full-height shell that never scrolls the page: the trim timeline
 * stays pinned in view and the preview flexes to fit (sized to the chosen ratio),
 * while the settings column scrolls between a fixed "GIF settings" header and a
 * fixed CTA bar. Mobile keeps the natural stacked scroll with the CTA pinned to a
 * bottom bar. */
export default function Screen(props: Mp4ToGifProps) {
  const { ratios, speeds, fpsOptions, qualities, maxClipSec, minClipSec } = props;
  const model = useMp4ToGifModel({
    initialVideo: props.video,
    initialTrim: props.initialTrim,
    initialSettings: props.initialSettings,
    maxClipSec,
    ratios,
    speeds,
    fpsOptions,
    qualities,
  });
  const { state, actions, derived } = model;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // "Change file" opens the system file picker; a picked clip replaces the source.
  const openFilePicker = () => fileInputRef.current?.click();
  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) actions.changeVideo(file);
    props.onChangeFile?.();
    e.target.value = ''; // allow re-picking the same file
  };

  // Card elevation — ui-pes exposes the modal shadow only as a brand CSS var,
  // not a generated Tailwind `shadow-*` utility, so it's applied inline.
  const cardShadow = { boxShadow: '0 5px 12px 0 rgba(0,0,0,0.1)' };

  const cta = (
    <Button
      variant="filled"
      color="primary"
      size="lg"
      data-ff="cta"
      className="h-12 w-full"
      leftIcon={<DownloadIcon className="h-5 w-5" />}
      onClick={() => props.onConvert?.(state.settings, state.trim)}
    >
      {props.ctaLabel}
    </Button>
  );

  return (
    <div className="flex min-h-screen flex-col bg-bg-light-grey md:h-screen md:min-h-0 md:overflow-hidden">
      <Header />

      {/* system file picker (hidden) — opened by "Change file" */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="sr-only"
        onChange={onFilePicked}
      />

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-4 px-4 py-2 pb-24 md:min-h-0 md:flex-row md:gap-5 md:overflow-hidden md:px-8 md:py-6 md:pb-6">
        {/* Builder card — video stage (flexes) + pinned trim timeline */}
        <section
          data-ff="builder-card"
          style={cardShadow}
          className="flex min-w-0 flex-col overflow-hidden rounded-3 bg-bg-white-bg md:h-full md:min-h-0 md:flex-1"
        >
          <VideoPreview
            video={state.video}
            ratio={derived.ratio}
            changeLabel={props.changeLabel}
            onChangeFile={openFilePicker}
          />
          <div className="h-px shrink-0 bg-os-divider" />
          {/* timeline is never scrolled away — pinned at the bottom of the builder */}
          <div className="shrink-0">
            <TrimTimeline
              durationSec={state.video.durationSec}
              trim={state.trim}
              maxClipSec={maxClipSec}
              minClipSec={minClipSec}
              hint={props.hint}
              onChange={actions.setTrim}
            />
          </div>
        </section>

        {/* Settings card — fixed header + scrollable content + fixed CTA (desktop) */}
        <aside
          data-ff="settings-card"
          style={cardShadow}
          className="flex w-full flex-col overflow-hidden rounded-3 bg-bg-white-bg md:h-full md:w-[308px] md:min-h-0"
        >
          <div className="hidden shrink-0 px-5 py-4 md:block">
            <h2 data-ff="panel-title" className="text-desktop-title-5 text-text-primary">
              {props.panelTitle}
            </h2>
          </div>
          <div className="hidden h-px shrink-0 bg-os-divider md:block" />

          <div className="px-5 py-5 md:min-h-0 md:flex-1 md:overflow-y-auto">
            <GifSettingsPanel
              copy={props}
              options={{ ratios, speeds, fpsOptions, qualities }}
              settings={state.settings}
              derived={derived}
              actions={actions}
            />
          </div>

          {/* desktop CTA footer — always pinned to the bottom of the panel */}
          <div className="hidden shrink-0 md:block">
            <div className="h-px bg-os-divider" />
            <div className="px-5 py-4">{cta}</div>
          </div>
        </aside>
      </main>

      {/* mobile CTA — fixed bottom bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-os-divider bg-bg-white-bg px-4 py-4 md:hidden">
        {cta}
      </div>
    </div>
  );
}
