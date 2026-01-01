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

Pre‑push runs the full `npm run verify` gate. Ensure `.env` is set so the build
can resolve `PUBLIC_SITE_URL` and `PUBLIC_BASE_PATH`.

## Dropbox + Git locks

If a `git push` succeeds but reports lock errors, your refs are usually stale
locally. Refresh them with:

```bash
git fetch origin dev/site-infra
```

To reduce lock contention in Dropbox:

- Prefer `git push origin HEAD` (avoids writing upstream config).
- Or use the helper script: `scripts/git-sync.sh` (push + fetch).
- Ensure the repo is marked “Available offline” in Dropbox.
- If the issue persists, consider excluding `.git/` from Dropbox sync (the
  working tree remains in Dropbox).

## NPM cache

This repo uses a local cache (`.npm-cache`, ignored). If you see permission
errors from the global cache, clearing the local cache is usually enough:

```bash
rm -rf .npm-cache
```
