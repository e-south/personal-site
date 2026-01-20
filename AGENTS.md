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
- Ops notes: docs/operations.md

## Checks (must pass before finishing)

- Verify: npm run verify
  - format:check, lint, typecheck, test, build
- Security audit (optional): npm run audit

## Architecture conventions

- Pages (src/pages) are thin: routing + data query + layout selection.
- Reusable UI in src/components.
- Shared helpers in src/lib (pure functions preferred).
- Use src/lib/content.ts for collection queries and src/lib/urls.ts for base-aware links.
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

## Local dev + deploy tips

- `PUBLIC_SITE_URL` is required for builds. For local dev, set it in `.env` (e.g., `PUBLIC_SITE_URL=http://localhost:4321`); keep `PUBLIC_BASE_PATH` empty unless you need a subpath deploy.
- Netlify deploy previews inject `DEPLOY_PRIME_URL`; the build command sets `PUBLIC_SITE_URL` from it so previews work without manual env setup.
- `git push` runs `npm run verify` via a pre-push hook, so expect a full format/lint/typecheck/test/build pass before pushing.
- For previews that need to mimic production, run `npm run build` then `npm run preview` locally.
