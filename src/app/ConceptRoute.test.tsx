import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { FlowBar } from './FlowBar';
import type { Flow } from './concepts';

const flow: Flow = { start: 'a', pages: [
  { slug: 'a', title: 'A', next: 'b' }, { slug: 'b', title: 'B' },
] };

test('FlowBar renders step position and a button per page', () => {
  render(
    <MemoryRouter>
      <Routes>
        <Route path="*" element={<FlowBar flow={flow} current="a" onJump={() => {}} />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByText(/step 1 of 2/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'B' })).toBeInTheDocument();
});
