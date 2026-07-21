# Third-party attribution

## uxKero/anydesign (MIT)

Two things in this repo are adapted from [uxKero/anydesign](https://github.com/uxKero/anydesign):

- **CSS-var extraction regex** — `scripts/lib/css-tokens.mjs` (`CSS_VAR_RE` and the parsing it drives) adapts anydesign's approach to pulling `--custom-property: value;` declarations out of raw CSS.
- **Layered analysis approach** — `.claude/skills/vibe-concept/references/intake.md` step 3 ("Layered analysis: general → specific" — identity → layout → components → tokens → states) adapts anydesign's coarse-to-fine design-analysis method.

Both are used under anydesign's MIT license:

```
MIT License

Copyright (c) uxKero

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Studied, not copied

[plugin87/ux-ui-agent-skills](https://github.com/plugin87/ux-ui-agent-skills) and [dobzha/dobzha-storybook-ds-skill](https://github.com/dobzha/dobzha-storybook-ds-skill) were **studied** for general concepts only — quality-gate structuring from the former, catalog-structure ideas from the latter — while shaping `scripts/gates/` and `ds-catalog/`. No code, prose, or file structure was copied from either. Both repos carry **no license** (all rights reserved by default), so nothing from them is reproduced here.
