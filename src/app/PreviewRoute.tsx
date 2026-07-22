import { useNavigate, useParams } from 'react-router-dom';
import { conceptEntries } from './concepts';
import { ConceptView } from './conceptView';

export function PreviewRoute() {
  const { product, slug, page } = useParams();
  const navigate = useNavigate();
  const entry = conceptEntries().find((e) => e.product === product && e.slug === slug);
  if (!entry) return <p className="p-8">Unknown concept.</p>;
  return (
    <ConceptView
      entry={entry}
      pageParam={page}
      navigate={(s) => navigate(`/preview/${entry.product}/${entry.slug}/${s}`)}
      bare
    />
  );
}
