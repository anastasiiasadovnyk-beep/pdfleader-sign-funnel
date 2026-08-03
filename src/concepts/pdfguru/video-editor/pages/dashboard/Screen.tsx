import { type FC, type ReactNode, useState } from 'react';

import type { IconType } from 'react-icons';
import {
  MdAdd,
  MdCheck,
  MdDeleteOutline,
  MdImage,
  MdMusicNote,
  MdOutlineBallot,
  MdOutlineCompress,
  MdOutlineContentCopy,
  MdOutlineEdit,
  MdOutlineFileUpload,
  MdOutlinePermMedia,
  MdOutlineQrCode2,
  MdOutlineSettings,
  MdOutlineShare,
  MdOutlineSyncAlt,
  MdOutlineWidgets,
  MdPerson,
  MdPlayArrow
} from 'react-icons/md';

import { BaseDropdown, BaseDropdownItem, Button, Search, cn } from '@universe-forma/ui-pes';

import logoMark from '../../assets/pdf-guru-mark.svg';
import compressVideoIcon from '../../assets/tools/compress-video.svg';
import convertVideoIcon from '../../assets/tools/convert-video.svg';
import editVideoIcon from '../../assets/tools/edit-video.svg';
import enhanceImageIcon from '../../assets/tools/enhance-image.svg';
import transcribeAudioIcon from '../../assets/tools/transcribe-audio.svg';
import transcribeVideoIcon from '../../assets/tools/transcribe-video.svg';

interface DashboardScreenProps {
  /** Returns to the previous step. */
  onBack?: () => void;
}

/** "More actions" glyph — three horizontal dots, matching the reference. */
const MoreDotsIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox='0 0 24 24'
    className={className}
    fill='currentColor'
    aria-hidden='true'
  >
    <circle
      cx='5'
      cy='12'
      r='2'
    />
    <circle
      cx='12'
      cy='12'
      r='2'
    />
    <circle
      cx='19'
      cy='12'
      r='2'
    />
  </svg>
);

/** "My files" glyph — a rounded house with a door, matching the design. */
const HomeIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox='0 0 24 24'
    className={className}
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
  >
    <path d='M4 10.5 12 4l8 6.5' />
    <path d='M5.5 9.7V19a1 1 0 0 0 1 1h3.5v-4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3.5a1 1 0 0 0 1-1V9.7' />
  </svg>
);

/** "AI tools" glyph — a 5-point star with sparkles, matching the design. */
const SparkleStarIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox='0 0 24 24'
    className={className}
    fill='none'
    stroke='currentColor'
    strokeWidth='1.8'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
  >
    <path d='M12.5 7 13.91 11.06 18.21 11.15 14.78 13.74 16.03 17.85 12.5 15.4 8.97 17.85 10.22 13.74 6.79 11.15 11.09 11.06Z' />
    <path d='M5 4.3V7' />
    <path d='M3.6 5.65H6.4' />
    <path d='M19.2 5 17.8 6.4' />
  </svg>
);

/** Header search glyph — a magnifier inside corner brackets ("frame inspect"), matching the design. */
const SearchFramedIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox='0 0 24 24'
    className={className}
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
  >
    <path d='M4 8V6a2 2 0 0 1 2-2h2' />
    <path d='M16 4h2a2 2 0 0 1 2 2v2' />
    <path d='M20 16v2a2 2 0 0 1-2 2h-2' />
    <path d='M8 20H6a2 2 0 0 1-2-2v-2' />
    <circle
      cx='10.5'
      cy='10.5'
      r='2.5'
    />
    <path d='m12.5 12.5 2 2' />
  </svg>
);

