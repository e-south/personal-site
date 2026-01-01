import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        date: z.coerce.date(),
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

export const collections = { blog, projects, papers };
