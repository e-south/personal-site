# Architecture

## Goals

- Content-driven personal site (blog, projects, papers, CV)
- Fast builds, minimal client JS
- Typed + validated content models

## Structure

- src/pages: route wiring and layout selection
- src/components: reusable UI blocks
- src/layouts: page shells
- src/content: content collections (blog, projects, papers)
- src/data: small typed data (profile, socials)
- src/lib: pure helpers (formatting, mapping)

## Build + deploy

- Single quality gate: npm run verify
- CI runs verify on pull requests and main
- Build config is env-driven and fail-fast:
  - PUBLIC_SITE_URL is required (canonical URLs, sitemap, RSS).
  - PUBLIC_BASE_PATH is required ("" for root or "/base" for subpaths).

## Branch protection (recommended)

- Require PRs to merge into main.
- Require CI / verify to pass.
- Optional: require up-to-date branches and conversation resolution.
