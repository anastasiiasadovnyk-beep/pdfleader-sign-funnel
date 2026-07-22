import { lazy, Suspense, useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import type { ConceptEntry } from './concepts';
import { BrandProvider } from './BrandProvider';
import { FlowBar } from './FlowBar';
import { resolvePage, nextTargets, prevSlug } from './flowNav';
import { AnalyticsTagger } from '@universe-forma/analytics-tagger';

type Loader = () => Promise<{ default: ComponentType<any> }>;
type MockLoader = () => Promise<{ default: unknown }>;

const lazyCache = new Map<string, ComponentType<any>>();
function lazyFor(key: string, load: Loader): ComponentType<any> {
  let c = lazyCache.get(key);
  if (!c) {
    c = lazy(load);
    lazyCache.set(key, c);
  }
  return c;
}

function usePageMock(key: string, load: MockLoader) {
  const [mock, setMock] = useState<unknown>(null);
  useEffect(() => {
    let alive = true;
    setMock(null);
    load().then((m) => alive && setMock(m.default)).catch((e) => console.error('mock load failed', e));
    return () => { alive = false; };
    // key identifies the page; load is stable for a given key
  }, [key]);
  return mock;
}

// bare drops the sandbox chrome (FlowBar, analytics overlay) so an isolated /preview render
// contains only the concept — screenshots aren't contaminated by the app shell.
export function ConceptView({ entry, pageParam, navigate, bare = false }: {
  entry: ConceptEntry;
  pageParam?: string;
  navigate: (slug: string) => void;
  bare?: boolean;
}) {
  return entry.kind === 'multi'
    ? <MultiPage entry={entry} pageParam={pageParam} navigate={navigate} bare={bare} />
    : <SinglePage entry={entry} bare={bare} />;
}

function SinglePage({ entry, bare }: { entry: ConceptEntry; bare: boolean }) {
  const key = `${entry.product}/${entry.slug}`;
  const mock = usePageMock(key, entry.loadMock);
  const Screen = lazyFor(key, entry.load);
  return (
    <BrandProvider brand={entry.brand}>
      <Suspense fallback={<p className="p-8">Loading…</p>}>
        {mock !== null && <Screen {...(mock as object)} />}
      </Suspense>
      {!bare && import.meta.env.DEV && <AnalyticsTagger product={entry.product} concept={entry.slug} page="screen" />}
    </BrandProvider>
  );
}

function MultiPage({ entry, pageParam, navigate, bare }: { entry: ConceptEntry; pageParam?: string; navigate: (slug: string) => void; bare: boolean }) {
  const flow = entry.flow!;
  const current = resolvePage(flow, pageParam);
  const pageEntry = entry.pages!.find((p) => p.slug === current)!;
  const key = `${entry.product}/${entry.slug}/${current}`;
  const mock = usePageMock(key, pageEntry.loadMock);
  const Screen = lazyFor(key, pageEntry.load);
  const targets = nextTargets(flow, current);
  const back = prevSlug(flow, current);
  const onNext = () => { if (targets[0]) navigate(targets[0]); };
  const onBack = () => { if (back) navigate(back); };
  return (
    <BrandProvider brand={entry.brand}>
      <Suspense fallback={<p className="p-8">Loading…</p>}>
        {mock !== null && <Screen key={key} {...(mock as object)} onNext={onNext} onBack={onBack} />}
      </Suspense>
      {!bare && <FlowBar flow={flow} current={current} onJump={navigate} />}
      {!bare && import.meta.env.DEV && <AnalyticsTagger product={entry.product} concept={entry.slug} page={current} />}
    </BrandProvider>
  );
}
