# Analytics (GoatCounter)

This site uses GoatCounter for privacy-friendly analytics with minimal client-side footprint.

## Enable analytics

Set the GoatCounter endpoint in `.env` (see `.env.example`):

```
PUBLIC_GOATCOUNTER_ENDPOINT=https://<yours>.goatcounter.com/count
```

When set, the base layout injects the GoatCounter script tag.

## Optional view counts on blog posts

To display view counts on individual posts, enable:

```
PUBLIC_GOATCOUNTER_VIEW_COUNTS=true
```

This renders a small “Views: …” element on post pages, populated by GoatCounter in the browser.
