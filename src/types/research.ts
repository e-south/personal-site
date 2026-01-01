import type { RESEARCH_ICONS } from '@/data/researchIcons';

export type ResearchField = keyof typeof RESEARCH_ICONS;

export type ResearchArea = {
  title: string;
  description: string;
  field: ResearchField;
  image?: string;
};
