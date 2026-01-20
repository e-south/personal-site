# Architecture

## Goals

- Content-driven personal site (blog, projects, publications, CV)
- Fast builds, minimal client JS
- Typed + validated content models

## Structure

- src/pages: route wiring and layout selection
- src/components: reusable UI blocks
- src/layouts: page shells
- src/content: content collections (blog, projects, papers, cv, home, page-\*, links, story)
- src/data: small typed data (profile, socials, navigation config)
- src/lib: pure helpers (formatting, content queries, URL base handling, env validation, story assembly)

## Build + deploy

- Single quality gate: npm run verify
- CI runs verify on pull requests and main
- Build config is env-driven and fail-fast in production (via `src/lib/env.mjs`):
  - PUBLIC_SITE_URL is required (canonical URLs, sitemap, RSS).
  - PUBLIC_BASE_PATH is required ("" for root or "/base" for subpaths).
  - Development defaults to http://localhost:4321 with base "" if unset.

## Content + routing helpers

- Use `src/lib/content.ts` for collection queries (sorting, mapping, filtering).
- Use `src/lib/urls.ts` for base-aware URLs instead of manual concatenation.
- Page copy entries live in `src/content/home`, `src/content/page-*`, and `src/content/links`.
- The CV page embeds the PDF referenced by `cvPdf` in `src/content/page-cv/cv.md`.
  The file must exist in `public/cv/` (use a `/cv/...` path).

## Maintenance

- Dependency updates are automated via Dependabot (`.github/dependabot.yml`).
- Troubleshooting and operational notes live in `docs/operations.md`.

## Branch protection (recommended)

- Require PRs to merge into main.
- Require CI / verify to pass.
- Optional: require up-to-date branches and conversation resolution.
