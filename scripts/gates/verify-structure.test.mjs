import { verifyStructure } from './verify-structure.mjs';

test('flags a concept missing its INTEGRATION.md spec', () => {
  const present = new Set(['Screen.tsx', 'types.ts', 'mock.ts', 'meta.ts'].map((f) => `d/${f}`));
  const findings = verifyStructure('d', (p) => present.has(p));
  expect(findings).toHaveLength(1);
  expect(findings[0]).toMatch(/INTEGRATION\.md/);
});

test('passes a complete concept', () => {
  const findings = verifyStructure('d', () => true);
  expect(findings).toEqual([]);
});
