# Personal Site

Personal website built with Astro. Content lives in collections (blog/projects/papers) and is validated at build time.

## Quick start

```bash
npm ci
npm run dev
```

## Environment

Copy the example file and set your real values:

```bash
cp .env.example .env
```

- `PUBLIC_SITE_URL` is required (used for canonical URLs, sitemap, and RSS).
- `PUBLIC_BASE_PATH` must be set to `""` for root deploys or `"/your-base"` for subpaths.

## Scripts

- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Full checks: `npm run verify`
- Security audit: `npm run audit` (or `npm run audit:prod`)

## Content

- Blog posts: `src/content/blog`
- Projects: `src/content/projects`
- Papers: `src/content/papers`

Schemas live in `src/content.config.ts`. Use `featured: true` to surface items on the homepage.

## Configuration

- Site settings: `src/settings.ts`
- CV data: `src/data/cv.ts`
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
