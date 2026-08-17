import { lazy, Suspense, useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import type { ConceptEntry } from './concepts';
import { BrandProvider } from './BrandProvider';
import { FlowBar } from './FlowBar';
import { resolvePage, nextTargets, prevSlug } from './flowNav';
import { AnalyticsTagger } from '@universe-forma/analytics-tagger';

type Loader = () => Promise<{ default: ComponentType<any> }>;
type MockLoader = () => Promise<Record<string, unknown>>;

const lazyCache = new Map<string, ComponentType<any>>();
function lazyFor(key: string, load: Loader): ComponentType<any> {
  let c = lazyCache.get(key);
  if (!c) {
    c = lazy(load);
    lazyCache.set(key, c);
  }
  return c;
}

// A mock module exports `default` (the base scenario) plus optional named scenarios
// (`export const empty = …`). ?scenario=<name> picks one; unknown names fall back to default.
function usePageMock(key: string, load: MockLoader, scenario: string) {
  // Stamped with the key+scenario it belongs to: on a page change the new Screen
  // would otherwise render once with the previous page's mock (it is cleared in
  // an effect, i.e. after that render) and crash on props it never had.
  const [loaded, setLoaded] = useState<{ id: string; mock: unknown } | null>(null);
  const id = `${key}|${scenario}`;
  useEffect(() => {
    let alive = true;
    load()
      .then((m) => alive && setLoaded({ id, mock: (scenario !== 'default' && m[scenario]) || m.default }))
      .catch((e) => console.error('mock load failed', e));
    return () => { alive = false; };
    // key + scenario identify what to render; load is stable for a given key
  }, [key, scenario]);
  return loaded && loaded.id === id ? loaded.mock : null;
}

// bare drops the sandbox chrome (FlowBar, analytics overlay) so an isolated /preview render
// contains only the concept — screenshots aren't contaminated by the app shell.
export function ConceptView({ entry, pageParam, navigate, bare = false, scenario = 'default' }: {
  entry: ConceptEntry;
  pageParam?: string;
  navigate: (slug: string) => void;
  bare?: boolean;
  scenario?: string;
}) {
  return entry.kind === 'multi'
    ? <MultiPage entry={entry} pageParam={pageParam} navigate={navigate} bare={bare} scenario={scenario} />
    : <SinglePage entry={entry} bare={bare} scenario={scenario} />;
}

function SinglePage({ entry, bare, scenario }: { entry: ConceptEntry; bare: boolean; scenario: string }) {
  const key = `${entry.product}/${entry.slug}`;
  const mock = usePageMock(key, entry.loadMock, scenario);
  const Screen = lazyFor(key, entry.load);
  return (
    <BrandProvider brand={entry.brand}>
      <Suspense fallback={<p className="p-8">Loading…</p>}>
        {mock !== null && <Screen {...(mock as object)} />}
      </Suspense>
      {!bare && <AnalyticsTagger product={entry.product} concept={entry.slug} page="screen" />}
    </BrandProvider>
  );
}

function MultiPage({ entry, pageParam, navigate, bare, scenario }: { entry: ConceptEntry; pageParam?: string; navigate: (slug: string) => void; bare: boolean; scenario: string }) {
  const flow = entry.flow!;
  const current = resolvePage(flow, pageParam);
  const pageEntry = entry.pages!.find((p) => p.slug === current)!;
  const key = `${entry.product}/${entry.slug}/${current}`;
  const mock = usePageMock(key, pageEntry.loadMock, scenario);
  const Screen = lazyFor(key, pageEntry.load);
  const targets = nextTargets(flow, current);
  const back = prevSlug(flow, current);
  const onNext = () => { if (targets[0]) navigate(targets[0]); };
  // Lets a page send the user back to the beginning of its flow.
  const onRestart = () => navigate(flow.start);
  const onBack = () => { if (back) navigate(back); };
  return (
    <BrandProvider brand={entry.brand}>
      <Suspense fallback={<p className="p-8">Loading…</p>}>
        {mock !== null && <Screen key={key} {...(mock as object)} onNext={onNext} onBack={onBack} onRestart={onRestart} />}
      </Suspense>
      {!bare && <FlowBar flow={flow} current={current} onJump={navigate} />}
      {!bare && <AnalyticsTagger product={entry.product} concept={entry.slug} page={current} />}
    </BrandProvider>
  );
}
