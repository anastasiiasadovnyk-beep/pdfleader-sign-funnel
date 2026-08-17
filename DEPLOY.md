# Deploying to Vercel (git integration)

The repo is ready for Vercel's git builds — `vercel.json` at the root sets the
Vite framework, the `build/` output directory, and the SPA rewrite (every route
serves `index.html`, so reloading mid-flow on e.g. `/preview/pdfleader/sign-funnel/thank-you`
does not 404).

## One-time setup: registry access

`@universe-forma/ui-pes` and `@universe-forma/global-types` install from GitHub
Packages, which needs authentication. Without it the build fails with
`npm error 401 Unauthorized … npm.pkg.github.com`.

The token is **never committed** — the repo's `.npmrc` carries only the
registry mapping. Vercel gets the token through its `NPM_RC` environment
variable, whose contents Vercel writes to `~/.npmrc` inside the build
container.

1. Create a GitHub **classic** personal access token with only the
   `read:packages` scope: <https://github.com/settings/tokens/new?scopes=read:packages>
   (fine-grained tokens do not cover the GitHub Packages npm registry).
2. In the Vercel project: **Settings → Environment Variables**, add:
   - Key: `NPM_RC`
   - Value (two lines, paste the token in place of `<TOKEN>`):

     ```
     @universe-forma:registry=https://npm.pkg.github.com
     //npm.pkg.github.com/:_authToken=<TOKEN>
     ```

   - Environments: Production, Preview, Development.
3. Redeploy (Deployments → ⋯ on the failed build → Redeploy, or push a commit).

Everything else is auto-detected: npm from `package-lock.json`, the
`packages/analytics-tagger` workspace installs from the repo itself, and
`npm run build` (`tsc -b && vite build`) emits to `build/`.

## The URL to test with

The deployment root (`/`) already redirects to the prototype with no sandbox
chrome — hand participants the bare deployment URL.

## Alternative: no token on Vercel

Build locally (the token already lives in `~/.npmrc` on the dev machine) and
upload the finished folder — no credential leaves the machine, no git
integration involved:

```bash
npm run build
cd build && npx --yes vercel deploy --prod
```

`build/` ships its own `vercel.json`/`_redirects` for exactly this case. With
this flow, disconnect the Git repository in the Vercel project settings so
pushes don't trigger (failing) builds.
