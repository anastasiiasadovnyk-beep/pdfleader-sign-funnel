<!--
CANONICAL PROFILE TEMPLATE — do not delete. The reindex-profiles workflow (and the
profiling agent) MUST produce every product-profiles/<product>.md in exactly this shape.

Authoring rules for the agent:
- READ-ONLY analysis of the product repo. Never modify the product repo; only write this profile.
- Ground every claim in real code. Cite concrete paths (e.g. `src/App.tsx`, `src/data/store.ts`).
  Prefer a real short snippet from the repo over a paraphrase.
- NEVER invent files, patterns, routes, or libraries. If something can't be determined from the
  code, write "not found in repo" — do not guess.
- Keep the section headings and numbering below EXACTLY (stable diffs). Fill each with this
  product's specifics. Section 7 (analytics) is load-bearing for the tagging tool — describe the
  real analytics dispatch shape, event-name convention, and where events are wired.
- Length ~70-90 lines, matching the existing profiles. Terse, high signal.
-->

# Product Profile — <repo-name> (<Product Display Name>)

<One sentence: framework/stack + "Use this to shape a concept so it drops into <repo>.">

## 1. Architecture
`src/` folder roles (list the real top-level folders and what each holds). State the rule for where a new page/screen lives.

## 2. Page/feature anatomy
The real folder shape of a representative page/feature (tree), plus a real component shape snippet (imports + export style + prop-interface convention) and the hook/order convention.

## 3. Routing
Router library + version, how routes are declared (lazy?), the router file path, and where path constants live.

## 4. Data layer
State management (Redux/RTK/thunks/query/etc.) with a real action + selector + component-usage snippet, and where types live.

## 5. ui-pes usage
How `@universe-forma/ui-pes` is consumed (direct import vs wrapper), with a real import snippet.

## 6. Styling
Tailwind version + how the theme/tokens are wired (which CSS files import ui-pes theme + product vars).

## 7. Analytics
The analytics stack and the exact dispatch shape a concept's tagged events map onto (e.g. `dispatch(sendAnalyticEvent({ event, data }))`), the event-name convention (suffixes), which properties are auto-attached (exclude these from per-event data), and where events are wired (file paths). This section is what the tagging tool's `analytics.json` integrates against.

## 8. i18n & naming
i18n library + key/namespace convention with a real key example; folder/component/util/props naming conventions.

## Integration recipe (concept → <repo-name>)
Numbered steps to drop a sandbox concept into this product: path it lands at + export style; sub-component mapping; route registration (file + constants); data wiring (which state layer replaces `mock.ts`); i18n keys; styling (tokens are shared). Mirror the concept contract seams (`types.ts` props, `mock.ts`, `analytics.json`).
