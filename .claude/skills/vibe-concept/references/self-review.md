# Self-review

Definition of done: **gates pass AND the rendered concept visually matches the reference.** Neither alone is enough — a concept that passes the gates but doesn't match the Figma/screenshot is not done, and a good-looking concept that fails the gates is not done.

## 1. Run the gates

```
node scripts/gates/run.mjs <slug>
```

Fix every finding and re-run until it exits 0. Do not declare the concept done, summarize success, or hand it back to the user while this is failing — that's the one rule this whole skill exists to enforce.

## 2. Screenshot the sandbox route

Start the dev server if it isn't running (`npm run dev`) and capture `/c/<slug>` — the gallery route for this concept, wired up by `ConceptRoute` from `meta.ts` + `mock.ts`.

## 3. Compare to the reference

Put the screenshot next to the original Figma reference (or screenshot) side by side. Check, region by region, against the brief from `references/intake.md`:
- Layout/regions match.
- Copy matches (or is a reasonable placeholder if the reference didn't specify exact strings).
- Component choices match what's visually implied (button style, input type, etc.).
- States you were asked to cover (hover/empty/loading/error) are represented, even if only one is the default render.

## 4. Iterate

If it doesn't match, go back to `references/ds-catalog.md` (wrong component/token choice) or `references/conventions.md` (wrong file structure) — fix and re-run both the gates and the screenshot comparison. Repeat until it matches.

## 5. Accessibility floor

Before calling it done, confirm:
- **Visible keyboard focus** — interactive elements (buttons, inputs, links) show a visible focus ring; don't strip focus styles.
- **Contrast** — text/background pairs use ui-pes token pairs designed to go together (e.g. `text-text-secondary` on `bg-bg-white-bg`, not an arbitrary combination); don't hand-pick a token pair that looks fine but wasn't designed as a pair.
- **Reduced motion** — any animation/transition respects `prefers-reduced-motion`; don't add motion the user can't turn off.

This a11y floor is a manual check, not a gate script — hold yourself to it even though `scripts/gates/run.mjs` won't fail on a11y issues.
