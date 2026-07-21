# Vibe Concepts — Design Spec

**Date:** 2026-07-21
**Status:** Approved (design), pending implementation plan
**Owner:** Oleksandr Molochko

## Purpose

Let designers and PMs "vibe code" screen/page concepts for three products — **PDF Guru** (`pdfguru-fe`), **TheBestPDF** (`tbp-fe`), **PDFLeader** (`pdfleader-fe`) — using the shared design system **`@universe-forma/ui-pes`**.

A non-engineer clones this repo, runs Claude, supplies a Figma reference + a prompt, and gets a previewable page built from real ui-pes components and tokens — **clean, typed, mock-data-driven code that drops into the target product without a rewrite.**

Not a replacement for engineering. It produces integration-ready concepts, not merged production code.

## Non-goals

- Not a Figma-artifact generator (we go Figma → code, not code → Figma).
- Not a distinctive/greenfield aesthetic tool — fidelity to the reference under a constrained design system is the goal, so `frontend-design`-style invention is explicitly out.
- No runtime dependency on the three product repos being checked out (they are only needed to *reindex* profiles).
- No auto-merge into product repos. Output is copy-in-ready + an integration recipe.

## Users & flow

1. Designer clones this repo, `npm install`, `npm run dev` (sandbox opens with a concept gallery).
2. Runs Claude, invokes `vibe-concept` (or describes intent), pastes a **Figma node URL** (preferred) or drops a **screenshot**, writes a prompt, and **picks the target product**.
3. Claude reads the ds-catalog + the chosen product profile, drills into the specific ui-pes components it needs, and emits a concept folder.
4. Vite hot-reloads; the concept appears full-screen in the gallery.
5. Claude runs the quality gates + a screenshot self-verify against the reference, iterates until it matches.
6. Designer previews and iterates by talking to Claude. When happy, an engineer copies the concept into the target product using the generated `INTEGRATION.md`.

## Architecture

Two halves in one repo: a **preview sandbox app** and a **Claude skill-pack**, connected by two **generated catalogs**.

```
ui-design-vibe-concepts/
├─ src/
│  ├─ app/{main.tsx, Gallery.tsx, routes.ts}      # Vite app; auto-route via import.meta.glob
│  └─ concepts/<name>/                            # one folder per generated concept
│     ├─ Screen.tsx        # pure component: typed props, ui-pes + Tailwind tokens only
│     ├─ types.ts          # the props contract — the integration seam
│     ├─ mock.ts           # typed fixture feeding Screen in the sandbox
│     ├─ meta.ts           # title, target product, viewport(s)
│     └─ INTEGRATION.md     # product-specific recipe to drop this into the target repo
├─ ds-catalog/{components,color-tokens,typography,spacing}.md   # reindexed from ui-pes
├─ product-profiles/{pdfguru,tbp,pdfleader}.md                  # reindexed from the 3 repos
├─ scripts/
│  ├─ reindex-ds.mjs        # parse ui-pes theme.css + component types → ds-catalog/*
│  ├─ reindex-products.mjs  # regenerate the 3 product profiles (repos must be present)
│  ├─ vendor/               # anydesign-derived extractors (MIT), adapted to local files
│  └─ gates/{lint-hardcodes,validate-tokens,verify-states}.mjs
├─ .claude/skills/vibe-concept/
│  ├─ SKILL.md              # thin orchestrator
│  └─ references/{intake,ds-catalog,conventions,self-review}.md
├─ VENDOR.md                # third-party attribution (anydesign, MIT)
└─ README.md                # designer quickstart
```

### Preview sandbox

- Vite + React 19 + Tailwind 4, consuming `@universe-forma/ui-pes` and importing its `theme.css` (matching how the products consume it).
- `src/app/routes.ts` auto-registers every `src/concepts/*/Screen.tsx` via `import.meta.glob` — no manual wiring.
- `Gallery.tsx` = home grid of all concepts (title, product tag, link); clicking opens the concept full-screen.
- A concept renders by feeding `mock.ts` into `<Screen {...mock} />`.

### Concept contract (the clean-code core)

- `Screen.tsx` is **pure and product-agnostic**: props in, UI out. Only `@universe-forma/ui-pes` imports + Tailwind classes bound to ui-pes tokens/typography. No data fetching, no store, no router, no i18n setup inside it.
- `types.ts` holds the props interface — this is the seam an engineer wires real data to.
- `mock.ts` is a typed fixture; deleting it and passing real data is the whole integration on the data side.
- The same pure core renders identically for all three products; product differences live only in `INTEGRATION.md`.

### Generated catalogs (the knowledge layer)

**ds-catalog** — reindexed from installed ui-pes. Domain-split, tables over prose, progressive disclosure (the skill loads only the file it needs):
- `components.md` — each ui-pes export: props, variants, states, usage.
- `color-tokens.md`, `typography.md`, `spacing.md` — token tables (`token | value | usage`) parsed from `theme.css`.

**product-profiles** — reindexed from the three repos; one file each, 8 sections grounded in real code: architecture, page/feature anatomy, routing, data layer, ui-pes usage, styling, i18n, naming. Drives `INTEGRATION.md`. Committed so designers get them without cloning the products.

Divergence the profiles must capture (established by codebase analysis):

| | pdfguru-fe | tbp-fe | pdfleader-fe |
|---|---|---|---|
| Structure | `pages/` + sections/parts | `pages/`+`features/`+`layouts/` | strict FSD |
| Page export | default | default | named via slice `index.ts` |
| State | classic Redux + thunk | Redux Toolkit slices | RTK slices + selectors |
| Styling | Tailwind + token vars | Tailwind + styled-components | styled-components + Tailwind |
| Files | kebab folders | kebab folders | camelCase + `index.ts` public API |
| Enums | — | `I*`/`E*` prefix | `E*` prefix |

