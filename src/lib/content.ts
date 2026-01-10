import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

import { template } from '@/settings';
import { trimExcerpt } from '@/lib/utils';
import { withBase } from '@/lib/urls';
import { requireValue } from '@/lib/require';

type BlogEntry = CollectionEntry<'blog'>;
type ProjectEntry = CollectionEntry<'projects'>;

export type BlogListItem = {
  title: string;
  date: Date;
  badge?: string;
  excerpt: string;
  slug: string;
  cover?: BlogEntry['data']['cover'];
  coverAlt?: string;
};

export type ProjectCard = {
  title: string;
  description: string;
  summary?: string;
  tech: string[];
  links?: ProjectEntry['data']['links'];
  image?: ProjectEntry['data']['image'];
  imageAlt?: string;
};

type ProjectRecord = ProjectCard & {
  featured: boolean;
  status: ProjectEntry['data']['status'];
};

export type PaperItem = {
  title: string;
  authors: string[];
  venue: string;
  year: number;
  link?: string;
  abstract?: string;
  featured?: boolean;
};

let blogEntriesCache: BlogEntry[] | null = null;
let projectRecordsCache: ProjectRecord[] | null = null;
let papersCache: PaperItem[] | null = null;

const shouldUseCache = !import.meta.env.DEV;

const mapProjectRecord = (project: ProjectEntry): ProjectRecord => ({
  title: project.data.title,
  description: project.data.description,
  summary: project.data.summary,
  tech: project.data.tech,
  links: project.data.links,
  image: project.data.image,
  imageAlt: project.data.imageAlt,
  featured: project.data.featured,
  status: project.data.status,
});

const toProjectCard = ({
  title,
  description,
  summary,
  tech,
  links,
  image,
  imageAlt,
}: ProjectRecord): ProjectCard => ({
  title,
  description,
  summary,
  tech,
  links,
  image,
  imageAlt,
});

const getProjectRecords = async (): Promise<ProjectRecord[]> => {
  if (shouldUseCache && projectRecordsCache) {
    return projectRecordsCache;
  }

  const records = (await getCollection('projects')).map(mapProjectRecord);
  if (shouldUseCache) {
    projectRecordsCache = records;
  }
  return records;
};

export async function getPublishedBlogEntries(): Promise<BlogEntry[]> {
  if (shouldUseCache && blogEntriesCache) {
    return blogEntriesCache;
  }

  const entries = (await getCollection('blog'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  if (shouldUseCache) {
    blogEntriesCache = entries;
  }
  return entries;
}

export async function hasPublishedBlogPosts(): Promise<boolean> {
  const posts = await getPublishedBlogEntries();
  return posts.length > 0;
}

export async function getBlogListItems(): Promise<BlogListItem[]> {
  const posts = await getPublishedBlogEntries();
  return posts.map((post) => ({
    title: post.data.title,
    date: post.data.date,
    badge: post.data.tags[0],
    excerpt: trimExcerpt(post.data.excerpt, template.excerptLength),
    slug: withBase(`/blog/${post.slug}`),
    cover: post.data.cover,
    coverAlt: post.data.cover
      ? requireValue(post.data.coverAlt, `blog/${post.slug} coverAlt`)
      : undefined,
  }));
}

export async function getProjectCards(): Promise<ProjectCard[]> {
  return (await getProjectRecords()).map(toProjectCard);
}

export async function getFeaturedProjectCards(): Promise<ProjectCard[]> {
  return (await getProjectRecords())
    .filter((project) => project.featured)
    .map(toProjectCard);
}

export async function getProjectsByStatus(
  status: ProjectEntry['data']['status'],
): Promise<ProjectCard[]> {
  return (await getProjectRecords())
    .filter((project) => project.status === status)
    .map(toProjectCard);
}

export async function getPapers(): Promise<PaperItem[]> {
  if (shouldUseCache && papersCache) {
    return papersCache;
  }

  const papers = (await getCollection('papers'))
    .sort((a, b) => b.data.year - a.data.year)
    .map((paper) => {
      const link = paper.data.link ?? paper.data.pdf;
      return {
        title: paper.data.title,
        authors: paper.data.authors,
        venue: paper.data.venue,
        year: paper.data.year,
        link: link ? withBase(link) : undefined,
        abstract: paper.data.abstract,
        featured: paper.data.featured,
      };
    });
  if (shouldUseCache) {
    papersCache = papers;
  }
  return papers;
}

export async function getRecentPapers(limit = 3): Promise<PaperItem[]> {
  return (await getPapers()).slice(0, limit);
}

export async function getFeaturedPapers(limit = 4): Promise<PaperItem[]> {
  return (await getPapers()).filter((paper) => paper.featured).slice(0, limit);
}
