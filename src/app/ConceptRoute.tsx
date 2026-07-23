import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { conceptEntries } from './concepts';
import { ConceptView } from './conceptView';

export function ConceptRoute() {
  const { product, slug, page } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const entry = conceptEntries().find((e) => e.product === product && e.slug === slug);
  if (!entry) return <p className="p-8">Unknown concept.</p>;
  return (
    <ConceptView
      entry={entry}
      pageParam={page}
      navigate={(s) => navigate(`/c/${entry.product}/${entry.slug}/${s}`)}
      scenario={params.get('scenario') ?? 'default'}
    />
  );
}
