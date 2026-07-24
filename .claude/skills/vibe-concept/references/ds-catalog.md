# Consult the design system

Never invent a component or a raw style value. Everything in the concept comes from `@universe-forma/ui-pes` components + tokens. If something is genuinely missing, compose it from primitives + tokens and flag the gap — don't fabricate a one-off.

## 1. Overview pass — `ds-catalog/*.md`

Read these four generated files to see what exists before picking anything:
- `ds-catalog/components.md` — every ui-pes component and its import line.
- `ds-catalog/color-tokens.md` — every color token and its `bg-*`/`text-*`/`border-*` Tailwind utility.
- `ds-catalog/typography.md` — every type token (`text-desktop-title-1`…`text-button-sm`, etc.).
- `ds-catalog/spacing.md` — spacing and radius tokens and their `p-*`/`m-*`/`rounded-*` utilities.

These are generated from the installed ui-pes version — trust the utility names, don't guess at Tailwind class names that "look right."

## 2. Pick components against the intake brief

For each "component candidate" from the intake brief, match it to a real entry in `ds-catalog/components.md`. Example: "primary CTA button" → `Button` (`import { Button } from '@universe-forma/ui-pes'`).

If nothing in the catalog fits: compose from primitives (`Slot`, layout + Tailwind token classes) and say so explicitly in your response — this is the DS gap to flag, not a reason to invent a bespoke component.

Check `DS-GAPS.md` (repo root) first — it's the standing register of known ui-pes gaps (missing `Dialog`/`Radio`/`Slider`/`Checkbox`/`Stepper`/`Card`, `Button` has no `success` color, `Badge` has no default `type`, no icon set). If your gap is listed, use the documented workaround; if it's new, add it there (with the concept that hit it) in addition to your concept's `INTEGRATION.md`.

## 3. Drill into the real source for exact props

The catalog tells you a component exists and how to import it; it does not give you the prop signature. For that, read the installed package directly:

```
node_modules/@universe-forma/ui-pes/es/components/<component>/<Component>.d.ts
```

e.g. `node_modules/@universe-forma/ui-pes/es/components/button/Button.d.ts`. Read the `.d.ts` for the real prop names, types, and variants before writing JSX — don't assume props from memory or from other design systems.

## 4. Map reference styles to token utilities — match by VALUE, not by name

### Colors — resolve against the product's real values, don't guess by vibe
Do NOT map a color by what it "looks like" ("highlighted control → `bg-primary`"). That is the #1 fidelity bug. Match the design's **actual value** to the product's **resolved** token values, which live in `brands/<product>.css` (generated from the product's real theme — `ds-catalog/color-tokens.md` lists token names but their values are product-supplied, so the brand file is the source of truth for values):

1. Read the exact color of each region from the reference — fill, text, border, accent, CTA, badge — as hex/rgb (Figma inspector, or sample the screenshot).
2. Open `brands/<product>.css` and find the token whose value **equals or is closest to** that color. Semantic anchors (pdfguru example): `--color-primary: #5f30e2` (violet), `--color-secondary: #d2294b` (red), `--color-success-main: #008554` (green), `--color-error-main: #d90a0a`, plus each `-light`/`-dark`/`-contrast-text` variant.
3. Use THAT token's utility / component prop. Example: a `#5f30e2` accent → `border-primary`/`text-primary`; a `#d2294b` CTA → `<Button color="secondary">`; a `#008554` badge → `<Badge color="success">`. **A highlighted accent and the CTA are usually DIFFERENT semantics** — resolve each by value; never assume the accent is `primary` just because it's the emphasized control.
4. No token within a close match → it's a DS gap. Prefer the nearest token and FLAG it. Only if the exact brand value is genuinely required and absent from the tokens, use a flagged arbitrary value `bg-[#hex]` / `text-[#hex]` (allowed by the gate inside brackets) and call it out in your response. Never a bare hex in a style object — that fails the gate.

### Type / spacing / radius
- Text → match the reference's real **font family / size / weight** to a `ds-catalog/typography.md` token (`text-desktop-title-*`, `text-body`, `text-body-emph`, `text-body-2`, `text-caption`, `text-button-*`). Check the resolved size/weight in `brands/<product>.css` (`--text-*-size` / `--text-*--font-weight`) when two tokens are close — pick the one whose size AND weight match, not just the name.
- Radius/spacing → `ds-catalog/spacing.md` → `rounded-*`, `p-*`/`m-*`/`gap-*`. Arbitrary layout values (`max-w-[480px]`) are fine when no token fits.

Restate: never invent a component or a token value. Resolve colors and type by value against `brands/<product>.css`, compose from what's cataloged, and flag gaps for the DS team instead of papering over them.
