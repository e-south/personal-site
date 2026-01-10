import type { ImageMetadata } from 'astro';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import jmuBrunei from '@/assets/story/early-research/JMUBrunei.jpg';
import jmuSri from '@/assets/story/early-research/JMUSRI.jpg';
import jmuGraduation from '@/assets/story/discovering-synthetic-biology/JMUGraduation.jpg';
import mresCohort from '@/assets/story/discovering-synthetic-biology/MResCohort.jpg';
import crickGroup from '@/assets/story/imperial-crick-training/CrickGroup.jpg';
import crickBuilding from '@/assets/story/imperial-crick-training/CrickBuilding.jpg';
import imperialGroup from '@/assets/story/imperial-crick-training/ImperialGroup.jpg';
import crickStinger1Poster from '@/assets/story/imperial-crick-training/CrickStinger1-poster.jpg';
import crickStinger1Video from '@/assets/story/imperial-crick-training/CrickStinger1.mp4';
import crickStinger2Poster from '@/assets/story/imperial-crick-training/CrickStinger2-poster.jpg';
import crickStinger2Video from '@/assets/story/imperial-crick-training/CrickStinger2.mp4';
import londonCab from '@/assets/story/london-ecosystem/LondonCAB.jpg';
import londonSec from '@/assets/story/london-ecosystem/LondonSEC.jpg';
import dunlopLabSelfie from '@/assets/story/phd-at-boston-university/DunlopLabSelfie.jpg';
import belay from '@/assets/story/phd-at-boston-university/Belay.jpg';
import dunlopJugglingPoster from '@/assets/story/phd-at-boston-university/DunlopJuggling-poster.jpg';
import dunlopJugglingVideo from '@/assets/story/phd-at-boston-university/DunlopJuggling.mp4';
import lanzatechGroup from '@/assets/story/lanzatech-internship/LanzaTechGroup.jpg';
import lanzatechGasChamberPoster from '@/assets/story/lanzatech-internship/LanzaTechGasChamber-poster.jpg';
import lanzatechGasChamberVideo from '@/assets/story/lanzatech-internship/LanzaTechGasChamber.mp4';

const assetPath = (relativePath: string) =>
  resolve(process.cwd(), 'src', 'assets', relativePath);

type StoryMediaBase = {
  id: string;
  anchor?: string;
  frame?: 'sm' | 'md' | 'lg' | 'xl';
  assetPaths?: string[];
};

type StoryMediaLeafBase = StoryMediaBase & {
  alt: string;
  caption: string;
};

export type StoryMediaLeafItem =
  | (StoryMediaLeafBase & {
      kind: 'image';
      image: ImageMetadata;
    })
  | (StoryMediaLeafBase & {
      kind: 'video';
      src: string;
      poster: ImageMetadata;
    });

export type StoryMediaStackItem = StoryMediaBase & {
  kind: 'stack';
  items: StoryMediaLeafItem[];
  alt?: string;
  caption?: string;
};

export type StoryMediaItem = StoryMediaLeafItem | StoryMediaStackItem;

type StoryMediaLeafDefinition = StoryMediaLeafItem & { assetPaths: string[] };
type StoryMediaStackDefinition = StoryMediaStackItem & {
  assetPaths: string[];
  items: StoryMediaLeafDefinition[];
};
type StoryMediaDefinition =
  | StoryMediaLeafDefinition
  | StoryMediaStackDefinition;

const crickStinger1 = {
  id: 'imperial-crick-training-crick-stinger-1',
  kind: 'video',
  src: crickStinger1Video,
  poster: crickStinger1Poster,
  alt: 'Crick Institute stinger video.',
  caption:
    'Crick lab stinger — Biomek liquid handling + Singer ROTOR HDA colony picking for high-throughput yeast co-culture screens.',
  frame: 'lg',
  assetPaths: [
    assetPath('story/imperial-crick-training/CrickStinger1.mp4'),
    assetPath(
      '../assets/story/imperial-crick-training/CrickStinger1-poster.jpg',
    ),
  ],
} satisfies StoryMediaLeafDefinition;

