export function verifyStates(src) {
  const findings = [];
  const hasNativeButton = /<button\b/.test(src);
  if (hasNativeButton && !/disabled/.test(src)) findings.push('native <button> without disabled handling — use ui-pes Button or add disabled');
  return findings;
}
