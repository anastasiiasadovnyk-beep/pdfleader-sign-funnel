import { Link } from 'react-router-dom';
import { conceptEntries } from './concepts';
import type { Brand } from './BrandProvider';

const PRODUCTS: { key: Brand; name: string }[] = [
  { key: 'pdfguru', name: 'PDF Guru' },
  { key: 'tbp', name: 'TheBestPDF' },
  { key: 'pdfleader', name: 'PDFLeader' },
];

export function Gallery() {
  const entries = conceptEntries();
  return (
    <main className="mx-auto flex max-w-[1100px] flex-col gap-10 p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-desktop-title-3">Vibe Concepts</h1>
        <p className="text-body text-text-secondary">
          Screen concepts on the ui-pes design system, grouped by product.
        </p>
      </header>
      {PRODUCTS.map(({ key, name }) => {
        const items = entries.filter((e) => e.product === key);
        return (
          <section key={key} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span data-brand={key} className="size-3 rounded-full bg-primary" />
              <h2 className="text-desktop-title-6">{name}</h2>
              <span className="text-caption text-text-secondary">
                {items.length} concept{items.length === 1 ? '' : 's'}
              </span>
            </div>
            {items.length === 0 ? (
              <p className="text-body-2 text-text-secondary">
                No concepts yet — ask Claude to build one for {name}.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((e) => (
                  <li key={e.slug}>
                    <Link
                      to={`/c/${e.product}/${e.slug}`}
                      data-brand={key}
                      className="flex flex-col gap-2 rounded-4 border border-action-stroke p-5 transition-colors hover:border-primary"
                    >
                      <span className="text-subtitle-emph text-text-primary">{e.title}</span>
                      <span className="text-caption text-text-secondary">
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
    </main>
  );
}