Shared safe core: React+TS, ui-pes direct + `cn`, React-Router-v6 lazy routes, i18next `t('dot.keys')`, Tailwind, `{Name}Props`, CSS-var tokens.

### Reindex story

`npm run reindex` regenerates both catalogs (ds + the 3 profiles) when the repos are present; the generated files are committed so the common case (designer with only the sandbox) always has current catalogs. Run on demand or on a ui-pes version bump.

### Quality gates (enforcement, not prose)

Scripts under `scripts/gates/`, run by the skill before declaring a concept done, and available as `npm run gate`:
- `lint-hardcodes` — zero raw hex/px where a ui-pes token exists; no raw Tailwind palette utilities (`bg-gray-500`) when a semantic token applies.
- `validate-tokens` — every color resolves to a ui-pes token; every text uses a ui-pes typography class.
- `verify-states` — interactive elements declare hover/active/disabled/focus; data regions handle empty/loading/error where applicable.

Concept: modeled on the ux-ui-agent-skills 13-point verify, reimplemented (ideas only — that repo is unlicensed) and bound specifically to ui-pes.

### The `vibe-concept` skill

One discoverable entry-point skill (designers don't memorize skill names). Thin `SKILL.md` orchestrator + progressive-disclosure references loaded per step:
- `intake.md` — Figma URL via MCP (preferred) → screenshot fallback → structured concept brief (regions, content, states, breakpoints). Adapts anydesign's analysis-framework + CSS-var extraction to local `theme.css` and Figma MCP.
- `ds-catalog.md` — consult catalog: overview → pick components → drill into source. **Hard rule: never invent a component.** If the reference needs something ui-pes lacks, compose from primitives + tokens and flag it for the DS team.
- `conventions.md` — the concept contract (4 files + INTEGRATION.md), typed-props seam, borrowed copywriting/CSS-specificity discipline from `frontend-design`.
- `self-review.md` — run the gates, screenshot the sandbox route, compare to the reference, iterate; a11y floor.

Authored with `superpowers:writing-skills` (TDD for skills): baseline-test a fresh agent given a Figma ref + no skill, capture failures (invents components, inline dirty data, no typed seam, hardcoded values), write the skill to kill exactly those, verify compliance.

## Reuse decisions

| Source | License | Decision |
|---|---|---|
| `uxKero/anydesign` | MIT | Vendor patterns: CSS-var extraction regex, DTCG token JSON, verify/drift, 5-layer analysis. Adapt from URL-fetch to local files + Figma MCP. Attribute in VENDOR.md. |
| `senlindesign/claude2figma` | MIT | Borrow on-rails enforcement ideas (reference-interpreter, component-rules). |
| `plugin87/ux-ui-agent-skills` | none (all rights reserved) | Study & reimplement the 13-point verify + QA-gate concepts. Do not copy files. |
| `dobzha/dobzha-storybook-ds` | none | Study the references/ shape + per-component token table. Do not copy files. |
| Figma official `/figma-*` skills | — | Figma-side; not adopted. `/figma-use` informs the MCP mental model. |
| `frontend-design` (superpowers) | plugin | Reference for copywriting + CSS-specificity discipline only; not invoked at runtime. |

## Components (units and boundaries)

- **Sandbox app** — renders concepts; depends on ui-pes + generated concept folders. Testable by loading a concept + its mock.
- **Concept** — a pure `Screen` + `types` + `mock` + `meta` + `INTEGRATION.md`. Understandable and testable in isolation.
- **ds-catalog generator** — pure transform: ui-pes source → markdown catalog. Deterministic, unit-testable.
- **product-profile generator** — repo source → profile markdown. Deterministic given a repo snapshot.
- **gates** — pure validators: concept source → pass/fail + findings.
- **vibe-concept skill** — orchestrates intake → catalog → emit → gate → verify. Consumes the above; owns no UI.

## Error handling

- Figma MCP unauthenticated/unreachable → fall back to screenshot; state the fallback.
- ui-pes lacks a needed component → compose from primitives + tokens and flag; never invent an import.
- Reindex without the product repos present → skip profiles, keep committed ones, warn.
- Gate failure → skill fixes before declaring done; never reports success on a failing gate.

## Testing

- ds/product generators: unit tests on fixed input snapshots → expected catalog output.
- gates: unit tests with passing and deliberately-dirty concept samples.
- sandbox: the seed concept renders and routes (smoke).
- skill: `writing-skills` pressure scenarios (baseline vs skill-present compliance).

## Build phases

1. **Scaffold** — Vite + React 19 + Tailwind 4 sandbox consuming ui-pes; gallery + auto-route; one hand-written seed concept proving the render path.
2. **Reindex** — `reindex-ds` + `reindex-products`; commit generated catalogs (seed the 3 profiles from the analysis already done).
3. **Gates** — `lint-hardcodes`, `validate-tokens`, `verify-states`, bound to ui-pes, with tests.
4. **Skill** — author `vibe-concept` via `writing-skills`; vendor anydesign intake/verify patterns.
5. **Docs** — README designer quickstart + VENDOR attribution.

## Success criteria

- A designer with only this repo can produce a previewable, on-brand concept from a Figma ref + prompt, for any of the 3 products.
- Generated `Screen.tsx` uses only real ui-pes components + tokens; gates pass; no hardcoded values.
- The concept copies into the chosen product using `INTEGRATION.md` with data wiring being the main remaining work.
- Reindex keeps catalogs current with one command.
