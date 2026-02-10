// Shared env parsing for build + runtime. Keep logic minimal and explicit.

const DEFAULT_DEV_SITE_URL = 'http://localhost:4321';
const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

const toTrimmedString = (value) =>
  typeof value === 'string' ? value.trim() : '';

const isLocalhostHostname = (hostname) =>
  LOCALHOST_HOSTNAMES.has(toTrimmedString(hostname).toLowerCase());

const normalizeBasePath = (value) => {
  const trimmed = toTrimmedString(value);
  if (trimmed === '') {
    return '';
  }
  if (!trimmed.startsWith('/') || trimmed.endsWith('/')) {
    throw new Error(
      'PUBLIC_BASE_PATH must be empty or start with "/" and not end with "/".',
    );
  }
  return trimmed;
};

const normalizeAbsoluteUrl = (
  value,
  label,
  { allowPath = true, allowHttpLocalhost = false } = {},
) => {
  const trimmed = toTrimmedString(value);
  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`${label} must be a valid absolute URL.`);
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error(`${label} must use http or https.`);
  }
  if (
    parsed.protocol === 'http:' &&
    (!allowHttpLocalhost || !isLocalhostHostname(parsed.hostname))
  ) {
    throw new Error(`${label} must use https unless hostname is localhost.`);
  }

  if (!allowPath) {
    if (parsed.pathname !== '/' || parsed.search || parsed.hash) {
      throw new Error(
        `${label} must not include a path/query/fragment. Use PUBLIC_BASE_PATH instead.`,
      );
    }
  }

  return parsed.toString().replace(/\/+$/, '');
};

const parseCsv = (value) =>
  toTrimmedString(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

export const resolvePublicSiteEnv = (env, { isDev } = {}) => {
  const siteRaw = env.PUBLIC_SITE_URL || '';
  const baseRaw = env.PUBLIC_BASE_PATH;
  const site = siteRaw || (isDev ? DEFAULT_DEV_SITE_URL : '');
  if (!site) {
    throw new Error(
      'PUBLIC_SITE_URL is required (e.g., https://example.com). Set it in .env.',
    );
  }
  const base = baseRaw ?? (isDev ? '' : undefined);
  if (base === undefined) {
    throw new Error(
      'PUBLIC_BASE_PATH is required (use "" for root deploys). Set it in .env.',
    );
  }

  const normalizedSite = normalizeAbsoluteUrl(site, 'PUBLIC_SITE_URL', {
    allowPath: false,
    allowHttpLocalhost: true,
  });
  const normalizedBase = normalizeBasePath(base);

  return {
    site: normalizedSite,
    base: normalizedBase,
  };
};

export const resolveNewsletterEnv = (env) => {
  const listUuids = parseCsv(env.PUBLIC_LISTMONK_LIST_UUIDS ?? '');
  const listUrlRaw = toTrimmedString(env.PUBLIC_LISTMONK_URL ?? '');
  const listUrl = listUrlRaw
    ? normalizeAbsoluteUrl(listUrlRaw, 'PUBLIC_LISTMONK_URL', {
        allowHttpLocalhost: true,
      })
    : '';

  if (listUrl && listUuids.length === 0) {
    throw new Error(
      'PUBLIC_LISTMONK_LIST_UUIDS must be set when PUBLIC_LISTMONK_URL is provided.',
    );
  }
  if (!listUrl && listUuids.length > 0) {
    throw new Error(
      'PUBLIC_LISTMONK_URL must be set when PUBLIC_LISTMONK_LIST_UUIDS is provided.',
    );
  }

  return {
    enabled: Boolean(listUrl) && listUuids.length > 0,
    listmonkPublicBaseUrl: listUrl,
    publicListUuids: listUuids,
  };
};

export const resolveAnalyticsEnv = (env) => {
  const endpointRaw = toTrimmedString(env.PUBLIC_GOATCOUNTER_ENDPOINT ?? '');
  const endpoint = endpointRaw
    ? normalizeAbsoluteUrl(endpointRaw, 'PUBLIC_GOATCOUNTER_ENDPOINT', {
        allowHttpLocalhost: true,
      })
    : '';

  return {
    goatcounterEndpoint: endpoint,
    showViewCounts: env.PUBLIC_GOATCOUNTER_VIEW_COUNTS === 'true',
  };
};

export { normalizeBasePath, normalizeAbsoluteUrl, parseCsv };
