import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Gallery } from './Gallery';
import { ConceptRoute } from './ConceptRoute';
import { PreviewRoute } from './PreviewRoute';
import { AppLayout } from './AppLayout';

/**
 * The root path serves two audiences, so it depends on the build:
 *
 * - **dev** — the sandbox gallery, so every concept is browsable with the app
 *   header (search / back to gallery) and, inside a multipage concept, the flow
 *   bar along the bottom.
 * - **built** — straight to the sign funnel with no sandbox chrome at all. The
 *   deployed URL is what usability-test participants open, and they must not see
 *   the gallery header, the flow bar or the analytics overlay.
 *
 * Every other route exists in both builds: `/gallery`, `/c/*` with chrome, and
 * `/preview/*` bare. `import.meta.env.PROD` is inlined at build time, so the
 * unused branch is dropped from the bundle.
 */
const HOME = import.meta.env.PROD ? '/preview/pdfleader/sign-funnel' : '/gallery';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={HOME} replace />} />
        <Route element={<AppLayout />}>
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/c/:product/:slug" element={<ConceptRoute />} />
          <Route path="/c/:product/:slug/:page" element={<ConceptRoute />} />
        </Route>
        <Route path="/preview/:product/:slug" element={<PreviewRoute />} />
        <Route path="/preview/:product/:slug/:page" element={<PreviewRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
