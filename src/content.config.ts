import { defineCollection, z } from 'astro:content';

const parseISODate = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      throw new Error(`Invalid date: ${value}`);
    }
    return date;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date;
};

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

const siteLink = z.object({
  label: z.string(),
  href: z.string(),
  key: z.string().optional(),
});

const site = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    name: z.string().optional(),
    headline: z.string().optional(),
    locationLine: z.string().optional(),
    imageCaption: z.string().optional(),
    microLine: z.string().optional(),
    intro: z.string().optional(),
    note: z.string().optional(),
    email: z.string().optional(),
    location: z.string().optional(),
    quickLinks: z.array(siteLink).default([]),
    externalLinks: z.array(siteLink).default([]),
    interests: z.array(z.string()).default([]),
    scholarLabel: z.string().optional(),
    selectedHeading: z.string().optional(),
    downloadLabel: z.string().optional(),
  }),
});

export const collections = { blog, projects, papers, cv, site };
