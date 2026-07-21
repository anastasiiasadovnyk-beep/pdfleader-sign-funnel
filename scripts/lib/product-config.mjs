// Only the light-surface vars file per product — theme/themes.css hold dark-theme
// overrides that would flatten white text tokens onto our light preview surface.
export const PRODUCTS = [
  { key: 'pdfguru', repoPath: process.env.PDFGURU_FE ?? '../pdfguru-fe', brandGlobs: ['src/styles/vars.css'] },
  { key: 'tbp', repoPath: process.env.TBP_FE ?? '../tbp-fe', brandGlobs: ['src/styles/vars.css'] },
  { key: 'pdfleader', repoPath: process.env.PDFLEADER_FE ?? '../pdfleader-fe', brandGlobs: ['src/app/styles/vars.css'] },
];
