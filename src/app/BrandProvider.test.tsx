import { render } from '@testing-library/react';
import { BrandProvider } from './BrandProvider';

test('sets data-brand attribute on wrapper', () => {
  const { container } = render(<BrandProvider brand="tbp">x</BrandProvider>);
  expect(container.querySelector('[data-brand="tbp"]')).not.toBeNull();
});
