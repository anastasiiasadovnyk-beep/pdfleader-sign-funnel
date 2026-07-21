import { conceptScreens, conceptDirs } from './lib/scan.mjs';
import { verifyStructure } from './verify-structure.mjs';
import { lintHardcodes } from './lint-hardcodes.mjs';
import { verifyStates } from './verify-states.mjs';
import { validateTokens, loadColorCatalog } from './validate-tokens.mjs';

const only = process.argv[2];
const catalog = loadColorCatalog();
let failed = false;

for (const { dir } of conceptDirs()) {
  if (only && !dir.includes(only)) continue;
  const findings = verifyStructure(dir);
  if (findings.length) {
    failed = true;
    console.error(`\n✗ ${dir}`);
    findings.forEach((f) => console.error(`  - ${f}`));
  } else {
    console.log(`✓ ${dir} (structure)`);
  }
}

for (const { file, src } of conceptScreens()) {
  if (only && !file.includes(only)) continue;
  const findings = [...lintHardcodes(src), ...verifyStates(src), ...validateTokens(src, catalog)];
  if (findings.length) {
    failed = true;
    console.error(`\n✗ ${file}`);
    findings.forEach((f) => console.error(`  - ${f}`));
  } else {
    console.log(`✓ ${file}`);
  }
}

if (failed) process.exit(1);
console.log('\nAll gates passed.');
