# ui-design-vibe-concepts

Vibe-code screen concepts on the `@universe-forma/ui-pes` design system for **pdfguru**, **tbp**, and **pdfleader**. Preview concepts in a gallery, hand off integration-ready code.

## Prerequisites

- Node ≥20
- Access to the `@universe-forma` GitHub Packages registry — either a global `~/.npmrc` with a GitHub Packages token, or `NODE_AUTH_TOKEN` set in your shell/CI. This repo's `.npmrc` only pins the registry, it does not carry credentials.

## Setup

```bash
npm install
npm run dev
```

Opens the gallery at `/` listing every concept under `src/concepts/`. Each concept also has its own full-screen route at `/c/<slug>`.

## Making a concept

Run Claude Code in this repo and describe the screen: paste a Figma node URL (or drop a screenshot) and say which product it's for (`pdfguru` | `tbp` | `pdfleader`). The `vibe-concept` skill (`.claude/skills/vibe-concept/`) takes it from there — reads the design system catalog, reads the target product's profile, and writes a new concept folder at `src/concepts/<slug>/`. Preview it at `/c/<slug>`.

### The concept contract

Every concept is 5 files:

- `Screen.tsx` — pure component, typed props in, UI out, ui-pes + token classes only
- `types.ts` — the prop types
- `mock.ts` — fixture data satisfying those types (the seam that's deleted when wired to real data)
- `meta.ts` — slug, title, target `brand`
- `INTEGRATION.md` — what a product engineer needs to wire it up

See `src/concepts/_template/` for the skeleton and `src/concepts/documents-empty/`, `src/concepts/document-detail/` for worked examples.

## Quality gates

```bash
npm run gate           # all concepts
npm run gate <slug>    # one concept
```

Checks for hardcoded values instead of tokens, missing states, and invalid token references. A concept isn't done until this passes.

## Refreshing catalogs and brand tokens

```bash
npm run reindex             # both of the below
npm run reindex:ds          # ds-catalog/*.md from node_modules/@universe-forma/ui-pes
npm run reindex:products    # product-profiles/*.md and brands/*.css from local product repos
```

`reindex:products` reads sibling checkouts at `../pdfguru-fe`, `../tbp-fe`, `../pdfleader-fe` by default. Override with `PDFGURU_FE`, `TBP_FE`, `PDFLEADER_FE` env vars if your checkouts live elsewhere:

```bash
PDFGURU_FE=~/dev/pdfguru-fe TBP_FE=~/dev/tbp-fe npm run reindex:products
```

## Other scripts

```bash
npm run build     # tsc -b && vite build
npm test          # vitest run
npm run preview   # preview a production build
```
