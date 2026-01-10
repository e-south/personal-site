# Pragmatic Programming Audit

## Baseline (commands + results)

- `npm ci` (2026-01-07): succeeded with a Husky error during `prepare`:
  - `husky - install command is DEPRECATED`
  - `error: could not lock config file .git/config: Operation not permitted`
- `npm run lint`: passed.
- `npm test`: passed (8 files, 36 tests).
- `npm run build`: passed; Vite warning from a dependency (`@astrojs/internal-helpers/remote`) about unused imports.

## Executive summary

- Install step is noisy/failure-prone on machines where `.git/config` is locked; the Husky `prepare` hook is the culprit and should be gated for CI/read-only environments.
- Content validation is strong in many places, but the `site` collection is overly permissive for fields that are effectively required (`links.md`); runtime failures happen later than necessary.
- Story chapters are built/validated inside the rendering component, which couples data assembly with UI and makes reuse/testing harder.
- The story content model permits empty `media` arrays; this fails at render time instead of content sync.
- Date parsing logic is duplicated in two files, increasing the risk of drift and inconsistent behavior.
- Newsletter config and external-link handling are functional but lightly validated; misconfiguration yields runtime surprises instead of fast, actionable errors.
- Accessibility has a few small gaps (pagination controls) that can be fixed with small, low-risk tweaks.

## Architecture map

```
content (src/content/*)
  -> schemas: src/content.config.ts
  -> queries: src/lib/content.ts
  -> pages: src/pages/*.astro

static data (src/data/*)
  -> navigation.ts, heroImages.ts, storyMedia.ts
  -> consumed by pages/components

rendering
  src/pages/* -> src/layouts/Layout.astro -> src/components/*
  shared helpers: src/lib (urls, require, dates, utils)

tooling
  scripts/content/* (content scaffolding)
  scripts/newsletter/* (listmonk tooling)
  infra/listmonk (docker-compose)
```

Coupling points to watch:

- `src/pages/index.astro` pulls from `heroImages`, `storyMedia`, and `story` content directly.
- `src/pages/publications.astro` derives the Scholar URL by label text rather than a stable key.
- `src/pages/contact.astro` relies on `links.md` fields that are optional at schema level.

## Findings (sorted by severity)

| Severity | Area                        | Finding                                                                                         | Evidence                                                                                                        | Risk/Impact                                                                                              | Fix                                                                                                                              | Effort |
| -------- | --------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------ |
| High     | Repo hygiene / Dev workflow | `npm ci` triggers `husky install`, which fails when `.git/config` is locked (seen in baseline). | `package.json:19` (`"prepare": "husky install"`) + baseline error output                                        | Local installs can fail or be noisy; CI and Dropbox-synced repos are especially brittle.                 | Gate Husky install (e.g., `HUSKY=0` in CI) or replace `prepare` with a small script that skips when `.git` is missing or locked. | S      |
| High     | Assertive programming       | Required `links.md` fields are optional in schema, but required at runtime.                     | `src/content.config.ts:123-143` (optional `email`/`location`), `src/pages/contact.astro:17-18` (`requireValue`) | Missing values fail at page render instead of content sync; errors surface late and are harder to trace. | Split `links.md` into a dedicated collection with required fields, or add a schema check tied to that entry.                     | M      |
| Medium   | Decoupling                  | Story chapter validation + assembly is in the UI component.                                     | `src/components/home/StoryChapters.astro:14-96`                                                                 | Harder to reuse/test; the component mixes data assembly with rendering, increasing coupling.             | Move chapter assembly/validation to `src/lib/story.ts` (pure function) and call it from the page or component.                   | M      |
| Medium   | Assertive programming       | Story `media` allows empty arrays; error occurs only during render.                             | `src/content.config.ts:150-154`, `src/components/home/StoryChapters.astro:70-79`                                | Invalid content passes schema and fails later; makes content errors harder to catch.                     | Add `z.array(z.string().min(1)).min(1)` to the `story.media` schema and (optionally) enforce uniqueness.                         | S      |
| Medium   | Ease of change              | Date parsing logic duplicated in two modules.                                                   | `src/content.config.ts:3-25` and `src/lib/dates.ts:12-33`                                                       | Divergence risk; fixes must be duplicated and tested twice.                                              | Centralize `parseISODate` in one module and import where needed.                                                                 | S      |
| Medium   | Robustness                  | Newsletter base URL is not validated in frontend settings; failures occur only at runtime.      | `src/settings.ts:60-64`, `src/components/ui/SubscribeCta.astro:88-109`                                          | Misconfigurations surface as runtime fetch errors or no-ops, with limited diagnostics.                   | Validate `PUBLIC_LISTMONK_URL` (absolute URL) at build time when newsletter is enabled.                                          | S/M    |
| Low      | Decoupling                  | Scholar link lookup depends on label text.                                                      | `src/pages/publications.astro:24-26`                                                                            | Changing the label silently breaks the link.                                                             | Use a stable key (e.g., `icon === 'scholar'`) or export a constant URL.                                                          | S      |
| Low      | Accessibility               | Pagination controls remain anchors without `aria-disabled` when unavailable.                    | `src/components/ui/Pagination.astro:7-17`                                                                       | Screen readers and keyboard users get unclear disabled states.                                           | Render `<span>` when missing or add `aria-disabled` + `tabindex="-1"`.                                                           | S      |
| Low      | Robustness                  | External link rewriting silently ignores malformed URLs and duplicates link behavior.           | `src/layouts/Layout.astro:100-117`                                                                              | Bad `href` values are hard to detect; extra DOM work on every page load.                                 | Restrict to known external links or log a warning when URL parsing fails.                                                        | S      |

## Top 5 Quick Wins (safe + low risk)

1. Enforce non-empty `story.media` in `src/content.config.ts` (fail fast on invalid story entries).
2. Add `aria-disabled` + `tabindex="-1"` to pagination controls when `prev/next` are absent.
3. Replace Scholar link lookup with a stable key (`icon === 'scholar'`) or an exported constant.
4. Centralize `parseISODate` to avoid drift between content schema and UI formatting.
5. Guard the Husky `prepare` script for CI/read-only `.git` environments (skip install when locked).

## Strategic refactors (staged)

1. Split `site` collection into smaller collections (`site`, `links`, `home`, etc.) so required fields are enforced at schema-level and failures happen during content sync.
2. Create `src/lib/story.ts` to build validated story chapters and media references, with unit tests; keep rendering components as pure view logic.
3. Extract complex page-level JS (home page rotators/carousels/observers) into a small module or island to improve testability and reduce DOM coupling.
4. Consolidate env validation into a shared helper (e.g., `src/lib/env.ts`) for both Astro config and runtime use.

## Changes implemented

- Added shared env validation (`src/lib/env.mjs`) and wired it into `astro.config.mjs` and `src/settings.ts` (including listmonk validation).
- Replaced the Husky `prepare` hook with a guarded script (`scripts/prepare.mjs`) to avoid install failures when `.git` is locked.
- Split `src/content/site` into dedicated page collections (`src/content/home`, `src/content/page-*`, `src/content/links`) and updated all `getEntry` calls.
- Enforced non-empty/unique story media at schema level and centralized story chapter assembly in `src/lib/story.ts` with tests.
- Extracted home page JS into `src/lib/home.ts` and kept `index.astro` as wiring only.
- Made pagination controls accessible (disabled states as `<span>`), stabilized Scholar link lookup by icon key, and added warnings for malformed external hrefs.