/** Left navbar items (icon over label). A divider follows "Media". */
const NAV: { id: string; label: string; Icon: FC<{ className?: string }>; dividerAfter?: boolean }[] = [
  { id: 'files', label: 'My files', Icon: HomeIcon },
  { id: 'media', label: 'Media', Icon: MdOutlinePermMedia, dividerAfter: true },
  { id: 'tools', label: 'Tools', Icon: MdOutlineWidgets },
  { id: 'ai', label: 'AI tools', Icon: SparkleStarIcon },
  { id: 'forms', label: 'Forms', Icon: MdOutlineBallot },
  { id: 'qr', label: 'QR Code', Icon: MdOutlineQrCode2 }
];

/** Quick-action tool cards shown above the Media grid (48×48 illustrations). */
const TOOLS: { label: string; src: string }[] = [
  { label: 'Edit Video', src: editVideoIcon },
  { label: 'Convert Video', src: convertVideoIcon },
  { label: 'Transcribe Video', src: transcribeVideoIcon },
  { label: 'Enhance Image', src: enhanceImageIcon },
  { label: 'Transcribe Audio', src: transcribeAudioIcon },
  { label: 'Compress Video', src: compressVideoIcon }
];

/** Filter tabs above the grid (label + count). */
const FILTERS = [
  { label: 'ALL', count: 3 },
  { label: 'Video', count: 1 },
  { label: 'Audio', count: 1 },
  { label: 'Images', count: 1 }
];

type MediaKind = 'video' | 'image' | 'audio';

interface MediaItem {
  title: string;
  kind: MediaKind;
  date: string;
  size: string;
  /** Thumbnail content: a photo stand-in (gradient) or the logo placeholder for audio. */
  thumb: ReactNode;
}

const MEDIA: MediaItem[] = [
  {
    title: 'Video',
    kind: 'video',
    date: 'Jul 24, 2024',
    size: '24 MB',
    thumb: <div className='h-full w-full rounded-3 bg-gradient-to-b from-amber-200 via-sky-300 to-indigo-500' />
  },
  {
    title: 'Image',
    kind: 'image',
    date: 'Jul 24, 2024',
    size: '24 MB',
    thumb: <div className='h-full w-[147px] rounded-2 bg-gradient-to-br from-rose-500 via-red-400 to-orange-300' />
  },
  {
    title: 'Audio_record',
    kind: 'audio',
    date: 'Jul 24, 2024',
    size: '24 MB',
    thumb: (
      <div className='flex h-full w-full items-center justify-center rounded-3 bg-white/60'>
        <img
          src={logoMark}
          alt=''
          className='size-11 opacity-40 grayscale'
        />
      </div>
    )
  }
];

/** 14×14 format badge shown in a media card's info row. */
const FormatBadge: FC<{ kind: MediaKind }> = ({ kind }) => {
  const map = {
    video: { bg: 'bg-[#607d8b]', Icon: MdPlayArrow },
    image: { bg: 'bg-[#d85bea]', Icon: MdImage },
    audio: { bg: 'bg-[#607d8b]', Icon: MdMusicNote }
  } as const;
  const { bg, Icon } = map[kind];
  return (
    <span className={cn('flex size-3.5 shrink-0 items-center justify-center rounded-[3px]', bg)}>
      <Icon className='size-2.5 text-common-white' />
    </span>
  );
};

/** A divider between groups in the card action menu. */
const MenuDivider: FC = () => <div className='my-1.5 h-px bg-os-divider' />;

/** One row in the card action menu. */
const MenuAction: FC<{ Icon: IconType; label: string; danger?: boolean }> = ({ Icon, label, danger }) => (
  <BaseDropdownItem
    className={cn(
      'flex cursor-pointer items-center gap-3 rounded-2 px-3 py-2 text-body-2 font-medium transition-colors hover:bg-action-hover',
      danger ? 'text-error-main' : 'text-text-primary'
    )}
  >
    <Icon className='size-5 shrink-0' />
    {label}
  </BaseDropdownItem>
);

/**
 * A media file card with the doc-card interaction states: default → hover
 * (reveals a checkbox top-left and a "···" more button top-right, and elevates)
 * → active menu (the actions dropdown open). Video cards also show a duration
 * badge. The menu adapts its Compress/Convert labels to the file kind.
 */
