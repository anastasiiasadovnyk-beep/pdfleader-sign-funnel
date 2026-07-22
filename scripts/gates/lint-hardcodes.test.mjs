import { lintHardcodes } from './lint-hardcodes.mjs';

test('flags raw hex and raw tailwind palette utility', () => {
  const bad = `<div className="bg-gray-500" style={{ color: '#ff0000' }} />`;
  const findings = lintHardcodes(bad);
  expect(findings.length).toBeGreaterThanOrEqual(2);
});

test('passes clean token-based markup', () => {
  const good = `<div className="bg-bg-white-bg text-text-primary rounded-2" />`;
  expect(lintHardcodes(good)).toEqual([]);
});

test('does not flag bracket className values like max-w-[720px]', () => {
  const good = `<section className="mx-auto flex max-w-[720px] flex-col items-center gap-4 px-4 py-24 text-center" />`;
  expect(lintHardcodes(good)).toEqual([]);
});

test('allows a hex inside a Tailwind arbitrary color value but bans bare hex', () => {
  expect(lintHardcodes(`<div className="bg-[#5f30e2] text-[#ffffff]" />`)).toEqual([]);
  expect(lintHardcodes(`<div className="bg-[#5f30e2]" style={{ color: '#ff0000' }} />`).length).toBeGreaterThanOrEqual(1);
});

test('flags a raw px style value', () => {
  const bad = `<div style={{ marginTop: 12px }} />`;
  expect(lintHardcodes(bad).length).toBeGreaterThanOrEqual(1);
});
