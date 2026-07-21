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
      <main className="mx-auto flex max-w-[1160px] flex-col gap-8 px-6 py-8">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-action-stroke pb-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              {PRODUCTS.map((p) => (
                <span key={p.key} data-brand={p.key} className="h-1.5 w-8 rounded-full bg-primary" />
              ))}
            </div>
            <h1 className="text-desktop-title-3">Vibe Concepts</h1>
            <p className="text-body-2 text-text-secondary max-w-[64ch]">
              Screen concepts on the <span className="text-text-primary">ui-pes</span> design system — previewed
              in each product&apos;s real brand, handed off as integration-ready code.
            </p>
          </div>
          <span className="text-caption text-text-secondary">
            {entries.length} concept{entries.length === 1 ? '' : 's'} · {PRODUCTS.length} products
          </span>
        </header>

        {PRODUCTS.map(({ key, name, tagline }) => {
          const items = entries.filter((e) => e.product === key);
          return (
            <section key={key} data-brand={key} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-2.5">
                <span className="size-3 rounded-full bg-primary" />
                <h2 className="text-desktop-title-6">{name}</h2>
                <span className="text-caption-xs text-text-secondary font-mono">{tagline}</span>
                <span className="text-caption-xs text-text-secondary ml-auto">
                  {items.length} concept{items.length === 1 ? '' : 's'}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="rounded-5 border border-dashed border-action-stroke p-5">
                  <p className="text-caption text-text-secondary">
                    No concepts yet — ask Claude to build one for {name}.
                  </p>
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {items.map((e) => (
                    <li key={e.slug}>
                      <Link
                        to={`/c/${e.product}/${e.slug}`}
                        className="group flex h-full min-h-[6.5rem] flex-col gap-3 rounded-5 border border-action-stroke bg-bg-white-bg p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_14px_34px_-18px_rgba(0,0,0,0.35)]"
                      >
                        <div className="flex items-start justify-between gap-2">
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

        <footer className="border-t border-action-stroke pt-4">
          <p className="text-caption-xs text-text-secondary">
            Run Claude and describe a screen for a product — the new concept appears here automatically.
          </p>
        </footer>
      </main>
    </div>
  );
}
