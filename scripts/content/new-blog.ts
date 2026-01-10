import { parseArgs } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ensureIsoDate,
  formatLocalISODate,
  slugify,
  yamlString,
} from './utils';

type BlogArgs = {
  title?: string;
  slug?: string;
  excerpt?: string;
  tags?: string;
  date?: string;
  cover?: string;
  'cover-alt'?: string;
  featured?: boolean;
  draft?: boolean;
};

const args = parseArgs({
  options: {
    title: { type: 'string' },
    slug: { type: 'string' },
    excerpt: { type: 'string' },
    tags: { type: 'string' },
    date: { type: 'string' },
    cover: { type: 'string' },
    'cover-alt': { type: 'string' },
    featured: { type: 'boolean' },
    draft: { type: 'boolean' },
  },
});

const values = args.values as BlogArgs;

const pathExists = async (target: string) => {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
};

export const buildBlogFrontmatter = (options: {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  cover?: string;
  coverAlt?: string;
  featured?: boolean;
  draft?: boolean;
}) => {
  const lines = [
    `title: ${yamlString(options.title)}`,
    `date: ${yamlString(options.date)}`,
    `excerpt: ${yamlString(options.excerpt)}`,
    `tags: [${options.tags.map((tag) => yamlString(tag)).join(', ')}]`,
  ];

  if (options.cover) {
    lines.push(`cover: ${yamlString(options.cover)}`);
  }
  if (options.coverAlt) {
    lines.push(`coverAlt: ${yamlString(options.coverAlt)}`);
  }
  if (options.featured) {
    lines.push('featured: true');
  }
  if (options.draft) {
    lines.push('draft: true');
  }

  return `---\n${lines.join('\n')}\n---\n\n# ${options.title}\n\n`;
};

export const createBlogPost = async (options: {
  slug: string;
  content: string;
}) => {
  const targetDir = path.join(
    process.cwd(),
    'src',
    'content',
    'blog',
    options.slug,
  );
  const targetFile = path.join(targetDir, 'index.md');

  if (await pathExists(targetFile)) {
    throw new Error(`Post already exists at ${targetFile}`);
  }

  await fs.mkdir(targetDir, { recursive: false });
  await fs.writeFile(targetFile, options.content, 'utf-8');

  return { targetDir, targetFile };
};

const main = async () => {
  const title = values.title?.trim();
  if (!title) {
    throw new Error('Provide --title "<title>".');
  }

  const excerpt = values.excerpt?.trim();
  if (!excerpt) {
    throw new Error('Provide --excerpt "<summary>".');
  }

  const slugInput = values.slug?.trim();
  const normalizedSlug = slugInput ? slugify(slugInput) : slugify(title);
  if (slugInput && normalizedSlug !== slugInput) {
    throw new Error(`--slug must be URL-safe. Suggested: ${normalizedSlug}`);
  }

  const date = values.date
    ? ensureIsoDate(values.date.trim())
    : formatLocalISODate();

  const tags = values.tags
    ? values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const cover = values.cover?.trim();
  const coverAlt = values['cover-alt']?.trim();

  if (cover && !coverAlt) {
    throw new Error('Provide --cover-alt when --cover is set.');
  }
  if (coverAlt && !cover) {
    throw new Error('Provide --cover when --cover-alt is set.');
  }

  const content = buildBlogFrontmatter({
    title,
    date,
    excerpt,
    tags,
    cover,
    coverAlt,
    featured: values.featured,
    draft: values.draft,
  });

  const { targetFile } = await createBlogPost({
    slug: normalizedSlug,
    content,
  });

  console.log(`Created ${targetFile}`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
