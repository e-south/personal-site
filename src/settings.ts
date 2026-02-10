import {
  resolveAnalyticsEnv,
  resolveNewsletterEnv,
  resolvePublicSiteEnv,
} from '@/lib/env.mjs';

type ProfileConfig = {
  fullName: string;
  title: string;
  institute: string;
  authorName: string;
  about: string;
};

type TemplateConfig = {
  menu_left: boolean;
  transitions: boolean;
  darkTheme: string;
  bodyFont: 'serif' | 'sans';
  displayFont: 'display' | 'serif' | 'sans';
  proseFont: 'serif' | 'sans';
  excerptLength: number;
  postPerPage: number;
};

type SiteConfig = {
  publicSiteUrl: string;
};

type NewsletterConfig = {
  enabled: boolean;
  listmonkPublicBaseUrl: string;
  publicListUuids: string[];
};

type AnalyticsConfig = {
  goatcounterEndpoint: string;
  showViewCounts: boolean;
};

type SeoConfig = {
  default_title: string;
  default_description: string;
  default_image: string;
};

export const profile = {
  fullName: 'Eric J. South',
  title: 'PhD Candidate',
  institute: 'Boston University',
  authorName: 'Eric J. South', // used to highlight your name in papers
  // Short homepage blurb (used on the homepage when site copy omits intro)
  about:
    'Eric J. South is a computational and synthetic biologist building experimental and computational workflows for genetic circuits, high-throughput assays, and sequence-to-expression modeling.',
} satisfies ProfileConfig;

const { site: publicSiteUrl } = resolvePublicSiteEnv(import.meta.env, {
  isDev: import.meta.env.DEV,
});

export const site = {
  publicSiteUrl,
} satisfies SiteConfig;

const newsletterEnv = resolveNewsletterEnv(import.meta.env);

export const newsletter = {
  enabled: newsletterEnv.enabled,
  listmonkPublicBaseUrl: newsletterEnv.listmonkPublicBaseUrl,
  publicListUuids: newsletterEnv.publicListUuids,
} satisfies NewsletterConfig;

const analyticsEnv = resolveAnalyticsEnv(import.meta.env);

export const analytics = {
  goatcounterEndpoint: analyticsEnv.goatcounterEndpoint,
  showViewCounts: analyticsEnv.showViewCounts,
} satisfies AnalyticsConfig;

export const template = {
  menu_left: false,
  transitions: true,
  darkTheme: 'dark',
  bodyFont: 'sans' as 'serif' | 'sans',
  displayFont: 'serif' as 'display' | 'serif' | 'sans',
  proseFont: 'sans' as TemplateConfig['proseFont'],
  excerptLength: 200,
  postPerPage: 5,
} satisfies TemplateConfig;

export const seo = {
  default_title: 'Eric J. South - Computational & Synthetic Biology',
  default_description:
    'Computational and synthetic biologist building experimental and computational workflows for genetic circuits, high-throughput assays, and sequence-to-expression modeling.',
  default_image: '/images/astro-academia.png',
} satisfies SeoConfig;
