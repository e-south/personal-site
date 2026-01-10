import { defineCollection, z } from 'astro:content';
import { parseISODate } from '@/lib/dates';

const coerceDate = z.union([z.string(), z.date()]).transform((value, ctx) => {
  if (value instanceof Date) {
    return value;
  }
  try {
    return parseISODate(value);
  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        error instanceof Error ? error.message : 'Date must be valid ISO.',
    });
    return z.NEVER;
  }
});

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        date: coerceDate,
        excerpt: z.string(),
        tags: z.array(z.string()).default([]),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        featured: z.boolean().default(false),
        draft: z.boolean().default(false),
      })
      .refine((data) => !data.cover || data.coverAlt, {
        message: 'coverAlt is required when cover is set.',
        path: ['coverAlt'],
      }),
});

const projects = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        summary: z.string().optional(),
        status: z.enum(['active', 'completed', 'archived']).default('active'),
        tech: z.array(z.string()).default([]),
        links: z
          .object({
            repo: z.string().url().optional(),
            live: z.string().url().optional(),
            paper: z.string().url().optional(),
          })
          .optional(),
        image: image().optional(),
        imageAlt: z.string().optional(),
        featured: z.boolean().default(false),
      })
      .refine((data) => !data.image || data.imageAlt, {
        message: 'imageAlt is required when image is set.',
        path: ['imageAlt'],
      }),
});

const papers = defineCollection({
  type: 'content',
  schema: z
    .object({
      title: z.string(),
      authors: z.array(z.string()).min(1),
      venue: z.string(),
      year: z.number().int(),
      link: z.string().url().optional(),
      pdf: z.union([z.string().url(), z.string().regex(/^\//)]).optional(),
      abstract: z.string().optional(),
      featured: z.boolean().default(false),
    })
    .refine((data) => data.link || data.pdf, {
      message: 'Provide at least one of link or pdf.',
      path: ['link'],
    }),
});

const cv = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    updated: coerceDate.optional(),
  }),
});

const home = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    name: z.string(),
    locationLine: z.string(),
    headline: z.string().optional(),
    overview: z.string(),
  }),
});

const pageProjects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    intro: z.string(),
    interests: z.array(z.string()),
  }),
});

const pagePublications = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    intro: z.string(),
    scholarLabel: z.string(),
    selectedHeading: z.string(),
    note: z.string(),
  }),
});

const pageBlog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    intro: z.string(),
  }),
});

const pageContact = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    intro: z.string(),
  }),
});

const pageCv = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    intro: z.string(),
    downloadLabel: z.string(),
    cvPdf: z.string().min(1),
  }),
});

const links = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    email: z.string().email(),
    location: z.string(),
  }),
});

const story = defineCollection({
  type: 'content',
  schema: z
    .object({
      title: z.string(),
      ctaLabel: z.string().optional(),
      ctaHref: z.string().url().optional(),
    })
    .refine((data) => !(data.ctaLabel && !data.ctaHref), {
      message: 'ctaHref is required when ctaLabel is set.',
      path: ['ctaHref'],
    })
    .refine((data) => !(data.ctaHref && !data.ctaLabel), {
      message: 'ctaLabel is required when ctaHref is set.',
      path: ['ctaLabel'],
    }),
});

export const collections = {
  blog,
  projects,
  papers,
  cv,
  home,
  'page-projects': pageProjects,
  'page-publications': pagePublications,
  'page-blog': pageBlog,
  'page-contact': pageContact,
  'page-cv': pageCv,
  links,
  story,
};
