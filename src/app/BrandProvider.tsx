import { useEffect } from 'react';
import type { ReactNode } from 'react';

export type Brand = 'pdfguru' | 'tbp' | 'pdfleader';

// The brand attribute must live on <html> (= :root), not just a nested div: ui-pes's theme.css emits
// its type-token indirection (--text-x: var(--text-x-size)) at :root, so the brand's --text-x-size
// values have to be in :root scope to resolve. Scoped only to a child, font sizes silently fall back.
export function BrandProvider({ brand, children }: { brand: Brand; children: ReactNode }) {
  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-brand');
    document.documentElement.setAttribute('data-brand', brand);
    return () => {
      if (prev) document.documentElement.setAttribute('data-brand', prev);
      else document.documentElement.removeAttribute('data-brand');
    };
  }, [brand]);
  return <div data-brand={brand} className="min-h-screen bg-bg-white-bg text-text-primary">{children}</div>;
}
