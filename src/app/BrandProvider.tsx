import type { ReactNode } from 'react';

export type Brand = 'pdfguru' | 'tbp' | 'pdfleader';

export function BrandProvider({ brand, children }: { brand: Brand; children: ReactNode }) {
  return <div data-brand={brand} className="min-h-screen bg-bg-white-bg text-text-primary">{children}</div>;
}
