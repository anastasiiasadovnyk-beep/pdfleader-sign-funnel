import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Gallery } from './Gallery';
import { ConceptRoute } from './ConceptRoute';
import { PreviewRoute } from './PreviewRoute';
import { AppLayout } from './AppLayout';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*
         * Opening the app lands on the sign funnel with no sandbox chrome — the
         * /preview routes render the concept alone (no gallery header, no flow
         * bar, no analytics overlay), which is what usability testing needs.
         * The gallery is still there at /gallery.
         */}
        <Route path="/" element={<Navigate to="/preview/pdfleader/sign-funnel" replace />} />
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
