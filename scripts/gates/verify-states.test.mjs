import { verifyStates } from './verify-states.mjs';

test('flags a button with onClick but no disabled handling', () => {
  const src = `<button onClick={go}>Go</button>`;
  expect(verifyStates(src).length).toBeGreaterThanOrEqual(1);
});

test('passes a native button with disabled handling', () => {
  const src = `<button onClick={go} disabled={isLoading}>Go</button>`;
  expect(verifyStates(src)).toEqual([]);
});

test('passes markup with no native button at all', () => {
  const src = `<Button onClick={go}>Go</Button>`;
  expect(verifyStates(src)).toEqual([]);
});
