# Intake

Goal: turn whatever the user gave you into a structured concept brief before touching code.

## 1. Get the reference

**Preferred: Figma node URL via Figma MCP.** If a Figma MCP tool is available and the user gave a `figma.com/design/...` (or `file/...`) URL with a node id, use it to pull the node's layers, text content, and styles directly.

**Fallback: screenshot.** If no Figma MCP tool is available, or the user only has a screenshot/mockup image, say so explicitly ("no Figma MCP available, working from the screenshot") and read the image directly. Do not block on Figma access — a screenshot is a first-class input, not a degraded one.

## 2. Ask for the target product if not stated

One of `pdfguru` | `tbp` | `pdfleader`. Don't guess — this choice picks the brand CSS, the product profile, and the integration recipe in later steps.

## 3. Layered analysis (general → specific)

Read the reference in passes, coarse to fine — adapted from the uxKero/anydesign analysis approach (attribution in `VENDOR.md`):

1. **Identity** — what screen is this, what's its purpose, who's the user in this state.
2. **Layout system** — regions (header, sidebar, content, footer, modal…), grid/flex structure, how regions relate at desktop width.
3. **Components** — enumerate each distinct UI element per region (button, input, card, badge, table row…) without naming a library yet.
4. **Tokens** — colors, type sizes/weights, spacing, radii actually visible in the reference. Note these as raw observations (e.g. "primary blue CTA", "large bold heading") — you will map them to ui-pes tokens in the ds-catalog step, not here.
5. **States** — what states does this screen need: default, hover, empty, loading, error — whichever are visible or implied. Note responsive breakpoints if the reference shows more than one width.

## 4. Produce the concept brief

Write a short brief (not a file — carry it into the next steps) covering:
- **Regions**: named layout areas and their contents.
- **Content**: literal copy visible in the reference (headings, body text, button labels, empty/error messages).
- **Component candidates**: one line per distinct element, e.g. "primary CTA button", "search input with icon", "empty-state illustration + heading + subheading".
- **States**: default plus any of hover/empty/loading/error that apply.
- **Breakpoints**: desktop-only, or desktop + mobile if the reference shows both.

This brief is what step 2 (ds-catalog) and step 4 (emit the concept) work from. Don't skip ahead to picking components yet — that happens once you've read the catalog.
