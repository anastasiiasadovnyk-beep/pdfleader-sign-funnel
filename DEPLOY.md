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
   (fine-grained tokens do not cover the GitHub Packages npm registry). The
   token already in the dev machine's `~/.npmrc` works too.
2. Add `NPM_RC` to the project with **three** lines — paste the token in place
   of `<TOKEN>`:

   ```
   registry=https://registry.npmjs.org
   @universe-forma:registry=https://npm.pkg.github.com/
   //npm.pkg.github.com/:_authToken=<TOKEN>
   ```

   The first line is **required, not optional**: "Vercel Runtimes are installed
   from the canonical npm registry so `registry.npmjs.org` must be one of the
   lines in your `.npmrc` file"
   (<https://vercel.com/kb/guide/using-private-dependencies-with-vercel>).
   Omit it and the build can fail resolving ordinary public packages.

   Either add it in the dashboard — **team switcher → project → Settings in the
   sidebar → Environment Variables**, applied to Production, Preview and
   Development — or skip the dashboard entirely and pipe a file in, which avoids
   pasting a multi-line secret into a web form:

   ```bash
   vercel link
   vercel env add NPM_RC production < /path/to/npmrc-for-vercel
   ```

   Repeat for `preview` and `development`. `vercel env update NPM_RC production
   < file` replaces the value later. Production and preview variables are stored
   as *sensitive* by default, so they cannot be read back afterwards.
3. Redeploy (Deployments → ⋯ on the failed build → Redeploy, or push a commit).
   Environment variable changes never apply to existing deployments.

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
