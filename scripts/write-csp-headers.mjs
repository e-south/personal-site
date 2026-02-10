import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveAnalyticsEnv, resolveNewsletterEnv } from '../src/lib/env.mjs';

const INLINE_SCRIPT_PATTERN =
  /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
const INLINE_STYLE_PATTERN = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const HEADERS_FILENAME = '_headers';

const sortUnique = (values) => Array.from(new Set(values)).sort();

const listHtmlFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listHtmlFiles(fullPath);
      }
      return fullPath.endsWith('.html') ? [fullPath] : [];
    }),
  );
  return files.flat();
};

export const collectInlineScriptHashesFromHtml = (html) => {
  INLINE_SCRIPT_PATTERN.lastIndex = 0;
  const hashes = [];
  for (const match of html.matchAll(INLINE_SCRIPT_PATTERN)) {
    const source = match[1] ?? '';
    if (!source.trim()) {
      continue;
    }
    const digest = createHash('sha256').update(source, 'utf8').digest('base64');
    hashes.push(`'sha256-${digest}'`);
  }
  return sortUnique(hashes);
};

export const collectInlineStyleHashesFromHtml = (html) => {
  INLINE_STYLE_PATTERN.lastIndex = 0;
  const hashes = [];
  for (const match of html.matchAll(INLINE_STYLE_PATTERN)) {
    const source = match[1] ?? '';
    if (!source.trim()) {
      continue;
    }
    const digest = createHash('sha256').update(source, 'utf8').digest('base64');
    hashes.push(`'sha256-${digest}'`);
  }
  return sortUnique(hashes);
};

const toOrigin = (value) => {
  if (!value) {
    return null;
  }
  return new URL(value).origin;
};

const formatDirective = (name, sources) => `${name} ${sources.join(' ')}`;

/**
 * @param {{
 *   inlineScriptHashes?: string[];
 *   inlineStyleHashes?: string[];
 *   analyticsOrigin?: string | null;
 *   newsletterOrigin?: string | null;
 * }} [options]
 */
export const buildContentSecurityPolicy = ({
  inlineScriptHashes = [],
  inlineStyleHashes = [],
  analyticsOrigin,
  newsletterOrigin,
} = {}) => {
  const scriptSources = sortUnique([
    "'self'",
    'https://gc.zgo.at',
    ...inlineScriptHashes,
  ]);
  const connectSources = sortUnique([
    "'self'",
    'https://gc.zgo.at',
    ...(analyticsOrigin ? [analyticsOrigin] : []),
    ...(newsletterOrigin ? [newsletterOrigin] : []),
  ]);
  const formActionSources = sortUnique([
    "'self'",
    ...(newsletterOrigin ? [newsletterOrigin] : []),
  ]);
  const styleSources = sortUnique(["'self'", ...inlineStyleHashes]);

  return [
    "default-src 'self'",
    "img-src 'self' data: https:",
    formatDirective('style-src', styleSources),
    formatDirective('style-src-elem', styleSources),
    "style-src-attr 'unsafe-inline'",
    formatDirective('script-src', scriptSources),
    "script-src-attr 'none'",
    formatDirective('connect-src', connectSources),
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    formatDirective('form-action', formActionSources),
    'upgrade-insecure-requests',
  ].join('; ');
};

export const writeCspHeaders = async ({
  distDir = path.resolve(process.cwd(), 'dist'),
  env = process.env,
} = {}) => {
  const htmlFiles = await listHtmlFiles(distDir);
  const scriptHashSet = new Set();
  const styleHashSet = new Set();

  for (const filePath of htmlFiles) {
    const html = await readFile(filePath, 'utf-8');
    for (const hash of collectInlineScriptHashesFromHtml(html)) {
      scriptHashSet.add(hash);
    }
    for (const hash of collectInlineStyleHashesFromHtml(html)) {
      styleHashSet.add(hash);
    }
  }

  const analyticsEnv = resolveAnalyticsEnv(env);
  const newsletterEnv = resolveNewsletterEnv(env);
  const csp = buildContentSecurityPolicy({
    inlineScriptHashes: sortUnique(Array.from(scriptHashSet)),
    inlineStyleHashes: sortUnique(Array.from(styleHashSet)),
    analyticsOrigin: toOrigin(analyticsEnv.goatcounterEndpoint),
    newsletterOrigin: toOrigin(newsletterEnv.listmonkPublicBaseUrl),
  });

  const headerLines = ['/*', `  Content-Security-Policy: ${csp}`, ''];
  const headerPath = path.join(distDir, HEADERS_FILENAME);
  await writeFile(headerPath, headerLines.join('\n'));

  return {
    headerPath,
    csp,
    inlineScriptHashCount: scriptHashSet.size,
    inlineStyleHashCount: styleHashSet.size,
  };
};

const runAsScript = async () => {
  const { headerPath, inlineScriptHashCount, inlineStyleHashCount } =
    await writeCspHeaders();
  process.stdout.write(
    `[csp] wrote ${headerPath} with ${inlineScriptHashCount} inline script hash(es) and ${inlineStyleHashCount} inline style hash(es)\n`,
  );
};

const executedFilePath = process.argv[1] ? path.resolve(process.argv[1]) : null;
const currentFilePath = fileURLToPath(import.meta.url);

if (executedFilePath === currentFilePath) {
  runAsScript().catch((error) => {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown CSP header build error.';
    process.stderr.write(`[csp] ${message}\n`);
    process.exitCode = 1;
  });
}
