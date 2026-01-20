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
import buCampus from '@/assets/story/phd-at-boston-university/CDS.jpeg';
import belay from '@/assets/story/phd-at-boston-university/Belay.jpg';
import dunlopJugglingPoster from '@/assets/story/phd-at-boston-university/DunlopJuggling-poster.jpg';
import dunlopJugglingVideo from '@/assets/story/phd-at-boston-university/DunlopJuggling.mp4';
import lanzatechGroup from '@/assets/story/lanzatech-internship/LanzaTechGroup.jpg';
import lanzatechGasChamberPoster from '@/assets/story/lanzatech-internship/LanzaTechGasChamber-poster.jpg';
import lanzatechGasChamberVideo from '@/assets/story/lanzatech-internship/LanzaTechGasChamber.mp4';
import dunlopLab from '@/assets/story/computation-and-sequence-design/DunlopLab.png';

const assetPath = (relativePath: string) =>
  resolve(process.cwd(), 'src', 'assets', relativePath);

type StoryMediaBase = {
  id: string;
  anchor?: string;
  frame?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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
  alt: 'Short lab workflow video from the Francis Crick Institute.',
  caption: '',
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
  alt: 'Short lab workflow video from the Francis Crick Institute.',
  caption: '',
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
  alt: 'Two short lab workflow videos from the Francis Crick Institute.',
  caption:
    'I got to design a physical workflow involving Biomek liquid handlers and the Singer ROTOR HDA colony picker (shown), enabling high-throughput yeast co-culturing assays.',
  assetPaths: [...crickStinger1.assetPaths, ...crickStinger2.assetPaths],
} satisfies StoryMediaStackDefinition;

const crickGroupMedia = {
  id: 'imperial-crick-training-crick-group',
  kind: 'image',
  image: crickGroup,
  alt: 'Group photo from the Ralser group at the Francis Crick Institute.',
  caption:
    'The Ralser group at the Francis Crick Institute was my systems biology home base, and I learned a lot from Lucia and Simran (thanks to them both!).',
  assetPaths: [assetPath('story/imperial-crick-training/CrickGroup.jpg')],
} satisfies StoryMediaLeafDefinition;

const imperialGroupMedia = {
  id: 'imperial-crick-training-imperial-group',
  kind: 'image',
  image: imperialGroup,
  alt: 'Training photo from Imperial College London.',
  caption:
    'At Imperial, PCR machines were in hot demand! Special thanks to Rodrigo and Huadong for their mentorship in DNA assembly and genetic circuit design.',
  assetPaths: [assetPath('story/imperial-crick-training/ImperialGroup.jpg')],
} satisfies StoryMediaLeafDefinition;

const crickImperialGroupStack = {
  id: 'imperial-crick-training-group-stack',
  kind: 'stack',
  items: [crickGroupMedia, imperialGroupMedia],
  alt: 'Group photos from the Francis Crick Institute and Imperial College London.',
  frame: 'xs',
  assetPaths: [...crickGroupMedia.assetPaths, ...imperialGroupMedia.assetPaths],
} satisfies StoryMediaStackDefinition;

