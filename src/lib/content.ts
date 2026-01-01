import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

import { trimExcerpt } from '@/lib/utils';
import { withBase } from '@/lib/urls';

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
};

const mapProjectRecord = (project: ProjectEntry): ProjectRecord => ({
  title: project.data.title,
  description: project.data.description,
  image: project.data.image,
  imageAlt: project.data.imageAlt,
  featured: project.data.featured,
  status: project.data.status,
});

const toProjectCard = ({
  title,
  description,
  image,
  imageAlt,
}: ProjectRecord): ProjectCard => ({
  title,
  description,
  image,
  imageAlt,
});

const getProjectRecords = async (): Promise<ProjectRecord[]> =>
  (await getCollection('projects')).map(mapProjectRecord);

export async function getPublishedBlogEntries(): Promise<BlogEntry[]> {
  return (await getCollection('blog'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getBlogListItems(): Promise<BlogListItem[]> {
  const posts = await getPublishedBlogEntries();
  return posts.map((post) => ({
    title: post.data.title,
    date: post.data.date,
    badge: post.data.tags[0],
    excerpt: trimExcerpt(post.data.excerpt),
    slug: withBase(`/blog/${post.slug}`),
    cover: post.data.cover,
    coverAlt: post.data.coverAlt,
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
  return (await getCollection('papers'))
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
      };
    });
}

export async function getRecentPapers(limit = 3): Promise<PaperItem[]> {
  return (await getPapers()).slice(0, limit);
}
