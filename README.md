# Personal Site

Personal website built with Astro. Content lives in collections (blog/projects/papers) and is validated at build time.

## Quick start

```bash
npm ci
npm run dev
```

## Environment

- Production builds require `PUBLIC_SITE_URL` (canonical URLs, sitemap, RSS).
- `PUBLIC_BASE_PATH` must be set to `""` for root deploys or `"/your-base"` for subpaths.
- Local dev defaults to `http://localhost:4321` + empty base when env is unset.

## Scripts

- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Full checks: `npm run verify`
- Security audit: `npm run audit` (or `npm run audit:prod`)

## Content

- Blog posts: `src/content/blog`
- Projects: `src/content/projects`
- Publications (papers collection): `src/content/papers`
- CV metadata: `src/content/cv`
- CV PDF: `public/cv/Eric_South_CV.pdf`
- Site copy (home/projects/publications/contact/blog): `src/content/site`

Schemas live in `src/content.config.ts`. Use `featured: true` to surface items on the homepage.

## Configuration

- Site settings: `src/settings.ts`
- Typography toggles: `template.bodyFont`, `template.displayFont`, `template.proseFont` in `src/settings.ts`
- Navigation + feature flags: `src/data/navigation.ts` (`features.blogNav` = `auto` | `show` | `hide`)
- Site copy: `src/content/site`
- Content queries: `src/lib/content.ts`
- Base-aware URLs: `src/lib/urls.ts`

## CI

GitHub Actions runs `npm run verify` on pull requests and `main` pushes.

## Branch protection (recommended)

- Require PRs to `main`.
- Require status checks to pass (CI / verify).
- Require conversation resolution before merge (optional).

## Deploy (Netlify)

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `.nvmrc` (also in `netlify.toml`)
- Set `PUBLIC_SITE_URL` and `PUBLIC_BASE_PATH` in the Netlify environment.

## Docs

- Architecture: `docs/architecture.md`
- Content model: `docs/content-model.md`
- Operations: `docs/operations.md`
