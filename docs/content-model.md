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
- order (number, required)
- status (active | completed | archived)
- tech (string[], optional)
- links (object, optional)
  - repo (url, optional)
  - live (url, optional)
  - paper (url, optional)
- image (image, optional)
- imageAlt (string, required when image is set)
- banners (array, optional)
  - placement (above | below)
  - image (image)
  - alt (string)
  - caption (string, optional)
- publication (object, optional)
  - label (string)
  - links (array)
    - label (string)
    - href (url or /path)
- featured (boolean, optional)

Projects render in ascending `order`.
The Markdown body is rendered inside each project panel for narrative copy.

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

The CV page renders the Markdown body for a text version and embeds the PDF
specified by `cvPdf` in `src/content/page-cv/cv.md`. The PDF must exist in
`public/cv/` (use a `/cv/...` path).

## Page copy

Page copy is split into single-purpose collections so required fields are
validated during content sync.

Home

- Collection: `src/content/home`
- File: `home.md`
- Fields: title (string), name (string), locationLine (string), headline (string, optional), overview (string)

Projects page

- Collection: `src/content/page-projects`
- File: `projects.md`
- Fields: title (string), intro (string), interests (string[])

Publications page

- Collection: `src/content/page-publications`
- File: `publications.md`
- Fields: title (string), intro (string), scholarLabel (string), selectedHeading (string), note (string)

Blog page

- Collection: `src/content/page-blog`
- File: `blog.md`
- Fields: title (string), intro (string)

Contact page

- Collection: `src/content/page-contact`
- File: `contact.md`
- Fields: title (string), intro (string)

CV page copy

- Collection: `src/content/page-cv`
- File: `cv.md`
- Fields: title (string), intro (string), downloadLabel (string), cvPdf (string, required)

Links

- Collection: `src/content/links`
- File: `links.md`
- Fields: title (string), email (string), location (string)

Navigation and external profile links live in `src/data/navigation.ts` to keep
header links in one place.

## Content helpers

- New blog post: `npm run content:new:blog -- --title "..." --excerpt "..." [--tags "a,b"]`
- Update CV date: `npm run content:cv:update` (uses today; pass `--date YYYY-MM-DD` to override)
