import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { conceptEntries } from './concepts';
import type { ConceptEntry } from './concepts';
import { BrandProvider } from './BrandProvider';
import { FlowBar } from './FlowBar';
import { resolvePage, nextTargets, prevSlug } from './flowNav';

export function ConceptRoute() {
  const { product, slug, page } = useParams();
  const navigate = useNavigate();
  const entry = conceptEntries().find((e) => e.product === product && e.slug === slug);
  if (!entry) return <p className="p-8">Unknown concept.</p>;
  return entry.kind === 'multi'
    ? <MultiPage entry={entry} pageParam={page} navigate={(s) => navigate(`/c/${entry.product}/${entry.slug}/${s}`)} />
    : <SinglePage entry={entry} />;
}

function SinglePage({ entry }: { entry: ConceptEntry }) {
  const [mock, setMock] = useState<unknown>(null);
  useEffect(() => { entry.loadMock().then((m) => setMock(m.default)).catch((e) => console.error('mock load failed', e)); }, [entry]);
  const Screen = useMemo(() => lazy(entry.load), [entry]);
  return (
    <BrandProvider brand={entry.brand}>
      <Suspense fallback={<p className="p-8">Loading…</p>}>
        {mock !== null && <Screen {...(mock as object)} />}
      </Suspense>
    </BrandProvider>
  );
}

function MultiPage({ entry, pageParam, navigate }: { entry: ConceptEntry; pageParam?: string; navigate: (slug: string) => void }) {
  const flow = entry.flow!;
  const current = resolvePage(flow, pageParam);
  const pageEntry = entry.pages!.find((p) => p.slug === current)!;
  const [mock, setMock] = useState<unknown>(null);
  useEffect(() => { pageEntry.loadMock().then((m) => setMock(m.default)).catch((e) => console.error('mock load failed', e)); }, [pageEntry]);
  const Screen = useMemo(() => lazy(pageEntry.load), [pageEntry]);
  const targets = nextTargets(flow, current);
  const back = prevSlug(flow, current);
  const onNext = () => { if (targets[0]) navigate(targets[0]); };
  const onBack = () => { if (back) navigate(back); };
  return (
    <BrandProvider brand={entry.brand}>
      <Suspense fallback={<p className="p-8">Loading…</p>}>
        {mock !== null && <Screen {...(mock as object)} onNext={onNext} onBack={onBack} />}
      </Suspense>
      <FlowBar flow={flow} current={current} onJump={navigate} />
    </BrandProvider>
  );
}
