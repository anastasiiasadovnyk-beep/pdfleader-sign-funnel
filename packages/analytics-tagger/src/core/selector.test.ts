import { anchorFor } from './selector';

test('anchorFor returns a working unique selector + metadata', () => {
  document.body.innerHTML = `<main><button id="a" aria-label="Upload">Upload PDF</button><button>Other</button></main>`;
  const btn = document.getElementById('a')!;
  const anchor = anchorFor(btn);
  expect(anchor.tag).toBe('button');
  expect(anchor.label).toBe('Upload');
  expect(typeof anchor.selector).toBe('string');
  expect(anchor.selector.length).toBeGreaterThan(0);
  expect(document.querySelector(anchor.selector)).toBe(btn);
});
