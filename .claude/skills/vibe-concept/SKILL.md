---
name: vibe-concept
description: Build a UI concept, screen, or page from a Figma reference, design, mockup, or screenshot for pdfguru, tbp, or pdfleader. Use when the user wants a previewable, ui-pes-built screen concept that is integration-ready for one of those products.
---

# vibe-concept

Turn a Figma reference (or screenshot) + a prompt into a concept folder under `src/concepts/<product>/<slug>/` that renders in the sandbox gallery and passes the quality gates.

## Workflow

1. **Intake** — get a Figma node URL (prefer Figma MCP if available) or a screenshot; ask which target product (`pdfguru` | `tbp` | `pdfleader`) if not stated; produce a structured concept brief. See `references/intake.md`.
2. **Consult the design system** — read `ds-catalog/*.md` for the overview, pick real ui-pes components, then drill into `node_modules/@universe-forma/ui-pes` source for exact props. See `references/ds-catalog.md`.
3. **Read the target product profile** — `product-profiles/<product>.md`. This shapes the integration recipe in step 4.
4. **Emit the concept** — create `src/concepts/<product>/<slug>/{Screen.tsx,types.ts,mock.ts,meta.ts,INTEGRATION.md}`. See `references/conventions.md`.
5. **Run gates** — `node scripts/gates/run.mjs <slug>`; fix findings and re-run until it passes. NEVER declare the concept done on a failing gate.
6. **Capture the design spec** — while you still have the Figma node open, extract the ground-truth values (container width/radius, per-region font family/size/weight, badge case, key gaps/paddings) into `design-spec.json` in the concept folder, and tag those regions in the JSX with `data-ff="<region>"`. This is the machine-checkable contract — don't rely on eyeballing. See `references/conventions.md` (Design spec).
7. **Self-verify — run the fidelity gate** — `npm run fidelity <product> <slug>`. It renders the isolated `/preview/<product>/<slug>` route (no app shell), screenshots desktop+mobile into `.fidelity/`, and asserts every `design-spec.json` region against the rendered computed styles. Fix each reported delta and re-run until it exits 0, then eyeball the screenshot against the reference for anything the spec doesn't cover. See `references/self-review.md`.
8. **Tag analytics** — run the sandbox (`npm run dev`), open `/c/<product>/<slug>?tag=1` (the tagger is opt-in via the `?tag=1` query param; it's invisible otherwise). Use **Inspect** to hover and tag elements, add one page-view event per page, and check **Coverage** to find untagged interactive elements. Events auto-save as you go; **Export** also writes `analytics.json` into the concept folder. The tagger's taxonomy now spans interaction/form/visibility/navigation/media/content/custom — pick the closest category/trigger rather than defaulting to click/page_load. See `references/conventions.md` (Analytics contract).

| Step | Reference |
|---|---|
| 1. Intake | `references/intake.md` |
| 2. Design system | `references/ds-catalog.md` |
| 4. Concept contract | `references/conventions.md` |
| 6. Design spec | `references/conventions.md` |
| 7. Self-verify (fidelity gate) | `references/self-review.md` |
| 8. Analytics | `references/conventions.md` |

Load each reference file just before you need it — don't read them all upfront.

## HARD RULES

- **Never invent a component.** If ui-pes lacks it, compose from ui-pes primitives + tokens and FLAG the gap for the DS team in your response.
- **`Screen.tsx` must be pure.** Props in, UI out. Only `@universe-forma/ui-pes` imports plus Tailwind token classes. No data-fetching, no store, no router, no i18n inside it. No raw hex colors, no raw Tailwind palette utilities (`bg-gray-500` etc.), and no raw px where a spacing/radius token exists — token utilities only. Arbitrary layout values with no matching token (e.g. `max-w-[720px]`) are allowed.
- **Match colors and type by value, not by name.** Resolve each design color against the product's real values in `brands/<product>.css` and use the matching semantic token's utility — a violet accent (`primary`) and a red CTA (`secondary`) are different tokens; never default the emphasized control to `primary`. Same for type: match the reference's real size+weight to the right `text-*` token. No token match → nearest token + flag, or a flagged arbitrary `bg-[#hex]` only as a last resort. See `references/ds-catalog.md` §4.
- **Fidelity is a gate, not a vibe.** Every concept ships a `design-spec.json` (ground-truth values from the reference) with its regions tagged `data-ff="<region>"`, and `npm run fidelity <product> <slug>` must exit 0 before handoff. Don't declare done, summarize success, or hand back while it reports a delta — fix each one. The gate points at the wrong element so the user doesn't have to. Then walk the `references/self-review.md` checklist for anything the spec doesn't cover.
- **Decompose non-trivial screens** into `components/`/`lib/`/`hooks/` — no monolithic Screen.tsx. Every `.tsx` in the concept is gate-checked.
- **Data goes through typed props + `mock.ts`.** Never hardcode data inline in the component; `mock.ts` is the integration seam that gets deleted when the concept is wired to real data.
- **Every concept ships an `INTEGRATION.md` spec.** It is a required file (the structure gate fails without it) and must contain: Purpose, Props / data contract, States, and step-by-step integration into the target product. See `references/conventions.md` for the spec structure. A concept without this spec is incomplete.
- **Run the gates before declaring done.** `node scripts/gates/run.mjs <slug>` must exit 0. A failing gate means the concept is not finished — fix it, don't explain it away.
- **Every multipage concept declares its flow.** A concept with more than one page uses `flow.ts` + `pages/<page>/` (never multiple screens crammed into one file). Single-page concepts keep the flat `Screen.tsx` shape.
- **Tag analytics before handoff.** Each concept ships `analytics.json` covering a page-view event per page and its primary actions, tagged via the `?tag=1` overlay. Event names are `snake_case` with the product suffix convention (`_tap` click, `_view` load, `_change` input) plus the broader taxonomy's documented extensions. The analytics gate hard-fails only on non-snake_case names and warns when a page has no page-view event.
