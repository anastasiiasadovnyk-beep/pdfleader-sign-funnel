import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Gallery } from './Gallery';
import { ConceptRoute } from './ConceptRoute';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/c/:product/:slug" element={<ConceptRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
