import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Gallery } from './Gallery';
import { ConceptRoute } from './ConceptRoute';
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
      </Routes>
    </BrowserRouter>
  );
}
