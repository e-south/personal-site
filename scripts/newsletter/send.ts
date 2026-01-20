import { parseArgs } from 'node:util';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

import { loadCliEnv, parsePositiveInt, requireEnv, requireUrl } from './env';
import { absolutizeUrl, resolveSlug } from './utils';

type SendArgs = {
  slug?: string;
  url?: string;
  'dry-run'?: boolean;
  'test-to'?: string;
  send?: boolean;
};

const args = parseArgs({
  options: {
    slug: { type: 'string' },
    url: { type: 'string' },
    'dry-run': { type: 'boolean' },
    'test-to': { type: 'string' },
    send: { type: 'boolean' },
  },
});

const values = args.values as SendArgs;
loadCliEnv();

let slug = '';
try {
  slug = resolveSlug(values.url, values.slug);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
if (!slug) {
  console.error('Provide --slug <slug> or an absolute /blog/<slug> URL.');
  process.exit(1);
}

const dryRun = values.send ? false : (values['dry-run'] ?? true);
const publicSiteUrl = values.url
  ? ''
  : requireUrl('PUBLIC_SITE_URL', { allowPath: false });
const normalizeBasePath = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith('/') || trimmed.endsWith('/')) {
    throw new Error(
      'PUBLIC_BASE_PATH must be empty or start with "/" and not end with "/".',
    );
  }
  return trimmed;
};
if (process.env.PUBLIC_BASE_PATH === undefined) {
  throw new Error('PUBLIC_BASE_PATH must be set (use "" for root).');
}
const basePath = normalizeBasePath(process.env.PUBLIC_BASE_PATH);
const canonicalUrl =
  values.url ??
  (publicSiteUrl ? `${publicSiteUrl}${basePath}/blog/${slug}` : '');

if (!canonicalUrl) {
  console.error('PUBLIC_SITE_URL is required when using --slug.');
  process.exit(1);
}

const run = (command: string, commandArgs: string[]) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: process.env,
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });

const distSegments = ['dist'];
if (basePath) {
  distSegments.push(basePath.replace(/^\/+/, ''));
}
distSegments.push('blog', slug, 'index.html');
const distPath = path.join(process.cwd(), ...distSegments);

const ensureBuild = async () => {
  if (existsSync(distPath)) return;
  requireEnv('PUBLIC_SITE_URL');
  await run('npm', ['run', 'build']);
};

const absolutizeLink = (url: string) => absolutizeUrl(url, canonicalUrl);

const inlineStyles = {
  h1: 'font-size:28px;line-height:1.2;margin:0 0 16px 0;',
  h2: 'font-size:22px;line-height:1.3;margin:24px 0 12px;',
  h3: 'font-size:18px;line-height:1.4;margin:20px 0 10px;',
  p: 'font-size:16px;line-height:1.6;margin:12px 0;',
  li: 'font-size:16px;line-height:1.6;margin:6px 0;',
  a: 'color:#7dd3fc;text-decoration:underline;',
  blockquote:
    'margin:16px 0;padding:8px 16px;border-left:3px solid #334155;color:#cbd5f5;',
  code: 'font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;font-size:0.95em;',
};

const renderEmailHtml = (
  contentHtml: string,
  title: string,
  preheader: string,
) =>
  `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#0b0b0b;color:#e5e7eb;font-family:ui-serif, Georgia, Cambria, Times, serif;">
    <div style="max-width:640px;margin:0 auto;padding:32px 24px;">
      <div style="font-size:12px;opacity:0.7;margin-bottom:16px;">${preheader}</div>
      <h1 style="${inlineStyles.h1}">${title}</h1>
      <p style="font-size:12px;margin:0 0 24px 0;">
        <a href="${canonicalUrl}" style="color:#7dd3fc;text-decoration:underline;">View in browser</a>
      </p>
      ${contentHtml}
    </div>
  </body>
</html>`;

