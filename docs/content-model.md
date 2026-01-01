# Content model

## Blog

Collection: src/content/blog

Fields:

- title (string)
- date (YYYY-MM-DD)
- excerpt (string)
- tags (string[])
- cover (image, optional)
- coverAlt (string, required when cover is set)
- featured (boolean, optional)
- draft (boolean, optional)

## Projects

Collection: src/content/projects

Fields:

- title (string)
- description (string)
- summary (string, optional)
- status (active | completed | archived)
- tech (string[], optional)
- links (object, optional)
  - repo (url, optional)
  - live (url, optional)
  - paper (url, optional)
- image (image, optional)
- imageAlt (string, required when image is set)
- featured (boolean, optional)

## Papers

Collection: src/content/papers

Fields:

- title (string)
- authors (string[])
- venue (string)
- year (number)
- link (url, optional)
- pdf (url or /public-relative path, optional)
- abstract (string, optional)
- featured (boolean, optional)

At least one of link or pdf is required for papers.

Tip: use a trailing `*` on author names to denote equal contribution; highlighting ignores trailing `*` and uses `profile.authorName` from `src/settings.ts`.
