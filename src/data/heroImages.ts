import type { ImageMetadata } from 'astro';

import photoOne from '@/assets/landing/WashingtonTower.jpg';
import photoTwo from '@/assets/landing/NewEnglandFall.jpg';
import photoThree from '@/assets/landing/Bernie.jpg';
import photoFour from '@/assets/landing/GelBench.jpg';

export const heroImages = [
  {
    image: photoOne,
    alt: 'Washington Tower at Mount Auburn National Cemetery.',
    caption: '',
  },
  {
    image: photoTwo,
    alt: 'Landing page photo 2.',
    caption: '',
  },
  {
    image: photoThree,
    alt: 'Bernie the dog.',
    caption: '',
  },
  {
    image: photoFour,
    alt: 'Landing page photo 4.',
    caption: '',
  },
] satisfies Array<{ image: ImageMetadata; alt: string; caption: string }>;
