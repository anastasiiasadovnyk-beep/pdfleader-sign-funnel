import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

export function conceptScreens() {
  const root = 'src/concepts';
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter((d) => !d.startsWith('_'))
    .map((d) => path.join(root, d, 'Screen.tsx'))
    .filter(existsSync)
    .map((f) => ({ file: f, src: readFileSync(f, 'utf8') }));
}