const crickStinger2 = {
  id: 'imperial-crick-training-crick-stinger-2',
  kind: 'video',
  src: crickStinger2Video,
  poster: crickStinger2Poster,
  alt: 'Crick Institute stinger video.',
  caption:
    'Parallel co-culture assays helped us spot auxotroph pairs that struggled alone but grew synergistically together.',
  frame: 'lg',
  assetPaths: [
    assetPath('story/imperial-crick-training/CrickStinger2.mp4'),
    assetPath(
      '../assets/story/imperial-crick-training/CrickStinger2-poster.jpg',
    ),
  ],
} satisfies StoryMediaLeafDefinition;

const crickStingerStack = {
  id: 'imperial-crick-training-crick-stinger-stack',
  kind: 'stack',
  items: [crickStinger1, crickStinger2],
  alt: 'Crick Institute stinger videos.',
  assetPaths: [...crickStinger1.assetPaths, ...crickStinger2.assetPaths],
} satisfies StoryMediaStackDefinition;

const storyMediaById = {
  'early-research-jmu-brunei': {
    id: 'early-research-jmu-brunei',
    kind: 'image',
    image: jmuBrunei,
    alt: 'JMU Brunei photo.',
    caption:
      'Temburong Jungle, Brunei — long days of gibbon surveys and microhylid frog fieldwork with University of Brunei Darussalam students.',
    assetPaths: [assetPath('story/early-research/JMUBrunei.jpg')],
  },
  'early-research-jmu-sri': {
    id: 'early-research-jmu-sri',
    kind: 'image',
    image: jmuSri,
    alt: 'SRI International photo.',
    caption:
      'SRI Center for Macromolecular Bioscience — NSCLC tissue culture (H2009, H358, HBEC) plus peptide uptake assays read out by flow cytometry and Western blots.',
    assetPaths: [assetPath('story/early-research/JMUSRI.jpg')],
  },
  'discovering-synthetic-biology-jmu-graduation': {
    id: 'discovering-synthetic-biology-jmu-graduation',
    kind: 'image',
    image: jmuGraduation,
    alt: 'JMU graduation photo.',
    caption:
      'JMU graduation — launched an iGEM-inspired synbio course, led a mercury-sequestration E. coli design project, and earned the Excellence in Biotechnology Leadership award.',
    assetPaths: [
      assetPath(
        '../assets/story/discovering-synthetic-biology/JMUGraduation.jpg',
      ),
    ],
  },
  'discovering-synthetic-biology-mres-cohort': {
    id: 'discovering-synthetic-biology-mres-cohort',
    kind: 'image',
    image: mresCohort,
    alt: 'MRes cohort photo.',
    caption:
      'MRes cohort — Systems & Synthetic Biology at Imperial College London; so many great people here.',
    assetPaths: [
      assetPath('story/discovering-synthetic-biology/MResCohort.jpg'),
    ],
  },
  'imperial-crick-training-crick-stinger-1': crickStinger1,
  'imperial-crick-training-crick-stinger-2': crickStinger2,
  'imperial-crick-training-crick-stinger-stack': crickStingerStack,
  'imperial-crick-training-crick-group': {
    id: 'imperial-crick-training-crick-group',
    kind: 'image',
    image: crickGroup,
    alt: 'Crick Institute group photo.',
    caption:
      'Ralser group at the Crick — a systems biology home base, with shoutouts to Lucia, Huadong, and Simran (my R mentor).',
    assetPaths: [assetPath('story/imperial-crick-training/CrickGroup.jpg')],
  },
  'imperial-crick-training-crick-building': {
    id: 'imperial-crick-training-crick-building',
    kind: 'image',
    image: crickBuilding,
    alt: 'Francis Crick Institute building exterior.',
    caption:
      'MRes Systems & Synthetic Biology: modeling + systems/synbio modules, then a year-long project — graduated with Distinction, ranked 1st, and an Outstanding Student award.',
    assetPaths: [assetPath('story/imperial-crick-training/CrickBuilding.jpg')],
  },
  'imperial-crick-training-imperial-group': {
    id: 'imperial-crick-training-imperial-group',
    kind: 'image',
    image: imperialGroup,
    alt: 'Imperial College group photo.',
    caption:
      'Imperial bioengineering training — DNA assembly, PCR, cloning, primer design; huge thanks to Huadong for bench mentorship.',
    assetPaths: [assetPath('story/imperial-crick-training/ImperialGroup.jpg')],
  },
  'london-ecosystem-london-cab': {
    id: 'london-ecosystem-london-cab',
    kind: 'image',
    image: londonCab,
    alt: 'London CAB event photo.',
    caption:
      'London CAB nights — founders, students, and researchers mapping the local bioecosystem over good conversation.',
    assetPaths: [assetPath('story/london-ecosystem/LondonCAB.jpg')],
  },
  'london-ecosystem-london-sec': {
    id: 'london-ecosystem-london-sec',
    kind: 'image',
    image: londonSec,
    alt: 'Science Entrepreneur Club event photo.',
    caption:
      "Science Entrepreneur Club — outreach, events, and startup showcases across London's life-science scene.",
    assetPaths: [assetPath('story/london-ecosystem/LondonSEC.jpg')],
  },
  'phd-at-boston-university-dunlop-lab-selfie': {
    id: 'phd-at-boston-university-dunlop-lab-selfie',
    kind: 'image',
    image: dunlopLabSelfie,
    alt: 'Dunlop lab selfie.',
    caption: 'Dunlop lab crew — a quick lab selfie between experiments.',
    assetPaths: [
      assetPath('story/phd-at-boston-university/DunlopLabSelfie.jpg'),
    ],
  },
  'phd-at-boston-university-dunlop-juggling': {
    id: 'phd-at-boston-university-dunlop-juggling',
    kind: 'video',
    src: dunlopJugglingVideo,
    poster: dunlopJugglingPoster,
    alt: 'Dunlop lab juggling video.',
    caption: 'Dunlop lab juggling — because labs need levity too.',
    assetPaths: [
      assetPath('story/phd-at-boston-university/DunlopJuggling.mp4'),
      assetPath(
        '../assets/story/phd-at-boston-university/DunlopJuggling-poster.jpg',
      ),
    ],
  },
  'phd-at-boston-university-belay': {
    id: 'phd-at-boston-university-belay',
    kind: 'image',
    image: belay,
    alt: 'Belay photo.',
    caption: 'Belay day — finding balance outside the lab.',
    assetPaths: [assetPath('story/phd-at-boston-university/Belay.jpg')],
  },
  'lanzatech-internship-group': {
    id: 'lanzatech-internship-group',
    kind: 'image',
    image: lanzatechGroup,
    alt: 'LanzaTech group photo.',
    caption:
      'LanzaTech summer in Chicago — synthetic biology and host strain engineering.',
    assetPaths: [assetPath('story/lanzatech-internship/LanzaTechGroup.jpg')],
  },
  'lanzatech-internship-gas-chamber': {
    id: 'lanzatech-internship-gas-chamber',
    kind: 'video',
    src: lanzatechGasChamberVideo,
    poster: lanzatechGasChamberPoster,
    alt: 'LanzaTech gas fermentation chamber video.',
    caption:
      'Gas fermentation in action - Clostridium converting industrial gases into fuels and chemicals.',
    frame: 'lg',
    assetPaths: [
      assetPath('story/lanzatech-internship/LanzaTechGasChamber.mp4'),
      assetPath('story/lanzatech-internship/LanzaTechGasChamber-poster.jpg'),
    ],
  },
} satisfies Record<string, StoryMediaDefinition>;

