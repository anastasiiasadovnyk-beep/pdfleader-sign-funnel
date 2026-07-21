import { existsSync } from 'node:fs';
import path from 'node:path';

export const REQUIRED_FILES = ['Screen.tsx', 'types.ts', 'mock.ts', 'meta.ts', 'INTEGRATION.md'];

export function verifyStructure(dir, exists = existsSync) {
  return REQUIRED_FILES.filter((f) => !exists(path.join(dir, f))).map(
    (f) => `missing required file: ${f} (every concept must ship one, incl. the INTEGRATION.md spec)`,
  );
}
