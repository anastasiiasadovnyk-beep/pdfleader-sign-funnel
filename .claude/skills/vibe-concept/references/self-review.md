# Self-review

Definition of done: **gates pass AND the rendered concept visually matches the reference.** Neither alone is enough — a concept that passes the gates but doesn't match the Figma/screenshot is not done, and a good-looking concept that fails the gates is not done.

## 1. Run the gates

```
node scripts/gates/run.mjs <slug>
```

Fix every finding and re-run until it exits 0. Do not declare the concept done, summarize success, or hand it back to the user while this is failing — that's the one rule this whole skill exists to enforce.

## 2. Screenshot the sandbox route

Start the dev server if it isn't running (`npm run dev`) and capture `/c/<product>/<slug>` — the gallery route for this concept, wired up by `ConceptRoute` from `meta.ts` + `mock.ts`.

## 3. Compare to the reference — walk the fidelity checklist

Put the screenshot next to the original Figma reference side by side and go through EVERY row below. For each, write the reference value vs what you built, and the delta. "Looks close" is not the bar — enumerate and fix each mismatch. Don't stop at layout; the differences that read as "cheap" are usually width, type, and the accent/badge, not the overall structure.

| Dimension | Check |
|---|---|
| **Container** | width / `max-w-*`, padding, corner radius, shadow — match the reference frame (a modal that's too wide/narrow is the most common miss). |
| **Typography** | per text region: family, size, weight. Match to the right `text-*` token by resolved size AND weight (see `ds-catalog.md` §4), not by name. Headings, body, captions, and emphasized numbers are often different tokens. |
| **Color semantics** | accent, CTA, selected state, badge, dividers — each resolved by VALUE against `brands/<product>.css` (see `ds-catalog.md` §4). Confirm the accent and the CTA are the tokens their hexes actually map to (e.g. violet `primary` vs red `secondary`), not both `primary`. |
| **Badges / chips** | the ui-pes `Badge` `variant`/`style` + `color` + `size` that matches the reference's shape and fill (tonal vs solid, radius, text case). Read `Badge.d.ts` for the real values. |
| **Icons** | correct glyph and size (`h-*/w-*`) matching the reference; don't approximate a different icon. |
| **Spacing** | gaps between rows/sections and internal padding — match the rhythm, not just "some gap". |
| **States** | selected / hover / disabled / empty / loading / error you were asked to cover — represented and styled from tokens. |
| **Copy** | exact strings from the reference (or clearly-flagged placeholders). |

Component choices must match what's visually implied (button style, input type, radio vs checkbox, etc.). If a row can't be matched with a real token/component, that's a DS gap to flag — not a reason to eyeball-approximate.

## 4. Iterate

If it doesn't match, go back to `references/ds-catalog.md` (wrong component/token choice) or `references/conventions.md` (wrong file structure) — fix and re-run both the gates and the screenshot comparison. Repeat until it matches.

## 5. Accessibility floor

Before calling it done, confirm:
- **Visible keyboard focus** — interactive elements (buttons, inputs, links) show a visible focus ring; don't strip focus styles.
- **Contrast** — text/background pairs use ui-pes token pairs designed to go together (e.g. `text-text-secondary` on `bg-bg-white-bg`, not an arbitrary combination); don't hand-pick a token pair that looks fine but wasn't designed as a pair.
- **Reduced motion** — any animation/transition respects `prefers-reduced-motion`; don't add motion the user can't turn off.

This a11y floor is a manual check, not a gate script — hold yourself to it even though `scripts/gates/run.mjs` won't fail on a11y issues.
