import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Badge } from '@universe-forma/ui-pes';
import { useConceptSearch } from './useConceptSearch';
import type { ConceptEntry } from './concepts';

const PRODUCT_LABEL: Record<string, string> = {
  pdfguru: 'PDF Guru',
  tbp: 'TheBestPDF',
  pdfleader: 'PDFLeader',
};

export function AppHeader() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const results = useConceptSearch(query);
  const showResults = open && results.length > 0;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function goTo(e: ConceptEntry) {
    const path = e.kind === 'multi' ? `/c/${e.product}/${e.slug}/${e.flow!.start}` : `/c/${e.product}/${e.slug}`;
    setQuery('');
    setOpen(false);
    navigate(path);
  }

  return (
    <div data-brand="pdfguru">
      <header className="sticky top-0 z-30 border-b border-action-stroke bg-bg-white-bg">
        <div className="mx-auto flex max-w-[1200px] items-center gap-6 px-6 py-3">
          <Link to="/gallery" className="flex items-center gap-2 shrink-0" onClick={() => setQuery('')}>
            <span className="size-2.5 rounded-full bg-primary" />
            <span className="text-subtitle-emph text-text-primary">Vibe Concepts</span>
          </Link>

          <div className="relative ml-auto w-full max-w-[320px]">
            <Search
              ref={inputRef}
              size="dense"
              bg="default"
              placeholder="Search concepts… ( / )"
              value={query}
              showSubmitButton={false}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => query.trim() && setOpen(true)}
              onClear={() => {
                setQuery('');
                setOpen(false);
              }}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              onKeyDownCapture={(e) => {
                if (e.key === 'Escape') {
                  setOpen(false);
                  inputRef.current?.blur();
                }
              }}
            />

            {showResults && (
              <ul className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-[70vh] overflow-y-auto rounded-5 border border-action-stroke bg-bg-white-bg p-2 shadow-[0_14px_34px_-18px_rgba(0,0,0,0.35)]">
                {results.map((e) => (
                  <li key={`${e.product}/${e.slug}`}>
                    <button
                      type="button"
                      onMouseDown={(ev) => ev.preventDefault()}
                      onClick={() => goTo(e)}
                      className="flex w-full cursor-pointer flex-col gap-1 rounded-3 p-2.5 text-left outline-none hover:bg-bg-light-grey"
                    >
                      <div className="flex items-center gap-2">
                        <Badge type="badge" color="action" size="dense">
                          {PRODUCT_LABEL[e.product] ?? e.product}
                        </Badge>
                        <span className="text-body-2 text-text-primary">{e.title}</span>
                      </div>
                      <span className="text-caption-xs text-text-secondary font-mono">
                        /c/{e.product}/{e.slug}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