const storyMediaById = {
  'early-research-jmu-brunei': {
    id: 'early-research-jmu-brunei',
    kind: 'image',
    image: jmuBrunei,
    alt: 'Field research photo from Temburong Jungle, Brunei.',
    caption: "In Brunei's Temburong Jungle.",
    assetPaths: [assetPath('story/early-research/JMUBrunei.jpg')],
  },
  'early-research-jmu-sri': {
    id: 'early-research-jmu-sri',
    kind: 'image',
    image: jmuSri,
    alt: 'Photo from SRI International laboratory work.',
    caption:
      'At SRI, I supported NSCLC cell culture (H2009, H358, HBEC) and ran peptide uptake assays.',
    assetPaths: [assetPath('story/early-research/JMUSRI.jpg')],
  },
  'discovering-synthetic-biology-jmu-graduation': {
    id: 'discovering-synthetic-biology-jmu-graduation',
    kind: 'image',
    image: jmuGraduation,
    alt: 'Graduation photo from James Madison University.',
    caption:
      'Pictured: Dr. Chris Berndsen (left) and me (right) (thanks for helping me take my first wet-lab steps, Chris!).',
    frame: 'sm',
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
    alt: 'MRes cohort photo at Imperial College London.',
    caption:
      'My MRes cohort in Systems and Synthetic Biology at Imperial College London.',
    assetPaths: [
      assetPath('story/discovering-synthetic-biology/MResCohort.jpg'),
    ],
  },
  'imperial-crick-training-crick-stinger-1': crickStinger1,
  'imperial-crick-training-crick-stinger-2': crickStinger2,
  'imperial-crick-training-crick-stinger-stack': crickStingerStack,
  'imperial-crick-training-crick-group': crickGroupMedia,
  'imperial-crick-training-crick-building': {
    id: 'imperial-crick-training-crick-building',
    kind: 'image',
    image: crickBuilding,
    alt: 'Exterior of the Francis Crick Institute building.',
    caption: 'Working at the Crick was such a fun experience.',
    frame: 'sm',
    assetPaths: [assetPath('story/imperial-crick-training/CrickBuilding.jpg')],
  },
  'imperial-crick-training-imperial-group': imperialGroupMedia,
  'imperial-crick-training-group-stack': crickImperialGroupStack,
  'london-ecosystem-london-cab': {
    id: 'london-ecosystem-london-cab',
    kind: 'image',
    image: londonCab,
    alt: 'Photo from a London CAB community event.',
    caption: '',
    assetPaths: [assetPath('story/london-ecosystem/LondonCAB.jpg')],
  },
  'london-ecosystem-london-sec': {
    id: 'london-ecosystem-london-sec',
    kind: 'image',
    image: londonSec,
    alt: 'Photo from a Science Entrepreneur Club event in London.',
    caption:
      'Shout out to the Science Entrepreneur Club. Dr. Fane Mensah (left) and I at a startup pitch competition.',
    assetPaths: [assetPath('story/london-ecosystem/LondonSEC.jpg')],
  },
  'phd-at-boston-university-campus': {
    id: 'phd-at-boston-university-campus',
    kind: 'image',
    image: buCampus,
    alt: 'Boston University campus photo.',
    caption: '',
    assetPaths: [assetPath('story/phd-at-boston-university/CDS.jpeg')],
  },
  'phd-at-boston-university-dunlop-juggling': {
    id: 'phd-at-boston-university-dunlop-juggling',
    kind: 'video',
    src: dunlopJugglingVideo,
    poster: dunlopJugglingPoster,
    alt: 'Short video from the Dunlop Lab.',
    caption: 'Learning how to juggle multiple research projects.',
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
    alt: 'Climbing belay photo.',
    caption: 'We had a solid climbing crew in the Dunlop lab!',
    frame: 'sm',
    assetPaths: [assetPath('story/phd-at-boston-university/Belay.jpg')],
  },
  'lanzatech-internship-group': {
    id: 'lanzatech-internship-group',
    kind: 'image',
    image: lanzatechGroup,
    alt: 'Group photo from a LanzaTech internship in Chicago.',
    caption:
      'Shout out to the NGS team at LanzaTech and a special thanks to Nick Fackler (center) for all his mentorship that summer.',
    assetPaths: [assetPath('story/lanzatech-internship/LanzaTechGroup.jpg')],
  },
  'lanzatech-internship-gas-chamber': {
    id: 'lanzatech-internship-gas-chamber',
    kind: 'video',
    src: lanzatechGasChamberVideo,
    poster: lanzatechGasChamberPoster,
    alt: 'Video of a gas fermentation setup at LanzaTech.',
    caption: 'Everything is a little bit harder in a glovebox.',
    frame: 'lg',
    assetPaths: [
      assetPath('story/lanzatech-internship/LanzaTechGasChamber.mp4'),
      assetPath('story/lanzatech-internship/LanzaTechGasChamber-poster.jpg'),
    ],
  },
  'computation-and-sequence-design-dunlop-lab': {
    id: 'computation-and-sequence-design-dunlop-lab',
    kind: 'image',
    image: dunlopLab,
    alt: 'Photo from the Dunlop Lab.',
    caption: '',
    frame: 'lg',
    assetPaths: [
      assetPath('story/computation-and-sequence-design/DunlopLab.png'),
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
    'imperial-crick-training-group-stack',
    'imperial-crick-training-crick-building',
  ],
  'london-ecosystem': [
    'london-ecosystem-london-sec',
    'london-ecosystem-london-cab',
  ],
  'phd-at-boston-university': [
    'phd-at-boston-university-campus',
    'phd-at-boston-university-dunlop-juggling',
    'phd-at-boston-university-belay',
  ],
  'metabolic-pathway-control': [
    'lanzatech-internship-gas-chamber',
    'lanzatech-internship-group',
  ],
  'computation-and-sequence-design': [
    'computation-and-sequence-design-dunlop-lab',
  ],
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