const MediaCard: FC<{ item: MediaItem }> = ({ item }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <div
      className={cn(
        'group relative flex h-[176px] w-full max-w-[297px] flex-col items-start gap-2 rounded-5 p-2 transition-colors md:h-[274px] md:gap-2.5 md:pb-2.5',
        menuOpen ? 'bg-bg-white-bg' : 'hover:bg-bg-white-bg'
      )}
    >
      <div className='relative flex w-full flex-1 items-center justify-center overflow-hidden rounded-5 bg-[#efe9fc] p-4 transition-colors group-hover:bg-[#ededf1]'>
        {item.thumb}

        {/* Duration badge (video + audio) */}
        {(item.kind === 'video' || item.kind === 'audio') && (
          <span className='absolute bottom-3 right-3 rounded-2 bg-text-primary/85 px-1.5 py-0.5 text-caption font-semibold text-common-white'>
            03:28
          </span>
        )}

        {/* Selection checkbox (top-left) */}
        <button
          type='button'
          aria-label='Select file'
          aria-pressed={checked}
          onClick={() => setChecked((value) => !value)}
          className={cn(
            'absolute left-3 top-3 flex size-6 items-center justify-center rounded-2 border shadow-sm transition-opacity',
            checked ? 'border-primary bg-primary text-common-white' : 'border-action-stroke bg-bg-white-bg',
            menuOpen || checked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
          {checked && <MdCheck className='size-4' />}
        </button>

        {/* More actions (top-right) — always visible on mobile (no hover), hover-reveal on desktop. */}
        <div
          className={cn(
            'absolute right-3 top-3 transition-opacity',
            menuOpen ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
          )}
        >
          <BaseDropdown
            open={menuOpen}
            onOpenChange={setMenuOpen}
            align='start'
            sideOffset={6}
            collisionPadding={12}
            className='z-[10006] min-w-[228px] rounded-3 bg-bg-white-bg p-1.5 shadow-[0_10px_34px_-8px_rgba(33,33,52,0.28)]'
            trigger={
              <button
                type='button'
                aria-label='More actions'
                className='group/more flex size-8 items-center justify-center rounded-2 bg-bg-white-bg p-1 text-text-primary shadow-[0_2px_10px_-2px_rgba(33,33,52,0.35)]'
              >
                <span className='flex size-full items-center justify-center rounded-1 transition-colors group-hover/more:bg-action-hover'>
                  <MoreDotsIcon className='size-5' />
                </span>
              </button>
            }
          >
            <MenuAction
              Icon={MdOutlineCompress}
              label={`Compress ${item.kind}`}
            />
            <MenuAction
              Icon={MdOutlineSyncAlt}
              label={`Convert ${item.kind}`}
            />
            <MenuDivider />
            <MenuAction
              Icon={MdOutlineContentCopy}
              label='Create copy'
            />
            <MenuAction
              Icon={MdOutlineEdit}
              label='Rename'
            />
            <MenuDivider />
            <MenuAction
              Icon={MdOutlineShare}
              label='Share link'
            />
            <MenuDivider />
            <MenuAction
              Icon={MdDeleteOutline}
              label='Delete'
              danger
            />
          </BaseDropdown>
        </div>
      </div>

      <div className='flex w-full shrink-0 flex-col gap-1 px-1'>
        <span className='truncate text-body-2 font-bold text-text-primary md:text-body'>{item.title}</span>
        <span className='flex items-center gap-1.5 whitespace-nowrap text-caption text-text-secondary md:gap-2 md:text-body-2'>
          <FormatBadge kind={item.kind} />
          <span className='size-1 shrink-0 rounded-full bg-text-secondary' />
          {item.date}
          <span className='size-1 shrink-0 rounded-full bg-text-secondary' />
          {item.size}
        </span>
      </div>
    </div>
  );
};

/** Mobile bottom navigation: My files · Media · (+) · Tools · Settings. */
const MobileBottomBar: FC<{ active: string; onSelect: (id: string) => void }> = ({ active, onSelect }) => {
  const item = ({ id, label, Icon }: { id: string; label: string; Icon: FC<{ className?: string }> }) => (
    <button
      key={id}
      type='button'
      onClick={() => onSelect(id)}
      className={cn(
        'flex flex-1 flex-col items-center gap-1 rounded-3 py-1.5 text-caption font-medium transition-colors',
        active === id ? 'bg-[#00000014] text-text-primary' : 'text-text-secondary'
      )}
    >
      <Icon className='size-6' />
      {label}
    </button>
  );

  return (
    <nav className='fixed inset-x-0 bottom-16 z-40 flex items-center gap-1 border-t border-os-divider bg-bg-white-bg px-2 pb-2 pt-1.5 md:hidden'>
      {item({ id: 'files', label: 'My files', Icon: HomeIcon })}
      {item({ id: 'media', label: 'Media', Icon: MdOutlinePermMedia })}
      <button
        type='button'
        aria-label='Create'
        className='mx-1 flex size-14 shrink-0 -translate-y-1 items-center justify-center rounded-4 bg-primary text-common-white shadow-[0_10px_22px_-6px_rgba(95,48,226,0.6)]'
      >
        <MdAdd className='size-7' />
      </button>
      {item({ id: 'tools', label: 'Tools', Icon: MdOutlineWidgets })}
      {item({ id: 'settings', label: 'Settings', Icon: MdOutlineSettings })}
    </nav>
  );
};

/**
 * Step 8 — Dashboard (Media tab). Opened from the Thank-you "Go to All Documents"
 * action. Recreates PDF Guru's dashboard shell (left navbar / mobile bottom bar,
 * header with search + Upload, quick-action tool cards, filter tabs, file grid)
 * with the new **Media** tab active — matching the Figma design (A/B Testing).
 */
const DashboardScreen: FC<DashboardScreenProps> = () => {
  const [activeTab, setActiveTab] = useState('media');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Filter tabs sort the grid by file kind; "ALL" shows everything.
  const FILTER_KIND: Record<string, MediaKind> = { Video: 'video', Audio: 'audio', Images: 'image' };
  const visibleMedia = activeFilter === 'ALL' ? MEDIA : MEDIA.filter((item) => item.kind === FILTER_KIND[activeFilter]);

  return (
    <div className='flex min-h-screen w-full flex-col bg-bg-light-grey [font-family:var(--font-primary)] md:flex-row md:gap-2 md:p-4'>
      {/* Left vertical navbar — desktop only (mobile uses the bottom tab bar). */}
      <aside className='hidden w-[76px] shrink-0 flex-col items-center gap-4 pb-6 pt-[19px] md:flex md:pt-[35px]'>
        <img
          src={logoMark}
          alt='PDF Guru'
          className='size-12'
        />
        <span className='h-px w-10 bg-os-divider' />

        <nav className='flex flex-col items-center gap-1'>
          {NAV.map(({ id, label, Icon, dividerAfter }) => {
            const active = id === activeTab;
            return (
              <div
                key={id}
                className='flex flex-col items-center'
              >
                <button
                  type='button'
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'flex w-[68px] flex-col items-center gap-1 rounded-3 px-2 pb-2 pt-3.5 text-center text-body-2 leading-[18px] text-text-primary transition-colors',
                    active ? 'bg-[#00000014]' : 'hover:bg-[#00000014]'
                  )}
                >
                  <Icon className='size-6' />
                  {label}
                </button>
                {dividerAfter && <span className='my-2 h-px w-10 bg-os-divider' />}
              </div>
            );
          })}
        </nav>

        {/* User avatar (bottom) with a notification dot */}
        <div className='relative mt-auto'>
          <span className='flex size-11 items-center justify-center rounded-4 bg-os-divider text-text-secondary'>
            <MdPerson className='size-6' />
          </span>
          <span className='absolute -right-0.5 -top-0.5 size-3.5 rounded-full border-2 border-bg-light-grey bg-[#fb8c00]' />
        </div>
      </aside>

      {/* Main content — a white card on desktop, plain on the grey mobile page. */}
      <main className='flex min-w-0 flex-1 flex-col gap-6 p-4 pb-32 md:rounded-6 md:bg-bg-white-bg md:p-10 md:shadow-[0_10px_24px_-12px_rgba(86,72,135,0.18)]'>
        {/* Header */}
        <header className='flex items-start justify-between gap-4'>
          <h1 className='text-[26px] font-[800] leading-[1.2] text-text-primary md:text-[31.2px]'>Media files</h1>
          {/* Desktop: search + Upload in the header (mobile uses the search below and the + FAB). */}
          <div className='hidden items-center gap-3 md:flex'>
            <div className='w-[260px]'>
              <Search
                size='dense'
                bg='default'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder='Search files...'
                aria-label='Search files'
                findText=''
                containerClassName='!border-0'
                leftIcon={<SearchFramedIcon className='size-5 shrink-0 text-text-secondary' />}
              />
            </div>
            <Button
              variant='filled'
              color='primary'
              size='md'
              leftIcon={<MdOutlineFileUpload className='size-5' />}
            >
              Upload files
            </Button>
          </div>
        </header>

        {/* Quick-action tool cards */}
        <ul className='flex items-center gap-2 overflow-x-auto pb-1'>
          {TOOLS.map(({ label, src }) => (
            <li
              key={label}
              className='shrink-0 grow basis-[104px] md:basis-[172px]'
            >
              <button
                type='button'
                className='flex size-full min-h-[104px] flex-col items-center justify-center gap-1 rounded-4 border border-action-stroke bg-bg-white-bg p-2 text-center text-body-2 font-bold text-text-primary transition-colors hover:bg-[#0000000a] md:min-h-[60px] md:flex-row md:justify-start md:gap-2 md:px-3 md:text-left'
              >
                <img
                  src={src}
                  alt=''
                  className='size-12 shrink-0'
                />
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* Mobile: search sits below the tool cards (desktop keeps it in the header). */}
        <div className='md:hidden'>
          <Search
            size='dense'
            bg='default'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Search files...'
            aria-label='Search files'
            findText=''
            containerClassName='!border-0'
            leftIcon={<SearchFramedIcon className='size-5 shrink-0 text-text-secondary' />}
          />
        </div>

        {/* Filter tabs + grid. On mobile it spans edge-to-edge with only its top
            corners rounded (16px); on desktop it's a bordered, rounded card. */}
        <section className='-mx-4 flex flex-col rounded-t-5 bg-bg-white-bg md:mx-0 md:rounded-5 md:border md:border-os-divider'>
          <div className='flex items-center gap-1 border-b border-action-stroke p-3'>
            {FILTERS.map(({ label, count }) => {
              const active = label === activeFilter;
              return (
                <button
                  key={label}
                  type='button'
                  onClick={() => setActiveFilter(label)}
                  className={cn(
                    'flex h-8 items-center gap-1.5 rounded-3 px-2 text-caption font-bold text-text-primary transition-colors',
                    active ? 'bg-[#00000014]' : 'hover:bg-[#0000000a]'
                  )}
                >
                  {label}
                  <span className='rounded-2 border border-action-stroke bg-bg-white-bg px-2 py-0.5 text-[10px] font-bold leading-[14px] text-text-primary'>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className='grid grid-cols-2 gap-2 p-2 md:grid-cols-3'>
            {visibleMedia.map((item) => (
              <MediaCard
                key={item.title}
                item={item}
              />
            ))}
          </div>
        </section>
      </main>

      <MobileBottomBar
        active={activeTab}
        onSelect={setActiveTab}
      />
    </div>
  );
};

export default DashboardScreen;
