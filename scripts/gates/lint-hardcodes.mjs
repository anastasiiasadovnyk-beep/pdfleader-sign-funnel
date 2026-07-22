// bare hex is banned; a hex inside a Tailwind arbitrary value (bg-[#hex]) is the flagged
// last-resort escape for a brand color with no matching token — allowed, like max-w-[..].
const RAW_HEX = /(?<!\[)#[0-9a-fA-F]{3,8}\b/;
const RAW_PX = /:\s*\d+px/;
const RAW_PALETTE = /\b(?:bg|text|border)-(?:gray|slate|zinc|red|blue|green|yellow|neutral)-\d{2,3}\b/;

export function lintHardcodes(src) {
  const findings = [];
  if (RAW_HEX.test(src)) findings.push('raw hex color — use a ui-pes color token utility');
  if (RAW_PALETTE.test(src)) findings.push('raw tailwind palette utility — use a semantic ui-pes token');
  if (RAW_PX.test(src)) findings.push('raw px value — prefer a spacing/radius token utility');
  return findings;
}
