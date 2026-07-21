// CSS-var regex adapted from the MIT-licensed uxKero/anydesign project (attribution: VENDOR.md).
const CSS_VAR_RE = /--([A-Za-z0-9_-]+)\s*:\s*([^;}]+?)\s*(?:!important\s*)?(?:;|(?=\}))/gs;

const categorize = (name) => {
  if (name.startsWith('color-')) return 'color';
  if (name.startsWith('radius-')) return 'radius';
  if (name.startsWith('spacing-') || name.startsWith('space-')) return 'spacing';
  if (name.startsWith('breakpoint-')) return 'breakpoint';
  if (name.startsWith('font-') || name.includes('text-')) return 'typography';
  return 'other';
};

export function parseCssVars(css) {
  const out = [];
  for (const m of css.matchAll(CSS_VAR_RE)) {
    out.push({ name: m[1], value: m[2].trim(), category: categorize(m[1]) });
  }
  return out;
}

export function tailwindUtilFor(name) {
  if (name.startsWith('color-')) {
    const base = name.replace(/^color-/, '');
    return `bg-${base} / text-${base} / border-${base}`;
  }
  if (name.startsWith('radius-')) return `rounded-${name.replace(/^radius-/, '')}`;
  if (name.startsWith('spacing-')) return `p-${name.replace(/^spacing-/, '')} / m-${name.replace(/^spacing-/, '')}`;
  return null;
}
