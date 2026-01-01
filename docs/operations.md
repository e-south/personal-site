# Operations

## Local setup

```bash
npm ci
cp .env.example .env
npm run dev
```

- `PUBLIC_SITE_URL` is required (canonical URLs, sitemap, RSS).
- `PUBLIC_BASE_PATH` must be `""` for root deploys or `"/base"` for subpaths.

## Build + preview

```bash
npm run build
npm run preview
```

## Quality gate

```bash
npm run verify
```

## Dependency hygiene

```bash
npm run audit
npm run audit:prod
npm update
```

## Git hooks (Husky)

If hooks are not firing, re‑link Husky:

```bash
git config core.hooksPath .husky
```

If you see `.git/config` lock errors, pause Dropbox sync or exclude `.git/` from
sync to avoid file locks during installs.

## NPM cache

This repo uses a local cache (`.npm-cache`, ignored). If you see permission
errors from the global cache, clearing the local cache is usually enough:

```bash
rm -rf .npm-cache
```
