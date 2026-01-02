import type { ResearchArea } from '@/types/research';

type ProfileConfig = {
  fullName: string;
  title: string;
  institute: string;
  authorName: string;
  about: string;
  research_areas: ResearchArea[];
};

type SocialConfig = {
  email: string;
  linkedin: string;
  x: string;
  github: string;
  gitlab: string;
  scholar: string;
  inspire: string;
  arxiv: string;
  orcid: string;
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

const research_areas: ResearchArea[] = [
  {
    title: 'Systems & Synthetic Biology',
    description:
      'Designing and tuning genetic circuits to steer cell physiology; transcriptional control; biosensors.',
    field: 'biology',
    image: '/images/research/EJS.png',
  },
  {
    title: 'Computational Regulatory Genomics',
    description:
      'DNA sequence-to-expression modeling; promoter design; CNNs for TF binding and expression prediction.',
    field: 'computer-science',
  },
  {
    title: 'High-Throughput Screening',
    description:
      'Pooled library design, robotics-driven assays, and NGS analysis to explore large design spaces.',
    field: 'engineering',
  },
  {
    title: 'Microbial Communities & Metabolism',
    description:
      'Cross-feeding yeast communities; pathway balancing for bioproduction.',
    field: 'biology',
  },
];

export const profile = {
  fullName: 'Eric J. South',
  title: 'PhD Candidate',
  institute: 'Boston University',
  authorName: 'Eric J. South', // used to highlight your name in papers
  // Short homepage blurb (used in Hero)
  about:
    'Eric J. South is a computational and synthetic biologist building experimental and computational workflows for genetic circuits, high-throughput assays, and sequence-to-expression modeling.',
  // Used for the interests strip on Projects
  research_areas,
} satisfies ProfileConfig;

// Set an empty string to hide any icon you don't want to display
export const social = {
  email: 'esouth@bu.edu',
  linkedin: 'https://www.linkedin.com/in/eric-south-xyz/',
  x: '',
  github: 'https://github.com/e-south',
  gitlab: '',
  scholar: '', // add your Google Scholar URL when ready
  inspire: '',
  arxiv: '',
  orcid: '',
} satisfies SocialConfig;

export const site = {
  publicSiteUrl: import.meta.env.PUBLIC_SITE_URL,
} satisfies SiteConfig;

const publicListUuids = (import.meta.env.PUBLIC_LISTMONK_LIST_UUIDS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

export const newsletter = {
  enabled: Boolean(import.meta.env.PUBLIC_LISTMONK_URL),
  listmonkPublicBaseUrl: import.meta.env.PUBLIC_LISTMONK_URL ?? '',
  publicListUuids,
} satisfies NewsletterConfig;

export const analytics = {
  goatcounterEndpoint: import.meta.env.PUBLIC_GOATCOUNTER_ENDPOINT ?? '',
  showViewCounts: import.meta.env.PUBLIC_GOATCOUNTER_VIEW_COUNTS === 'true',
} satisfies AnalyticsConfig;

export const template = {
  menu_left: false,
  transitions: true,
  darkTheme: 'dark',
  bodyFont: 'serif' as 'serif' | 'sans',
  displayFont: 'display' as 'display' | 'serif' | 'sans',
  proseFont: 'serif' as TemplateConfig['proseFont'],
  excerptLength: 200,
  postPerPage: 5,
} satisfies TemplateConfig;

export const seo = {
  default_title: 'Eric J. South - Computational & Synthetic Biology',
  default_description:
    'Computational and synthetic biologist building experimental and computational workflows for genetic circuits, high-throughput assays, and sequence-to-expression modeling.',
  default_image: '/images/astro-academia.png',
} satisfies SeoConfig;
