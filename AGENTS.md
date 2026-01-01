# AGENTS.md

## What this repo is

Personal site built with Astro. Goals:

- Homepage + portfolio (projects) + publications/papers + blog
- Fast, content-driven, minimal client JS

## Setup

- Install: npm ci
- Dev: npm run dev
- Build: npm run build
- Preview: npm run preview

## Checks (must pass before finishing)

- Verify: npm run verify
  - format:check, lint, typecheck, test, build

## Architecture conventions

- Pages (src/pages) are thin: routing + data query + layout selection.
- Reusable UI in src/components.
- Shared helpers in src/lib (pure functions preferred).
- Content lives in src/content as collections (blog/projects/papers).
- Do not commit generated output: dist/ and .astro/.

## Content rules

- Prefer collections over hardcoded data in pages.
- Any new collection must have a schema in src/content.config.ts.

## PR / commit norms

- Keep commits small and scoped (e.g., "papers: add DOI fields").
- If behavior changes, update docs/architecture.md or docs/content-model.md.

## Gotchas

- If URL structure changes, add redirects (Netlify) or preserve old slugs.
- Do not add secrets to the repo; use .env locally and Netlify env vars in production.
