import { type FC } from 'react';

import { Button } from '@universe-forma/ui-pes';

import logoUrl from 'assets/img/new-logo-pdf-guru.svg';

/** Top navigation shown above the hero. Matches the marketing header layout. */
const NAV_LINKS = ['Edit & Sign PDF', 'Convert PDF', 'Forms', 'AI PDF Summarizer'] as const;

export const LandingHeader: FC = () => (
  <header className='flex w-full items-center justify-between gap-6 px-6 py-4 sm:px-10'>
    <img
      src={logoUrl}
      alt='PDF Guru'
      className='h-7 w-auto'
    />

    <nav className='hidden items-center gap-8 md:flex'>
      {NAV_LINKS.map((link) => (
        <button
          key={link}
          type='button'
          className='text-body-2 text-text-primary transition-colors hover:text-primary'
        >
          {link}
        </button>
      ))}
    </nav>

    <Button
      variant='outlined'
      color='action'
      size='md'
    >
      Log in
    </Button>
  </header>
);
