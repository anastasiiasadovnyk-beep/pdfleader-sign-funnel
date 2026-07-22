import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyStructure } from './verify-structure.mjs';

test('single-page: reports missing required files', () => {
  const present = new Set(['/c/Screen.tsx', '/c/types.ts', '/c/mock.ts']);
  const findings = verifyStructure('/c', { exists: (p) => present.has(p), listDirs: () => [] });
  assert.ok(findings.some((f) => f.includes('meta.ts')));
  assert.ok(findings.some((f) => f.includes('INTEGRATION.md')));
});

test('single-page: clean when all present', () => {
  const all = new Set(['/c/Screen.tsx', '/c/types.ts', '/c/mock.ts', '/c/meta.ts', '/c/INTEGRATION.md']);
  assert.deepEqual(verifyStructure('/c', { exists: (p) => all.has(p), listDirs: () => [] }), []);
});

test('multipage: requires flow.ts set + each page files', () => {
  const present = new Set(['/c/flow.ts', '/c/meta.ts', '/c/INTEGRATION.md', '/c/pages/a/Screen.tsx']);
  const findings = verifyStructure('/c', {
    exists: (p) => present.has(p),
    listDirs: (d) => (d === '/c/pages' ? ['a'] : []),
  });
  assert.ok(findings.some((f) => f.includes('page "a" missing types.ts')));
  assert.ok(findings.some((f) => f.includes('page "a" missing mock.ts')));
});

test('multipage: clean when complete', () => {
  const all = new Set(['/c/flow.ts', '/c/meta.ts', '/c/INTEGRATION.md',
    '/c/pages/a/Screen.tsx', '/c/pages/a/types.ts', '/c/pages/a/mock.ts']);
  const findings = verifyStructure('/c', { exists: (p) => all.has(p), listDirs: (d) => (d === '/c/pages' ? ['a'] : []) });
  assert.deepEqual(findings, []);
});
