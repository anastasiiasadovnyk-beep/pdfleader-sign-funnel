import { lazy, Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { conceptEntries } from './concepts';
import { BrandProvider } from './BrandProvider';

export function ConceptRoute() {
  const { slug } = useParams();
  const entry = conceptEntries().find((e) => e.slug === slug);
  const [mock, setMock] = useState<unknown>(null);
  useEffect(() => { entry?.loadMock().then((m) => setMock(m.default)).catch((e) => console.error('mock load failed', e)); }, [slug]);
  if (!entry) return <p className="p-8">Unknown concept.</p>;
  const Screen = lazy(entry.load);
  return (
    <BrandProvider brand={entry.brand}>
      <Suspense fallback={<p className="p-8">Loading…</p>}>
        {mock !== null && <Screen {...(mock as object)} />}
      </Suspense>
    </BrandProvider>
  );
}
