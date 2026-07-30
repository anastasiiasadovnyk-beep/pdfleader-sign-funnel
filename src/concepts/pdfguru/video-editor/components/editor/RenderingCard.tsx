import { type FC, useEffect, useState } from 'react';

import { MdCheck, MdChevronLeft, MdLightbulb, MdPlayArrow } from 'react-icons/md';

import audioToVideoAnimation from '../../assets/audio-to-video.json';
import { LottiePlayer } from './LottiePlayer';

/** Render stages, in order. Completed ones get a green check; the rest are plain. */
const RENDER_STEPS = [
  'Stitching your clip together',
  'Encoding in high quality',
  'Enhancing color and sharpness',
  'Finalizing your video'
] as const;

interface RenderingCardProps {
  /** Back control (top-left) — returns to the editor. */
  onBack?: () => void;
}

/**
 * "Rendering your video…" modal — the export step, matching the Figma design.
 * Desktop: a two-column card with the animation on the left. Mobile: a
 * full-screen sheet with a fixed 192px full-width animation band on top.
 * Self-contained: progress is animated locally (no real render pipeline).
 */
export const RenderingCard: FC<RenderingCardProps> = ({ onBack }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((value) => (value >= 100 ? value : Math.min(100, value + Math.max(1, Math.round((100 - value) * 0.08)))));
    }, 500);
    return () => clearInterval(id);
  }, []);

  const perStep = 100 / RENDER_STEPS.length;
  const doneCount = Math.min(RENDER_STEPS.length, Math.floor(progress / perStep));

  return (
    <div className='relative flex h-full w-full flex-col overflow-hidden bg-bg-white-bg md:h-auto md:min-h-[520px] md:max-w-[864px] md:flex-row md:rounded-6 md:shadow-[0_20px_32px_rgba(0,0,0,0.16),0_0_12px_-8px_rgba(0,0,0,0.08)]'>
      {/* Back button — top-left, over the animation area */}
      <button
        type='button'
        aria-label='Back'
        onClick={onBack}
        className='absolute left-4 top-4 z-10 flex size-9 items-center justify-center rounded-2 border border-action-stroke bg-bg-white-bg text-text-primary shadow-sm transition-colors hover:bg-action-hover'
      >
        <MdChevronLeft className='size-5' />
      </button>

      {/* Animation area — desktop: left column; mobile: fixed 192px band on top,
          full width. Lavender panel matches the animation's own background. */}
      <div className='flex h-[192px] w-full shrink-0 items-center justify-center overflow-hidden bg-primary-opacity-8 md:h-auto md:w-[430px]'>
        {/* The whole illustration stays visible (contain); the lavender panel
            fills the rest of the full-width band, matching the Figma. */}
        <LottiePlayer
          animationData={audioToVideoAnimation}
          preserveAspectRatio='xMidYMid meet'
          className='h-full w-full'
        />
      </div>

      {/* Content */}
      <div className='flex flex-1 flex-col gap-6 p-6 md:p-10'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-desktop-title-4 text-text-primary'>Rendering your video...</h2>
          <p className='text-body text-text-secondary'>This may take a few minutes.</p>
        </div>

        {/* File */}
        <div className='flex items-center gap-3'>
          <span className='flex size-10 shrink-0 items-center justify-center rounded-2 bg-bg-dark-blue-grey text-common-white'>
            <MdPlayArrow className='size-6' />
          </span>
          <div className='flex flex-col'>
            <span className='text-body-emph text-text-primary'>project.mp4</span>
            <span className='text-caption text-text-secondary'>56.87 MB</span>
          </div>
        </div>

        {/* Progress */}
        <div className='flex items-center gap-3'>
          <div className='relative h-1 flex-1 overflow-hidden rounded'>
            <div className='absolute inset-0 rounded bg-primary/20' />
            <div
              className='absolute inset-y-0 left-0 rounded bg-primary transition-[width] duration-500 ease-out'
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className='text-[10px] font-[600] leading-none text-text-primary'>{progress}%</span>
        </div>

        {/* Steps */}
        <ul className='flex flex-col gap-2'>
          {RENDER_STEPS.map((label, index) => (
            <li
              key={label}
              className='flex items-center gap-2'
            >
              <span className='flex size-5 shrink-0 items-center justify-center'>
                {index < doneCount && <MdCheck className='size-5 text-success-main' />}
              </span>
              <span className='text-body-2 text-text-primary'>{label}</span>
            </li>
          ))}
        </ul>

        {/* Tip */}
        <div className='flex items-start gap-2 rounded-2 bg-bg-light-grey px-3 py-3'>
          <MdLightbulb className='size-5 shrink-0 text-text-primary' />
          <p className='flex flex-col text-body-2 text-text-primary'>
            <span className='font-[600]'>Video creation in progress.</span>
            <span>Please keep this page open.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
