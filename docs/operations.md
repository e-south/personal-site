# Operations

This is the single, developer‑facing runbook for operating the site end‑to‑end.
It’s intentionally concise and host‑agnostic, with just enough narrative to
explain why each knob exists.

## Local setup

```bash
npm ci
cp .env.example .env
npm run dev
```

Required base env vars (for build/preview/verify/newsletter CLI):

- `PUBLIC_SITE_URL` (canonical URLs, sitemap, RSS, newsletter CLI)
- `PUBLIC_BASE_PATH` (`""` for root deploys or `"/base"` for subpaths)

Local dev defaults to `http://localhost:4321` + empty base when these are unset.

Optional features:

- Newsletter UI: set both `PUBLIC_LISTMONK_URL` and `PUBLIC_LISTMONK_LIST_UUIDS` (validated at build time)
- Analytics: `PUBLIC_GOATCOUNTER_ENDPOINT`, `PUBLIC_GOATCOUNTER_VIEW_COUNTS`

Newsletter CLI scripts auto-load `.env` (shell env overrides `.env`).

## Build + preview

```bash
npm run build
npm run preview
```

If build fails, verify `PUBLIC_SITE_URL` and `PUBLIC_BASE_PATH` are set and
point at the intended domain/subpath.

## Clean caches

```bash
npm run clean
```

Use this when content updates look stale or when Astro artifacts get out of
sync.

## Quality gate

```bash
npm run verify
```

This runs format/lint/typecheck/tests/build. Treat it as the pre‑deploy
baseline.

## Content authoring shortcuts

- New blog post (scaffold): `npm run content:new:blog -- --title "..." --excerpt "..."`
- Update CV date: `npm run content:cv:update` (edit `src/content/cv/cv.md` and add the PDF in `public/cv/` if you want the embed)
- Personalization copy: update `src/content/home/*.md`, `src/content/page-*/*.md`, `src/content/links/*.md`, and `src/settings.ts`

## Newsletter (listmonk)

Newsletter is RSS‑first: content lives in Astro, listmonk only delivers emails.
Keep the public list API exposed; never expose admin tokens in the browser.

### Local listmonk (Docker)

```bash
docker compose -f infra/listmonk/docker-compose.yml up -d
```

Then configure listmonk (see `docs/newsletter.md`):

- Create admin user.
- Create a **public** list and capture its UUID.
- Create an API user/token.
- Configure SMTP (provider‑agnostic).

### Production listmonk (host‑agnostic guidance)

If you deploy listmonk later, you only need a stable HTTPS base URL:
`PUBLIC_LISTMONK_URL=https://newsletter.example.com`

Keep a reverse proxy in front of listmonk, enable TLS, and lock down admin/API
access via Basic Auth or IP allow‑listing if possible.

### Sending a post

```bash
npm run newsletter:send -- --slug <slug> --dry-run
npm run newsletter:send -- --slug <slug> --test-to you@domain.com
npm run newsletter:send -- --slug <slug> --send
```

Or supply the absolute blog URL instead of a slug:

```bash
npm run newsletter:send -- --url https://example.com/blog/<slug> --dry-run
```

`--url` must be an absolute `/blog/<slug>` URL.

Required env vars for sending are in `.env.example` (LISTMONK\_\*).

### Newsletter health checks (as needed)

- UI reachable: open listmonk dashboard.
- Public list API: `curl $PUBLIC_LISTMONK_URL/api/public/lists`
- SMTP sanity: send a test campaign (`--test-to`) before a real send.
- Analytics: `npm run newsletter:stats -- --campaign-id <id>`

## Analytics (GoatCounter)

Analytics is optional and privacy‑friendly. Add a GoatCounter endpoint and the
script loads automatically in the base layout.

Enable:

```
PUBLIC_GOATCOUNTER_ENDPOINT=https://<yours>.goatcounter.com/count
PUBLIC_GOATCOUNTER_VIEW_COUNTS=true
```

Health checks:

- Confirm the script is present in page source.
- Check GoatCounter dashboard to ensure visits are being recorded.
- View counts render on blog posts when enabled.

## RSS

RSS is generated at `/rss.xml` and stays canonical for newsletters.

Health check:

```bash
curl -I $PUBLIC_SITE_URL/rss.xml
```

## Security + secrets policy

Even though this repo is private, treat secrets as if they could leak:

- Never commit `.env` or tokens.
- Store LISTMONK and SMTP secrets in a secure password manager.
- Rotate API tokens if a device is lost or access changes.
- Use the **public** list API only in the browser.
- Keep admin/API endpoints private behind auth or private network.

## Do‑not warnings (to avoid foot‑guns)

- Do not put listmonk admin credentials in frontend code.
- Do not rely on listmonk to build the site; the site must build without it.
- Do not set `PUBLIC_SITE_URL` with a path (use `PUBLIC_BASE_PATH` instead).
- Do not assume RSS is valid after editing templates — always spot‑check.

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