const fetchJson = async (
  url: string,
  options: { method?: string; headers?: Record<string, string>; body?: string },
) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Request failed (${response.status}): ${message || response.statusText}`,
    );
  }
  return response.json();
};

const getListId = async (baseUrl: string, headers: Record<string, string>) => {
  const listId = process.env.LISTMONK_LIST_ID;
  if (listId) return parsePositiveInt(listId, 'LISTMONK_LIST_ID');

  const listUuid = process.env.LISTMONK_LIST_UUID;
  if (!listUuid) {
    throw new Error('LISTMONK_LIST_ID or LISTMONK_LIST_UUID is required.');
  }

  const payload = await fetchJson(`${baseUrl}/api/lists`, { headers });
  const lists =
    payload?.data?.results ?? payload?.data ?? payload?.results ?? [];
  const match = lists.find((list: { uuid?: string }) => list.uuid === listUuid);
  if (!match?.id) {
    throw new Error(`No list found for UUID ${listUuid}.`);
  }
  return Number(match.id);
};

const main = async () => {
  await ensureBuild();

  const html = await fs.readFile(distPath, 'utf-8');
  const $ = load(html);
  const article = $('[data-email-root]').first();

  if (!article.length) {
    throw new Error('Could not find [data-email-root] in built HTML.');
  }

  const title =
    article.find('h1').first().text().trim() ||
    $('title').first().text().trim() ||
    slug ||
    'Newsletter';
  const rawPreheader = article
    .find('p')
    .first()
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140);
  const preheader = rawPreheader || `New post: ${title}`;

  article.find('a').each((_, el) => {
    const href = $(el).attr('href');
    if (href) $(el).attr('href', absolutizeLink(href));
    $(el).attr('style', inlineStyles.a);
  });

  article.find('img').each((_, el) => {
    const src = $(el).attr('src');
    if (src) $(el).attr('src', absolutizeLink(src));
    $(el).attr('style', 'max-width:100%;height:auto;border-radius:12px;');
  });

  article.find('h1').attr('style', inlineStyles.h1);
  article.find('h2').attr('style', inlineStyles.h2);
  article.find('h3').attr('style', inlineStyles.h3);
  article.find('p').attr('style', inlineStyles.p);
  article.find('li').attr('style', inlineStyles.li);
  article.find('blockquote').attr('style', inlineStyles.blockquote);
  article.find('code').attr('style', inlineStyles.code);

  const contentHtml = article.html() ?? '';
  const emailHtml = renderEmailHtml(contentHtml, title, preheader);

  const outputDir = path.join(process.cwd(), 'dist', 'newsletter');
  await fs.mkdir(outputDir, { recursive: true });
  const outputPath = path.join(
    outputDir,
    `${slug ? slug.replace(/[^\w-]+/g, '-') : 'newsletter'}.html`,
  );
  await fs.writeFile(outputPath, emailHtml, 'utf-8');

  console.log(`Email HTML generated at ${outputPath}`);

  if (dryRun) {
    console.log('Dry run enabled. Skipping listmonk campaign creation.');
    return;
  }

  const baseUrl = requireUrl('LISTMONK_URL');
  const apiUser = requireEnv('LISTMONK_API_USER');
  const apiToken = requireEnv('LISTMONK_API_TOKEN');
  const fromEmail = requireEnv('LISTMONK_FROM_EMAIL');
  const authHeader =
    'Basic ' + Buffer.from(`${apiUser}:${apiToken}`).toString('base64');
  const headers = {
    Authorization: authHeader,
    'Content-Type': 'application/json',
  };
  const listId = await getListId(baseUrl, headers);

  const campaignPayload = {
    name: `Post: ${title}`,
    subject: title,
    lists: [listId],
    from_email: fromEmail,
    messenger: 'email',
    type: 'regular',
    content_type: 'html',
    body: emailHtml,
    alt_body: article.text().replace(/\s+/g, ' ').trim().slice(0, 2000),
  };

  const campaignResponse = await fetchJson(`${baseUrl}/api/campaigns`, {
    method: 'POST',
    headers,
    body: JSON.stringify(campaignPayload),
  });

  const campaignId = campaignResponse?.data?.id ?? campaignResponse?.id ?? null;

  if (!campaignId) {
    throw new Error('Campaign created but no ID was returned.');
  }

  console.log(`Campaign created: ${campaignId}`);

  if (values['test-to']) {
    const emails = values['test-to']
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);

    if (emails.length) {
      await fetchJson(`${baseUrl}/api/campaigns/${campaignId}/test`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ emails }),
      });
      console.log(`Test email sent to: ${emails.join(', ')}`);
    }
  }

  if (values.send) {
    await fetchJson(`${baseUrl}/api/campaigns/${campaignId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: 'running' }),
    });
    console.log('Campaign status set to running.');
  }
};

main().catch(() => {
  console.error('Newsletter send failed.');
  process.exit(1);
});
