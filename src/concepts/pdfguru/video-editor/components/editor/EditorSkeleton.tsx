import { type FC } from 'react';

import { cn } from '@universe-forma/ui-pes';

import logoMark from '../../assets/pdf-guru-mark.svg';

/** A pulsing grey placeholder block. */
const Skel: FC<{ className?: string }> = ({ className }) => (
  <span className={cn('block animate-pulse rounded-2 bg-os-divider', className)} />
);

/**
 * Editor loading state — a greyed-out skeleton of the editor frame, shown for a
 * few seconds after the upload while the editor boots, then replaced by the live
 * editor. Responsive: desktop shows the tool rail + content drawer; mobile shows
 * the stage, timeline and bottom tool bar.
 */
export const EditorSkeleton: FC = () => (
  <div className='flex h-screen w-full flex-col overflow-hidden bg-bg-light-grey'>
    {/* Header */}
    <header className='relative flex items-center justify-between gap-4 px-4 py-3 md:h-[72px] md:py-0'>
      <div className='flex min-w-0 items-center gap-3'>
        <img
          src={logoMark}
          alt='PDF Guru'
          className='size-[55px] shrink-0'
        />
        {/* desktop: project-name placeholder */}
        <Skel className='hidden h-8 w-52 rounded-3 md:block' />
      </div>
      {/* mobile: undo / redo placeholders — centered */}
      <span className='absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 md:hidden'>
        <Skel className='size-8' />
        <Skel className='size-8' />
      </span>
      <div className='flex items-center gap-2'>
        <Skel className='hidden size-9 md:block' />
        <Skel className='h-9 w-24' />
      </div>
    </header>

    <div className='flex min-h-0 flex-1'>
      {/* Sidebar (desktop): tool-rail icon placeholders + drawer placeholders */}
      <div className='hidden h-full shrink-0 pb-3 pl-3 md:flex'>
        <div className='flex h-full overflow-hidden rounded-6 bg-bg-white-bg shadow-[0_8px_30px_-10px_rgba(33,33,52,0.18)]'>
          <div className='flex h-full w-[84px] shrink-0 flex-col items-center gap-1 overflow-hidden border-r border-os-divider p-2'>
            {Array.from({ length: 9 }).map((_, index) => (
              <Skel
                key={index}
                className='size-[68px] shrink-0'
              />
            ))}
          </div>
          <div className='flex w-[292px] flex-col gap-4 p-4'>
            <Skel className='h-6 w-40' />
            <Skel className='h-9 w-full rounded-3' />
            <Skel className='h-4 w-28' />
            <div className='flex flex-wrap gap-2'>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skel
                  key={index}
                  className='h-7 w-16 rounded-full'
                />
              ))}
            </div>
            <Skel className='h-10 w-full rounded-3' />
            <div className='grid grid-cols-2 gap-4'>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skel
                  key={index}
                  className='h-[92px] rounded-3'
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main: empty stage + timeline placeholder */}
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <div className='flex flex-1 items-center justify-center p-4 md:p-8'>
          <div className='aspect-video w-full max-w-3xl rounded-2 bg-bg-white-bg' />
        </div>
        <div className='flex flex-col rounded-t-5 bg-bg-white-bg md:mx-3 md:mb-3 md:rounded-6'>
          <div className='flex items-center gap-3 px-4 py-3'>
            <Skel className='size-6' />
            <Skel className='size-6' />
            <div className='mx-auto flex items-center gap-2'>
              <Skel className='size-6' />
              <Skel className='size-8 rounded-full' />
              <Skel className='size-6' />
              <Skel className='ml-2 h-5 w-24' />
            </div>
            <Skel className='size-6' />
            <Skel className='hidden h-4 w-24 md:block' />
            <Skel className='size-6' />
          </div>
          <div className='h-40' />
        </div>
      </div>
    </div>

    {/* Mobile bottom tool bar: icon + label placeholders */}
    <div className='flex items-center gap-4 overflow-hidden border-t border-os-divider px-3 py-2 md:hidden'>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className='flex flex-col items-center gap-1'
        >
          <Skel className='size-8' />
          <Skel className='h-2 w-10 rounded-full' />
        </span>
      ))}
    </div>
  </div>
);
