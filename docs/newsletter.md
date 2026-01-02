# Newsletter (listmonk)

This site uses listmonk for RSS-first email delivery. Content stays canonical in Astro; listmonk only delivers emails.

## Local setup (Docker)

From the repo root:

```
docker compose -f infra/listmonk/docker-compose.yml up -d
```

Open listmonk at http://localhost:9000. The container auto-installs on first run.

### Create an admin user

If the first-run wizard doesn’t appear, run:

```
docker compose -f infra/listmonk/docker-compose.yml exec listmonk ./listmonk --install --yes
```

Then visit http://localhost:9000 and log in.

### Create a public list

1. Go to **Lists** → **New**.
2. Create a list and enable **Public**.
3. Copy the list UUID (or ID) from the list details.

### Create an API user/token

1. Go to **Settings** → **Users**.
2. Create an API user and generate a token.
3. Store the username + token in environment variables.

### Configure SMTP (high‑level)

1. Go to **Settings** → **SMTP**.
2. Enter SMTP host, port, username, and password for your email provider.
3. Set a default “From” address.

## Site configuration

Set these in `.env` (see `.env.example`):

```
PUBLIC_LISTMONK_URL=http://localhost:9000
PUBLIC_LISTMONK_LIST_UUIDS=<comma-separated public list UUIDs>
```

The subscription form uses the public list UUIDs. If none are set, it will fetch public lists from listmonk at runtime.

The newsletter CLI scripts load `.env` automatically (shell environment variables override `.env`).

## Sending a post

Build email HTML and create/test/send a campaign:

```
npm run newsletter:send -- --slug <slug> --dry-run
npm run newsletter:send -- --slug <slug> --test-to you@domain.com
npm run newsletter:send -- --slug <slug> --send
```

You can also pass the full post URL instead of a slug:

```
npm run newsletter:send -- --url https://example.com/blog/<slug> --dry-run
```

`--url` must be an absolute `/blog/<slug>` URL.

Required environment for sending:

```
LISTMONK_URL=http://localhost:9000
LISTMONK_API_USER=<api-user>
LISTMONK_API_TOKEN=<api-token>
LISTMONK_FROM_EMAIL=you@example.com
LISTMONK_LIST_ID=<numeric list id>
PUBLIC_SITE_URL=https://example.com
PUBLIC_BASE_PATH=
```

Alternatively, use `LISTMONK_LIST_UUID` to resolve the list ID automatically.

## Embedding the Subscribe CTA

Use the component wherever appropriate:

```
<SubscribeCta />
```

It renders only when `newsletter.enabled` is true and `PUBLIC_LISTMONK_URL` is set.
