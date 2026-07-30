import { type FC, useEffect, useState } from 'react';

import { MdCheckCircle, MdOutlineAutorenew, MdOutlineRadioButtonUnchecked } from 'react-icons/md';

import { cn } from '@universe-forma/ui-pes';

import audioToVideoAnimation from '../../assets/audio-to-video.json';
import { LottiePlayer } from './LottiePlayer';

/**
 * The stages of turning a timeline into a finished video, in order. Product copy
 * chosen to read as a real, substantial render pipeline (assemble → sync →
 * enhance → encode → finalize) rather than a generic "Loading…".
 */
const RENDER_STEPS = [
  'Stitching your clips together',
  'Syncing audio and transitions',
  'Enhancing color and sharpness',
  'Encoding in high quality',
  'Finalizing your video'
] as const;

type StepStatus = 'done' | 'active' | 'pending';

const StepRow: FC<{ label: string; status: StepStatus }> = ({ label, status }) => {
  const Icon = status === 'done' ? MdCheckCircle : status === 'active' ? MdOutlineAutorenew : MdOutlineRadioButtonUnchecked;
  return (
    <li className='flex items-center gap-3'>
      <Icon
        className={cn(
          'size-5 shrink-0',
          status === 'done' && 'text-primary',
          status === 'active' && 'animate-spin text-primary',
          status === 'pending' && 'text-text-secondary/40'
        )}
      />
      <span
        className={cn(
          'text-body-2',
          status === 'pending' ? 'text-text-secondary' : 'text-text-primary',
          status === 'active' && 'font-[600]'
        )}
      >
        {label}
      </span>
    </li>
  );
};

/**
 * "Rendering your video" modal card — the export step. A progress bar plus a
 * checklist of render stages that complete in sequence as the bar advances.
 * Self-contained: progress is animated locally (no real render pipeline).
 */
export const RenderingCard: FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((value) => (value >= 100 ? value : Math.min(100, value + Math.max(1, Math.round((100 - value) * 0.08)))));
    }, 500);
    return () => clearInterval(id);
  }, []);

  const perStep = 100 / RENDER_STEPS.length;
  const currentIndex = Math.min(RENDER_STEPS.length - 1, Math.floor(progress / perStep));
  const statusOf = (index: number): StepStatus => {
    if (index < currentIndex) return 'done';
    if (index > currentIndex) return 'pending';
    return progress >= 100 ? 'done' : 'active';
  };

  return (
    <div className='flex h-full w-full flex-col overflow-hidden bg-bg-white-bg md:h-auto md:max-w-[816px] md:flex-row md:rounded-6 md:shadow-[0_20px_60px_-15px_rgba(33,33,52,0.25)]'>
      {/* Animation area — mobile: a fixed 192px band on top, full width;
          desktop: the left column of the modal. */}
      <div className='flex h-[192px] w-full shrink-0 items-center justify-center overflow-hidden bg-bg-light-grey md:h-auto md:w-[398px]'>
        <LottiePlayer
          animationData={audioToVideoAnimation}
          className='h-full w-full'
        />
      </div>

      {/* Content */}
      <div className='flex flex-1 flex-col justify-between gap-6 p-6 md:p-10'>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-desktop-title-4 text-text-primary'>Rendering your video...</h2>
            <p className='text-body-2 text-text-secondary'>It may take some time</p>
          </div>

          <div className='flex flex-col gap-2'>
            <div className='relative h-1 w-full overflow-hidden rounded'>
              <div className='absolute inset-0 rounded bg-primary/20' />
              <div
                className='absolute inset-y-0 left-0 rounded bg-primary transition-[width] duration-500 ease-out'
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className='text-body-2-emph text-text-primary'>{progress}%</span>
          </div>

          <ul className='flex flex-col gap-3'>
            {RENDER_STEPS.map((label, index) => (
              <StepRow
                key={label}
                label={label}
                status={statusOf(index)}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
