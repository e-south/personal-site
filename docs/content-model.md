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

## Publications (papers)

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

## CV

Collection: src/content/cv

Fields:

- title (string)
- updated (date, optional)

CV metadata lives here (title, updated date) while the page embeds a PDF from
`public/cv/Eric_South_CV.pdf`.

## Site copy

Collection: src/content/site

Each top-level page pulls narrative copy from a single Markdown file here:

- home.md
- projects.md
- publications.md
- cv.md
- contact.md
- blog.md
- links.md (email + location)

Fields (all optional unless noted):

- title (string, required)
- name (string)
- headline (string)
- locationLine (string)
- imageCaption (string)
- microLine (string)
- intro (string)
- note (string)
- email (string)
- location (string)
- quickLinks (array of { label, href })
- externalLinks (array of { label, href, key? })
- interests (string[])
- scholarLabel (string)
- selectedHeading (string)
- downloadLabel (string)

Navigation and external profile links live in `src/data/navigation.ts` to keep
header links in one place.