export type StoryMediaId = keyof typeof storyMediaById;

export const storyChapterOrder = [
  'early-research',
  'discovering-synthetic-biology',
  'imperial-crick-training',
  'london-ecosystem',
  'phd-at-boston-university',
  'metabolic-pathway-control',
  'dynamic-control-systems',
  'computation-and-sequence-design',
] as const;

export type StoryChapterSlug = (typeof storyChapterOrder)[number];

export const storyChapterMedia = {
  'early-research': ['early-research-jmu-brunei', 'early-research-jmu-sri'],
  'discovering-synthetic-biology': [
    'discovering-synthetic-biology-jmu-graduation',
    'discovering-synthetic-biology-mres-cohort',
  ],
  'imperial-crick-training': [
    'imperial-crick-training-crick-stinger-stack',
    'imperial-crick-training-crick-group',
    'imperial-crick-training-crick-building',
    'imperial-crick-training-imperial-group',
  ],
  'london-ecosystem': [
    'london-ecosystem-london-cab',
    'london-ecosystem-london-sec',
  ],
  'phd-at-boston-university': [
    'phd-at-boston-university-dunlop-lab-selfie',
    'phd-at-boston-university-dunlop-juggling',
    'phd-at-boston-university-belay',
  ],
  'dynamic-control-systems': [],
  'metabolic-pathway-control': [
    'lanzatech-internship-gas-chamber',
    'lanzatech-internship-group',
  ],
  'computation-and-sequence-design': [],
} satisfies Record<StoryChapterSlug, readonly StoryMediaId[]>;

