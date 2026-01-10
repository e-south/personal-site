import type { ImageMetadata } from 'astro';

import photoOne from '@/assets/landing/WashingtonTower.jpg';
import photoTwo from '@/assets/landing/NewEnglandFall.jpg';
import photoThree from '@/assets/landing/Bernie.jpg';
import photoFour from '@/assets/landing/GelBench.jpg';

export const heroImages = [
  {
    image: photoOne,
    alt: 'Washington Tower at Mount Auburn National Cemetery.',
    caption:
      'Washington Tower in Mount Auburn National Cemetery, one of my favorite spots in Boston/Cambridge.',
  },
  {
    image: photoTwo,
    alt: 'Landing page photo 2',
    caption: '',
  },
  {
    image: photoThree,
    alt: 'Bernie the dog.',
    caption: "The dog's name is Bernie and yes he is a good boy.",
  },
  {
    image: photoFour,
    alt: 'Landing page photo 4',
    caption: 'Forget whether I took this due to positive or negative results.',
  },
] satisfies Array<{ image: ImageMetadata; alt: string; caption: string }>;
