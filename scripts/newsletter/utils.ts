export const assertSlugSegment = (value: string) => {
  const slug = value.trim();
  if (!slug) {
    throw new Error('Slug must not be empty.');
  }
  if (/\s/.test(slug)) {
    throw new Error('Slug must not include whitespace.');
  }
  if (slug.includes('..')) {
    throw new Error('Slug must not include "..".');
  }
  if (slug.includes('/') || slug.includes('\\')) {
    throw new Error('Slug must be a single path segment.');
  }
  return slug;
};

export const resolveSlug = (inputUrl?: string, inputSlug?: string): string => {
  const slugInput = inputSlug?.trim();
  if (slugInput) return assertSlugSegment(slugInput);
  if (!inputUrl) return '';

  let pathname = '';
  try {
    pathname = new URL(inputUrl).pathname;
  } catch {
    throw new Error('--url must be a valid absolute URL.');
  }

  const segments = pathname.split('/').filter(Boolean);
  const blogIndex = segments.indexOf('blog');
  if (blogIndex < 0 || !segments[blogIndex + 1]) {
    return '';
  }

  return assertSlugSegment(segments[blogIndex + 1]);
};

export const absolutizeUrl = (raw: string, base: string) => {
  if (!raw) {
    throw new Error('Encountered an empty URL in the newsletter HTML.');
  }
  try {
    return new URL(raw, base).toString();
  } catch {
    throw new Error(`Invalid URL in newsletter HTML: ${raw}`);
  }
};