export type StoryRegistry = {
  order: readonly StoryChapterSlug[];
  chapterMedia: Record<StoryChapterSlug, readonly StoryMediaId[]>;
  mediaById: Record<StoryMediaId, StoryMediaItem>;
};

const stripAssetPaths = (item: StoryMediaDefinition): StoryMediaItem => {
  const { assetPaths, ...rest } = item;
  void assetPaths;
  if (item.kind === 'stack') {
    return {
      ...rest,
      items: item.items.map(stripAssetPaths),
    } as StoryMediaStackItem;
  }
  return rest as StoryMediaLeafItem;
};

const storyMediaByIdClean = Object.fromEntries(
  Object.entries(storyMediaById).map(([id, item]) => [
    id,
    stripAssetPaths(item),
  ]),
) as Record<StoryMediaId, StoryMediaItem>;

export const storyRegistry = {
  order: storyChapterOrder,
  chapterMedia: storyChapterMedia,
  mediaById: storyMediaByIdClean,
} satisfies StoryRegistry;

export const storyMedia = Object.values(storyMediaByIdClean);

const assertStoryRegistry = () => {
  const chapterOrderSet = new Set(storyChapterOrder);
  if (chapterOrderSet.size !== storyChapterOrder.length) {
    throw new Error('Story chapter order contains duplicates.');
  }

  const missingChapterKeys = storyChapterOrder.filter(
    (slug) => !(slug in storyChapterMedia),
  );
  if (missingChapterKeys.length > 0) {
    throw new Error(
      `Story chapter media map is missing entries for: ${missingChapterKeys.join(
        ', ',
      )}.`,
    );
  }

  const extraChapterKeys = Object.keys(storyChapterMedia).filter(
    (slug) => !chapterOrderSet.has(slug as StoryChapterSlug),
  );
  if (extraChapterKeys.length > 0) {
    throw new Error(
      `Story chapter media map has unknown chapters: ${extraChapterKeys.join(', ')}.`,
    );
  }

  Object.entries(storyChapterMedia).forEach(([slug, mediaIds]) => {
    const mediaSet = new Set(mediaIds);
    if (mediaSet.size !== mediaIds.length) {
      throw new Error(`Story chapter "${slug}" repeats media IDs.`);
    }
    mediaIds.forEach((id) => {
      if (!(id in storyMediaById)) {
        throw new Error(`Story media "${id}" is missing.`);
      }
    });
  });

  Object.entries(storyMediaById).forEach(([id, item]) => {
    if (item.kind === 'stack') {
      if (item.items.length === 0) {
        throw new Error(`Story media "${id}" stack is empty.`);
      }
      const itemIds = new Set<string>();
      item.items.forEach((stackItem) => {
        if (stackItem.kind === 'video' && !stackItem.poster) {
          throw new Error(`Story video "${stackItem.id}" is missing a poster.`);
        }
        if (itemIds.has(stackItem.id)) {
          throw new Error(`Story media "${id}" repeats items.`);
        }
        itemIds.add(stackItem.id);
        stackItem.assetPaths.forEach((path) => {
          if (!existsSync(path)) {
            throw new Error(
              `Story media "${stackItem.id}" is missing asset "${path}".`,
            );
          }
        });
      });
    } else if (item.kind === 'video' && !item.poster) {
      throw new Error(`Story video "${item.id}" is missing a poster.`);
    }

    item.assetPaths.forEach((path) => {
      if (!existsSync(path)) {
        throw new Error(`Story media "${id}" is missing asset "${path}".`);
      }
    });
  });
};

assertStoryRegistry();
