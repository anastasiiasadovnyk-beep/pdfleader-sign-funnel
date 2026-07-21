import { Link } from 'react-router-dom';
import { conceptEntries } from './concepts';

export function Gallery() {
  const entries = conceptEntries();
  return (
    <main className="p-8">
      <h1 className="text-desktop-title-3 mb-6">Vibe Concepts</h1>
      {entries.length === 0 && <p className="text-body">No concepts yet. Ask Claude to build one.</p>}
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {entries.map((e) => (
          <li key={e.slug} className="rounded-3 border border-action-stroke p-4">
            <Link to={`/c/${e.slug}`} className="text-subtitle-emph">{e.title}</Link>
            <p className="text-caption text-text-secondary">{e.brand}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
