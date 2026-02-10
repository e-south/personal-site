const baseUrl = import.meta.env.BASE_URL;

const SAFE_EXTERNAL_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);
const isInternalPath = (value: string) =>
  value.startsWith('/') && !value.startsWith('//');

export const hasScheme = (value: string) => /^[a-z][a-z0-9+.-]*:/i.test(value);

const getScheme = (value: string) => {
  const [scheme = ''] = value.split(':', 1);
  return scheme.toLowerCase();
};

export const isSafeExternalHref = (value: string) =>
  hasScheme(value) && SAFE_EXTERNAL_SCHEMES.has(getScheme(value));

export const sanitizeHref = (value: string) => {
  if (!value) {
    return '#';
  }
  if (isSafeExternalHref(value)) {
    return value;
  }
  if (isInternalPath(value) || value.startsWith('#') || value.startsWith('?')) {
    return value;
  }
  return '#';
};

export const withBase = (path: string) => {
  if (!path) {
    return baseUrl;
  }

  if (hasScheme(path)) {
    return isSafeExternalHref(path) ? path : baseUrl;
  }

  if (path.startsWith('#') || path.startsWith('?')) {
    return path;
  }

  if (!isInternalPath(path)) {
    return baseUrl;
  }

  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}${normalized}`;
};

export const toAbsoluteUrl = (path: string, site: string | URL) =>
  new URL(withBase(path), site).toString();
