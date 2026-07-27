import { Button, IconButton } from '@universe-forma/ui-pes';
import type { CompressModalProps } from './types';
import { useCompressState } from './hooks/useCompressState';
import { ChevronRightIcon, CloseIcon } from './components/icons';
import CompressOption from './components/CompressOption';

export default function Screen(props: CompressModalProps) {
  const { title, file, options, orLabel, customSliderLabel, sliderLeftLabel, sliderRightLabel, onClose } = props;
  const { selectedId, customValue, select, setCustomValue, ctaLabel, projectedSizeOf, onCompress } =
    useCompressState(props);

  const presets = options.filter((o) => o.kind === 'preset');
  const custom = options.filter((o) => o.kind === 'custom');

  const renderOption = (o: (typeof options)[number]) => (
    <CompressOption
      key={o.id}
      option={o}
      projectedSize={projectedSizeOf(o)}
      selected={o.id === selectedId}
      onSelect={select}
      customValue={customValue}
      onCustomChange={setCustomValue}
      customSliderLabel={customSliderLabel}
      sliderLeftLabel={sliderLeftLabel}
      sliderRightLabel={sliderRightLabel}
    />
  );

  return (
    <div className="flex min-h-screen items-end justify-center bg-os-backdrop-overlay md:items-center md:p-4">
      <div data-ff="container" className="flex max-h-full w-full max-w-[796px] flex-col overflow-hidden rounded-t-6 bg-bg-white-bg shadow-xl md:rounded-6">
        <div className="mx-auto mt-3 h-1 w-16 shrink-0 rounded-full bg-material-grey-300 md:hidden" />

        <header className="flex items-center gap-2 px-4 py-4 md:px-6 md:py-6">
          <span aria-hidden="true" className="h-10 w-10 shrink-0" />
          <div className="min-w-0 flex-1 text-center">
            <h1 data-ff="title" className="text-mobile-title-4 text-text-primary md:text-desktop-title-4">{title}</h1>
            <p className="truncate text-body-2 text-text-secondary md:hidden">{file.name}</p>
          </div>
          <IconButton
            variant="text"
            color="action"
            size="md"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0"
          >
            <CloseIcon className="h-6 w-6" />
          </IconButton>
        </header>

        <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-2 md:px-6">
          <div className="flex items-center gap-4 rounded-4 bg-bg-light-grey px-4 py-4">
            <span className="min-w-0 flex-1 truncate text-body text-text-secondary md:text-text-primary">
              <span className="md:hidden">{file.currentSizeLabel}</span>
              <span className="hidden md:inline">{file.name}</span>
            </span>
            <span className="shrink-0 text-body text-text-secondary">{file.size}</span>
            <span className="hidden shrink-0 text-body text-text-secondary md:inline">{file.sizeLabel}</span>
          </div>

          <div className="flex flex-col gap-2">{presets.map(renderOption)}</div>

          {custom.length > 0 && (
            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-os-divider" />
              <span className="text-caption text-text-secondary">{orLabel}</span>
              <span className="h-px flex-1 bg-os-divider" />
            </div>
          )}

          <div className="flex flex-col gap-2">{custom.map(renderOption)}</div>
        </div>

        <footer className="px-4 py-4 md:px-6 md:py-6">
          <div className="relative">
            <span
              aria-hidden="true"
              data-ff="cta-glow"
              className="pointer-events-none absolute inset-x-8 -bottom-1 h-8 rounded-full bg-secondary opacity-40 blur-2xl"
            />
            <Button
              data-ff="cta"
              color="secondary"
              size="md"
              onClick={onCompress}
              rightIcon={<ChevronRightIcon className="h-5 w-5" />}
              className="relative w-full"
            >
              {ctaLabel}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
