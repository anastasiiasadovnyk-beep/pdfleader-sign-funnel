import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Gallery } from './Gallery';
import { ConceptRoute } from './ConceptRoute';
import { PreviewRoute } from './PreviewRoute';
import { AppLayout } from './AppLayout';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Gallery />} />
          <Route path="/c/:product/:slug" element={<ConceptRoute />} />
          <Route path="/c/:product/:slug/:page" element={<ConceptRoute />} />
        </Route>
        <Route path="/preview/:product/:slug" element={<PreviewRoute />} />
        <Route path="/preview/:product/:slug/:page" element={<PreviewRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
