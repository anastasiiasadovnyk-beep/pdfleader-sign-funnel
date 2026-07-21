import { Link } from 'react-router-dom';
import { conceptEntries } from './concepts';
import type { Brand } from './BrandProvider';

const PRODUCTS: { key: Brand; name: string; tagline: string }[] = [
  { key: 'pdfguru', name: 'PDF Guru', tagline: 'pdfguru-fe' },
  { key: 'tbp', name: 'TheBestPDF', tagline: 'tbp-fe' },
  { key: 'pdfleader', name: 'PDFLeader', tagline: 'pdfleader-fe' },
];

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-4 shrink-0" aria-hidden>
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Gallery() {
  const entries = conceptEntries();
  return (
    <div data-brand="pdfguru" className="min-h-screen bg-bg-light-grey text-text-primary">
      <main className="mx-auto flex max-w-[1120px] flex-col gap-16 px-6 py-16">
        <header className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            {PRODUCTS.map((p) => (
              <span key={p.key} data-brand={p.key} className="h-1.5 w-10 rounded-full bg-primary" />
            ))}
          </div>
          <p className="text-caption-overline text-text-secondary uppercase">Design sandbox</p>
          <h1 className="text-desktop-title-1 max-w-[16ch]">Vibe Concepts</h1>
          <p className="text-subtitle text-text-secondary max-w-[60ch]">
            Screen concepts built on the <span className="text-text-primary">ui-pes</span> design system —
            previewed here in each product&apos;s real brand, then handed off as integration-ready code.
          </p>
          <span className="text-caption text-text-secondary">
            {entries.length} concept{entries.length === 1 ? '' : 's'} across {PRODUCTS.length} products
          </span>
        </header>

        {PRODUCTS.map(({ key, name, tagline }) => {
          const items = entries.filter((e) => e.product === key);
          return (
            <section key={key} data-brand={key} className="flex flex-col gap-6">
              <div className="flex items-baseline gap-3 border-b border-action-stroke pb-4">
                <span className="size-3.5 rounded-full bg-primary" />
                <h2 className="text-desktop-title-5">{name}</h2>
                <span className="text-caption text-text-secondary">{tagline}</span>
                <span className="text-caption text-text-secondary ml-auto">
                  {items.length} concept{items.length === 1 ? '' : 's'}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="rounded-6 border border-dashed border-action-stroke bg-bg-white-bg/40 p-8 text-center">
                  <p className="text-body-2 text-text-secondary">
                    No concepts yet — ask Claude to build one for {name}.
                  </p>
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((e) => (
                    <li key={e.slug}>
                      <Link
                        to={`/c/${e.product}/${e.slug}`}
                        className="group flex h-full min-h-[9rem] flex-col gap-4 rounded-6 border border-action-stroke bg-bg-white-bg p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.35)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-subtitle-emph text-text-primary">{e.title}</span>
                          <span className="text-primary transition-transform duration-200 group-hover:translate-x-1">
                            <Arrow />
                          </span>
                        </div>
                        <span className="text-caption-xs text-text-secondary mt-auto font-mono">
                          /c/{e.product}/{e.slug}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}

        <footer className="border-t border-action-stroke pt-6">
          <p className="text-caption text-text-secondary">
            Run Claude and describe a screen for a product to add a concept — it appears here automatically.
          </p>
        </footer>
      </main>
    </div>
  );
}
