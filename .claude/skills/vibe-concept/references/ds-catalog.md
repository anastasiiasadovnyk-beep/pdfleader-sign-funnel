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

## 3. Drill into the real source for exact props

The catalog tells you a component exists and how to import it; it does not give you the prop signature. For that, read the installed package directly:

```
node_modules/@universe-forma/ui-pes/es/components/<component>/<Component>.d.ts
```

e.g. `node_modules/@universe-forma/ui-pes/es/components/button/Button.d.ts`. Read the `.d.ts` for the real prop names, types, and variants before writing JSX — don't assume props from memory or from other design systems.

## 4. Map reference styles to token utilities

Translate the raw observations from intake step 4 into ui-pes utilities, never raw values:
- Colors → `ds-catalog/color-tokens.md` → `bg-*` / `text-*` / `border-*` (e.g. observed "primary blue" → `bg-primary` / `text-primary`).
- Text sizes/weights → `ds-catalog/typography.md` → `text-desktop-title-*`, `text-body`, `text-body-emph`, `text-caption`, etc.
- Radius/spacing → `ds-catalog/spacing.md` → `rounded-*`, `p-*`/`m-*` token utilities.

If a reference value doesn't map cleanly to any token, pick the closest token and flag the mismatch rather than dropping in a raw hex/px value — the gates will reject raw values outright.

Restate: never invent a component or a token value. Compose from what's cataloged, and flag gaps for the DS team instead of papering over them.
