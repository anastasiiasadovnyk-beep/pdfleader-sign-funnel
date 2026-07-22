import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

export const SINGLE_REQUIRED = ['Screen.tsx', 'types.ts', 'mock.ts', 'meta.ts', 'INTEGRATION.md'];
export const MULTI_CONCEPT_REQUIRED = ['flow.ts', 'meta.ts', 'INTEGRATION.md'];
export const MULTI_PAGE_REQUIRED = ['Screen.tsx', 'types.ts', 'mock.ts'];

const defaultListDirs = (d) =>
  existsSync(d) ? readdirSync(d).filter((n) => statSync(path.join(d, n)).isDirectory()) : [];

export function verifyStructure(dir, deps = {}) {
  const exists = deps.exists ?? existsSync;
  const listDirs = deps.listDirs ?? defaultListDirs;

  if (exists(path.join(dir, 'flow.ts'))) {
    const findings = MULTI_CONCEPT_REQUIRED.filter((f) => !exists(path.join(dir, f))).map(
      (f) => `missing required file: ${f}`,
    );
    const pagesDir = path.join(dir, 'pages');
    const pages = listDirs(pagesDir);
    if (!pages.length) findings.push('multipage concept has no pages/ subfolders');
    for (const pg of pages) {
      for (const f of MULTI_PAGE_REQUIRED) {
        if (!exists(path.join(pagesDir, pg, f))) findings.push(`page "${pg}" missing ${f}`);
      }
    }
    return findings;
  }

  return SINGLE_REQUIRED.filter((f) => !exists(path.join(dir, f))).map(
    (f) => `missing required file: ${f} (every concept must ship one, incl. the INTEGRATION.md spec)`,
  );
}
