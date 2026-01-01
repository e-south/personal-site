const baseUrl = import.meta.env.BASE_URL;

const hasScheme = (value: string) => /^[a-z][a-z0-9+.-]*:/i.test(value);

export const withBase = (path: string) => {
  if (!path) {
    return baseUrl;
  }

  if (hasScheme(path)) {
    return path;
  }

  if (path.startsWith('#') || path.startsWith('?')) {
    return path;
  }

  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}${normalized}`;
};

export const toAbsoluteUrl = (path: string, site: string | URL) =>
  new URL(withBase(path), site).toString();
